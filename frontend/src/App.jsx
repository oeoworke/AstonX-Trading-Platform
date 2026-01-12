import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Terminal from './Terminal'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import Calendar from './Calendar'
import ProtectedRoute from './ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Private Routes (Login pannavanga mattum) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        /> {/* <--- Corrected closing tag */}
        
        <Route 
          path="/terminal" 
          element={
            <ProtectedRoute>
              <Terminal />
            </ProtectedRoute>
          } 
        />

        {/* Economic Calendar Route */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App