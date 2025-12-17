import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  LayoutDashboard, TrendingUp, Wallet, History, LogOut, Plus, X, User, Trash2, Upload
} from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Popup States
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  
  // Profile Picture States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const fileInputRef = useRef(null)

  // Fetch Data Function
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
          navigate('/login')
          return
      }
      const response = await axios.get('http://127.0.0.1:8000/api/user/', {
        headers: { Authorization: `Token ${token}` }
      })
      setUserData(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // --- PROFILE PICTURE LOGIC ---

  // 1. File Select Pannathum Upload panrathu
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profile_picture', file)

    try {
        const token = localStorage.getItem('token')
        await axios.post('http://127.0.0.1:8000/api/user/picture/', formData, {
            headers: { 
                Authorization: `Token ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        alert("Photo Updated!")
        fetchUserData() // Refresh to show new photo
        setIsProfileMenuOpen(false)
    } catch (error) {
        alert("Upload Failed")
    }
  }

  // 2. Photo Delete Panrathu
  const handleDeletePhoto = async () => {
    try {
        const token = localStorage.getItem('token')
        await axios.delete('http://127.0.0.1:8000/api/user/picture/', {
            headers: { Authorization: `Token ${token}` }
        })
        alert("Photo Deleted!")
        fetchUserData() // Refresh (Default icon will show)
        setIsDeleteConfirmOpen(false)
        setIsProfileMenuOpen(false)
    } catch (error) {
        alert("Delete Failed")
    }
  }

  // --- DEPOSIT LOGIC ---
  const handleDeposit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://127.0.0.1:8000/api/deposit/', 
        { amount: depositAmount }, 
        { headers: { Authorization: `Token ${token}` } }
      )
      alert(`Success! $${depositAmount} added.`)
      setIsDepositOpen(false)
      setDepositAmount('')
      fetchUserData()
    } catch (error) {
      alert("Deposit Failed.")
    }
  }

  if (loading) return <div className="text-white bg-[#0f172a] h-screen flex items-center justify-center">Loading...</div>

  const balance = parseFloat(userData?.wallet?.balance || 0)
  const leverage = userData?.wallet?.leverage || 100
  const usedMargin = 0.00
  const equity = balance 
  const freeMargin = equity - usedMargin

  // Profile Picture URL (Full Path)
  const profilePicUrl = userData?.profile_picture ? `http://127.0.0.1:8000${userData.profile_picture}` : null

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX.</h1>
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Menu</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-gray-800 text-white rounded-lg">
              <LayoutDashboard size={18} /> My Accounts
            </button>
            <button onClick={() => setIsDepositOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
              <Wallet size={18} /> Deposit / Withdraw
            </button>
            <button onClick={() => navigate('/terminal')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
              <TrendingUp size={18} /> Trading Terminal
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-all">
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#0f172a] p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Trading Accounts</h2>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-yellow-500">{userData?.full_name || userData?.username}</span></p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Total Equity:</span>
            <span className="text-xl font-bold text-white">${balance.toLocaleString()} USD</span>
            
            {/* --- PROFILE PICTURE SECTION --- */}
            <div className="relative">
                <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition focus:outline-none flex items-center justify-center bg-gray-800"
                >
                    {profilePicUrl ? (
                        <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-yellow-500">
                            {userData?.username?.charAt(0).toUpperCase()}
                        </span>
                    )}
                </button>

                {/* Profile Menu Dropdown */}
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                        >
                            <Upload size={16} /> Upload Photo
                        </button>

                        {profilePicUrl && (
                            <button 
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 border-t border-gray-700"
                            >
                                <Trash2 size={16} /> Remove Photo
                            </button>
                        )}
                    </div>
                )}
            </div>
            {/* ------------------------------- */}

          </div>
        </header>

        {/* Account Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/30">REAL</span>
                  <span className="text-gray-400 text-sm font-medium">Standard Account</span>
                </div>
                <h1 className="text-6xl font-bold text-white tracking-tight">${balance.toLocaleString()}<span className="text-2xl text-gray-500 font-normal">.00</span></h1>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/terminal')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-3 rounded-xl font-bold text-lg transition shadow-lg flex items-center gap-2">Trade</button>
                <button onClick={() => setIsDepositOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-10 py-3 rounded-xl font-bold transition border border-gray-600">Deposit</button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-gray-900/60 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm relative z-10">
                <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Equity</p><p className="text-xl font-bold text-white">${equity.toLocaleString()}</p></div>
                <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Used Margin</p><p className="text-xl font-bold text-white">${usedMargin.toFixed(2)}</p></div>
                <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Free Margin</p><p className="text-xl font-bold text-white">${freeMargin.toLocaleString()}</p></div>
                <div><p className="text-gray-400 text-xs uppercase font-bold mb-1">Leverage</p><p className="text-xl font-bold text-white">1:{leverage}</p></div>
            </div>
        </div>
      </div>

      {/* DELETE CONFIRM POPUP */}
      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Remove Photo?</h3>
                <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete your profile picture? This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setIsDeleteConfirmOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition">Cancel</button>
                    <button onClick={handleDeletePhoto} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition">Delete</button>
                </div>
            </div>
        </div>
      )}

      {/* DEPOSIT POPUP */}
      {isDepositOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Fund Your Account</h3>
                    <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleDeposit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
                        <input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white focus:border-yellow-500 outline-none font-bold text-lg" placeholder="1000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required />
                    </div>
                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition">Confirm Deposit</button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard