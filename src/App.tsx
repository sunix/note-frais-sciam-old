import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ReportFormPage from './pages/ReportFormPage'
import ExpenseListPage from './pages/ExpenseListPage'
import ExpenseFormPage from './pages/ExpenseFormPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/new" element={<ReportFormPage />} />
          <Route path="/reports/:id/edit" element={<ReportFormPage />} />
          <Route path="/reports/:id/expenses" element={<ExpenseListPage />} />
          <Route path="/reports/:id/expenses/new" element={<ExpenseFormPage />} />
          <Route path="/reports/:id/expenses/:expenseId/edit" element={<ExpenseFormPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
