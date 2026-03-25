import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { MONTHS } from '../utils/formatters'

const schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
})

type FormData = {
  firstName: string;
  lastName: string;
  month: number;
  year: number;
}

export default function ReportFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  })

  useEffect(() => {
    if (id) {
      db.reports.get(id).then((report) => {
        if (report) reset({ firstName: report.firstName, lastName: report.lastName, month: report.month, year: report.year })
      })
    }
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    const now = new Date().toISOString()
    if (isEdit && id) {
      const existing = await db.reports.get(id)
      if (existing) {
        await db.reports.put({ ...existing, ...data, updatedAt: now })
      }
      navigate(`/reports/${id}/expenses`)
    } else {
      const newId = uuidv4()
      await db.reports.put({
        id: newId,
        ...data,
        expenses: [],
        createdAt: now,
        updatedAt: now,
      })
      navigate(`/reports/${newId}/expenses`)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 text-sm">← Retour</button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Modifier' : 'Nouvelle'} note de frais</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input {...register('lastName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dupont" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input {...register('firstName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select {...register('month')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select {...register('year')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition">
          {isEdit ? 'Mettre à jour' : 'Créer la note'}
        </button>
      </form>
    </div>
  )
}
