import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Login from './pages/auth/Login'
import CreateExpense from './pages/expense/CreateExpense'
import EditExpense from './pages/expense/EditExpense'
import ItemiseWorkflow from './pages/expense/ItemiseWorkflow'
import ViewExpense from './pages/expense/ViewExpense'

//import './styles/index.scss';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateExpense />} />
            <Route path="/view" element={<ViewExpense />} />
            <Route path="/edit" element={<EditExpense />} />
            <Route path="/itemise" element={<ItemiseWorkflow />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
