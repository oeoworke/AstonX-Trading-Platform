import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Terminal from './Terminal'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import ProtectedRoute from './ProtectedRoute' // <--- Namma Guard

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Yaar venalum paakkalam) */}
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
        />
        
        <Route 
          path="/terminal" 
          element={
            <ProtectedRoute>
              <Terminal />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App