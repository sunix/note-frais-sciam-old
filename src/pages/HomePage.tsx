import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import type { ExpenseReport } from '../types'
import { formatCurrency, formatMonth } from '../utils/formatters'
import { generatePDF } from '../utils/pdf'

export default function HomePage() {
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const navigate = useNavigate()

  const load = async () => {
    const all = await db.reports.orderBy('createdAt').reverse().toArray()
    setReports(all)
  }

  useEffect(() => { load() }, [])

  const deleteReport = async (id: string) => {
    if (confirm('Supprimer cette note de frais ?')) {
      await db.reports.delete(id)
      load()
    }
  }

  const downloadPDF = async (report: ExpenseReport) => {
    const bytes = await generatePDF(report)
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `note-frais-${report.lastName}-${report.month}-${report.year}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = (report: ExpenseReport) => {
    const json = JSON.stringify(report, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `note-frais-${report.lastName}-${report.month}-${report.year}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const report: ExpenseReport = JSON.parse(text)
      report.updatedAt = new Date().toISOString()
      await db.reports.put(report)
      load()
    } catch {
      alert('Fichier JSON invalide')
    }
    e.target.value = ''
  }

  const totalAmount = (report: ExpenseReport) =>
    report.expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Note de Frais</h1>
        <div className="flex gap-2">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition">
            Importer JSON
            <input type="file" accept=".json" className="hidden" onChange={importJSON} />
          </label>
          <button
            onClick={() => navigate('/reports/new')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Nouvelle note
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucune note de frais</p>
          <p className="text-sm mt-1">Créez votre première note de frais</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {report.lastName.toUpperCase()} {report.firstName}
                  </h2>
                  <p className="text-blue-600 text-sm">{formatMonth(report.month, report.year)}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {report.expenses.length} dépense{report.expenses.length !== 1 ? 's' : ''} —{' '}
                    <span className="font-semibold text-gray-700">{formatCurrency(totalAmount(report))}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/reports/${report.id}/expenses`)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    Dépenses
                  </button>
                  <button
                    onClick={() => navigate(`/reports/${report.id}/edit`)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => downloadPDF(report)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportJSON(report)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
