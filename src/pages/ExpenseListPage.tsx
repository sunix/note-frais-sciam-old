import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db'
import type { ExpenseReport } from '../types'
import { formatCurrency, formatMonth } from '../utils/formatters'
import { generatePDF } from '../utils/pdf'

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function ExpenseListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<ExpenseReport | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    const r = await db.reports.get(id)
    setReport(r ?? null)
  }, [id])

  useEffect(() => { load() }, [load])

  const deleteExpense = async (expenseId: string) => {
    if (!report || !confirm('Supprimer cette dépense ?')) return
    const updated = {
      ...report,
      expenses: report.expenses.filter((e) => e.id !== expenseId),
      updatedAt: new Date().toISOString(),
    }
    await db.reports.put(updated)
    setReport(updated)
  }

  const downloadPDF = async () => {
    if (!report) return
    const bytes = await generatePDF(report)
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `note-frais-${report.lastName}-${report.month}-${report.year}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!report) return <div className="p-4 text-gray-500">Chargement...</div>

  const sorted = [...report.expenses].sort((a, b) => a.date.localeCompare(b.date))
  const grouped = new Map<string, typeof sorted>()
  for (const exp of sorted) {
    const arr = grouped.get(exp.date) ?? []
    arr.push(exp)
    grouped.set(exp.date, arr)
  }
  const grandTotal = sorted.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 text-sm">← Retour</button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {report.lastName.toUpperCase()} {report.firstName}
            </h1>
            <p className="text-blue-600 text-sm">{formatMonth(report.month, report.year)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Générer PDF
          </button>
          <button
            onClick={() => navigate(`/reports/${id}/expenses/new`)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>Aucune dépense</p>
          <p className="text-sm mt-1">Ajoutez votre première dépense</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([date, expenses]) => {
            const dayTotal = expenses.reduce((s, e) => s + e.amount, 0)
            return (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 flex justify-between items-center">
                  <span className="font-semibold text-blue-800 text-sm">{formatDate(date)}</span>
                  <span className="text-blue-600 text-sm font-medium">{formatCurrency(dayTotal)}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{expense.type}</span>
                          {expense.receipts.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              {expense.receipts.length} justif.
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{expense.establishment}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700">{formatCurrency(expense.amount)}</span>
                        <button
                          onClick={() => navigate(`/reports/${id}/expenses/${expense.id}/edit`)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Suppr.
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-blue-700 text-white rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="font-bold">TOTAL</span>
            <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
