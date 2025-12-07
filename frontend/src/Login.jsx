import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Django Login API Call
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username, // Namma Email use pannaalum Django username field thaan kekkum
        password: password
      })
      
      // Token kidaithal, athai save pannikalam
      localStorage.setItem('token', response.data.token)
      alert("Login Success!")
      navigate('/terminal') // Success aanal Terminal-ku po
    } catch (error) {
      alert("Invalid Credentials!")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-500">Welcome Back</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email / Username</label>
            <input 
              type="text" 
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition">
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login