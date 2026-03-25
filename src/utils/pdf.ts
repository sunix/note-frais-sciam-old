import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ExpenseReport } from '../types';
import { formatCurrency, formatMonth } from './formatters';

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generatePDF(report: ExpenseReport): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page dimensions (A4)
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const tableLeft = margin;
  const tableWidth = pageWidth - 2 * margin;

  // Sort expenses by date
  const sortedExpenses = [...report.expenses].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Group by date
  const grouped: Map<string, typeof sortedExpenses> = new Map();
  for (const expense of sortedExpenses) {
    const arr = grouped.get(expense.date) ?? [];
    arr.push(expense);
    grouped.set(expense.date, arr);
  }

  const total = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // --- Page 1: Summary ---
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  page1.drawText('Note de Frais', {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.12, 0.25, 0.69),
  });
  y -= 28;

  page1.drawText(`Nom : ${report.lastName.toUpperCase()} ${report.firstName}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 18;

  page1.drawText(`Mois : ${formatMonth(report.month, report.year)}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 28;

  // Table header
  const colWidths = [120, 80, 160, 80, 75];
  const colHeaders = ['Type', 'Date', 'Établissement', 'Montant', 'Sous-total'];
  const colX = [tableLeft];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colX.push(colX[colX.length - 1] + colWidths[i]);
  }

  const rowHeight = 20;

  // Header row background
  page1.drawRectangle({
    x: tableLeft,
    y: y - rowHeight + 4,
    width: tableWidth,
    height: rowHeight,
    color: rgb(0.12, 0.25, 0.69),
  });

  for (let i = 0; i < colHeaders.length; i++) {
    page1.drawText(colHeaders[i], {
      x: colX[i] + 4,
      y: y - 12,
      size: 9,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }
  y -= rowHeight;

  // Table rows
  let rowIndex = 0;
  for (const [date, expenses] of grouped) {
    const dayTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      const isLast = i === expenses.length - 1;
      const bgColor = rowIndex % 2 === 0 ? rgb(0.95, 0.97, 1) : rgb(1, 1, 1);

      page1.drawRectangle({
        x: tableLeft,
        y: y - rowHeight + 4,
        width: tableWidth,
        height: rowHeight,
        color: bgColor,
      });

      const values = [
        expense.type,
        formatDate(expense.date),
        expense.establishment.length > 22
          ? expense.establishment.substring(0, 22) + '…'
          : expense.establishment,
        formatCurrency(expense.amount),
        isLast ? formatCurrency(dayTotal) : '',
      ];

      for (let j = 0; j < values.length; j++) {
        page1.drawText(values[j], {
          x: colX[j] + 4,
          y: y - 12,
          size: 9,
          font: j === 4 && isLast ? fontBold : font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
      y -= rowHeight;
      rowIndex++;
    }
    // suppress unused variable warning
    void date;
    void dayTotal;
  }

  // Total row
  y -= 4;
  page1.drawRectangle({
    x: tableLeft,
    y: y - rowHeight + 4,
    width: tableWidth,
    height: rowHeight,
    color: rgb(0.12, 0.25, 0.69),
  });

  page1.drawText('TOTAL', {
    x: colX[3] + 4,
    y: y - 12,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(formatCurrency(total), {
    x: colX[4] + 4,
    y: y - 12,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // --- Receipt pages ---
  for (const expense of sortedExpenses) {
    for (const receipt of expense.receipts) {
      const receiptPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let imageEmbed;
      try {
        const imgBytes = dataUrlToUint8Array(receipt.dataUrl);
        if (receipt.mimeType === 'image/png') {
          imageEmbed = await pdfDoc.embedPng(imgBytes);
        } else {
          imageEmbed = await pdfDoc.embedJpg(imgBytes);
        }
      } catch {
        continue;
      }

      const maxW = pageWidth - 2 * margin;
      const maxH = pageHeight - 2 * margin - 80;
      const scale = Math.min(maxW / imageEmbed.width, maxH / imageEmbed.height, 1);
      const imgW = imageEmbed.width * scale;
      const imgH = imageEmbed.height * scale;
      const imgX = (pageWidth - imgW) / 2;
      const imgY = (pageHeight - imgH) / 2 + 20;

      receiptPage.drawImage(imageEmbed, {
        x: imgX,
        y: imgY,
        width: imgW,
        height: imgH,
      });

      // Metadata at bottom
      const metaY = margin + 40;
      receiptPage.drawText(`Date : ${formatDate(expense.date)}   Type : ${expense.type}   Établissement : ${expense.establishment}   Montant : ${formatCurrency(expense.amount)}`, {
        x: margin,
        y: metaY,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      receiptPage.drawText(`Fichier : ${receipt.name}`, {
        x: margin,
        y: metaY - 14,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  return pdfDoc.save();
}
