import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    national_id: '',
    password: ''
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        ...formData,
        username: formData.email // Username-kku email-aye anuppurom
      })
      alert("Account Created! Please Login.")
      navigate('/login')
    } catch (error) {
      alert("Registration Failed. Email might be taken.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl flex overflow-hidden max-w-5xl w-full border border-gray-700">
        
        {/* Left Side - Image (Register-il Left side-il vaithullom) */}
        <div className="hidden md:block w-5/12 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=1974&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/40 to-black/90 flex flex-col justify-end p-12">
            <h3 className="text-3xl font-bold text-white mb-2">Start Your Journey</h3>
            <p className="text-gray-300">Create your free account and access global markets instantly.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-6">Enter your details to get started with AstonX.</p>
          
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
              <input type="text" name="full_name" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
              <input type="email" name="email" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
              <input type="text" name="phone_number" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
              <input type="text" name="country" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>

            {/* National ID */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">National ID / Passport No</label>
              <input type="text" name="national_id" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
              <input type="password" name="password" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none" required />
            </div>
            
            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
                <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition transform hover:scale-[1.01]">
                Register Now
                </button>
            </div>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold ml-1">Login</Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Register