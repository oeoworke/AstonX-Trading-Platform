import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      // Username-ukkum email-aye anuppurom (Easy-kaga)
      await axios.post('http://127.0.0.1:8000/api/register/', {
        email: email,
        username: email, 
        password: password
      })
      alert("Registration Success! Please Login.")
      navigate('/login')
    } catch (error) {
      alert("Error: Email might be already taken.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-yellow-500">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded font-bold transition">
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account? <Link to="/login" className="text-yellow-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register