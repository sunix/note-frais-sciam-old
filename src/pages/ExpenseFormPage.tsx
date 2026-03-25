import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import type { ExpenseReport, ExpenseItem, ReceiptImage } from '../types'
import { EXPENSE_TYPES } from '../types'

const schema = z.object({
  type: z.string().min(1, 'Type requis'),
  date: z.string().min(1, 'Date requise'),
  establishment: z.string().min(1, 'Établissement requis'),
  amount: z.coerce.number().positive('Montant invalide'),
})

type FormData = {
  type: string;
  date: string;
  establishment: string;
  amount: number;
}

export default function ExpenseFormPage() {
  const { id, expenseId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(expenseId)
  const [report, setReport] = useState<ExpenseReport | null>(null)
  const [receipts, setReceipts] = useState<ReceiptImage[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      type: 'Déjeuner',
      date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (!id) return
    db.reports.get(id).then((r) => {
      if (!r) return
      setReport(r)
      if (expenseId) {
        const exp = r.expenses.find((e) => e.id === expenseId)
        if (exp) {
          reset({ type: exp.type, date: exp.date, establishment: exp.establishment, amount: exp.amount })
          setReceipts(exp.receipts)
        }
      }
    })
  }, [id, expenseId, reset])

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newReceipts: ReceiptImage[] = []
    for (const file of files) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      newReceipts.push({ id: uuidv4(), name: file.name, mimeType: file.type, dataUrl })
    }
    setReceipts((prev) => [...prev, ...newReceipts])
    e.target.value = ''
  }

  const removeReceipt = (receiptId: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId))
  }

  const onSubmit = async (data: FormData) => {
    if (!report) return
    const now = new Date().toISOString()
    let updatedExpenses: ExpenseItem[]

    if (isEdit && expenseId) {
      updatedExpenses = report.expenses.map((e) =>
        e.id === expenseId ? { ...e, ...data, receipts } : e
      )
    } else {
      const newExpense: ExpenseItem = { id: uuidv4(), ...data, receipts }
      updatedExpenses = [...report.expenses, newExpense]
    }

    await db.reports.put({ ...report, expenses: updatedExpenses, updatedAt: now })
    navigate(`/reports/${id}/expenses`)
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/reports/${id}/expenses`)} className="text-blue-600 hover:text-blue-800 text-sm">← Retour</button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Modifier' : 'Ajouter'} une dépense</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {EXPENSE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" {...register('date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
          <input {...register('establishment')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Restaurant, café, etc." />
          {errors.establishment && <p className="text-red-500 text-xs mt-1">{errors.establishment.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
          <input type="number" step="0.01" {...register('amount')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Receipts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Justificatifs</label>
          <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition">
            📎 Ajouter des images
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleReceiptUpload} />
          </label>

          {receipts.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="relative group">
                  <img
                    src={receipt.dataUrl}
                    alt={receipt.name}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeReceipt(receipt.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-400 truncate mt-1">{receipt.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition">
          {isEdit ? 'Mettre à jour' : 'Ajouter la dépense'}
        </button>
      </form>
    </div>
  )
}
