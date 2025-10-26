import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import InstallPrompt from './components/InstallPrompt'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import ReportDetailPage from './pages/ReportDetailPage'
import AssignmentsPage from './pages/AssignmentsPage'
import MyAssignmentsPage from './pages/MyAssignmentsPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/reports/:id" element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/assignments" element={
              <ProtectedRoute roles={['admin', 'dispatcher']}>
                <AssignmentsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/my-assignments" element={
              <ProtectedRoute roles={['field_officer']}>
                <MyAssignmentsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin', 'managerial']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          <InstallPrompt />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
