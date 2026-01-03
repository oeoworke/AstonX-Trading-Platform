import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  LayoutDashboard, TrendingUp, Wallet, History, LogOut, X, Trash2, Upload, Database, RefreshCw, Cpu, Brain, Zap, ChevronDown 
} from 'lucide-react'
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  
  // --- AI & ASSET STATES ---
  const [aiPrediction, setAiPrediction] = useState(null)
  const [isPredicting, setIsPredicting] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [availableAssets, setAvailableAssets] = useState([]) // Backend-il irundhu assets-ai edukka

  // View State (Accounts view or History view)
  const [view, setView] = useState('overview') 
  
  // Data States
  const [chartData, setChartData] = useState([])
  const [closedOrders, setClosedOrders] = useState([])

  // Popup States
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  
  // Profile Picture States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const fileInputRef = useRef(null)

  // --- FETCH DATA (Unified Function) ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
          navigate('/login')
          return
      }
      const config = { headers: { Authorization: `Token ${token}` } }

      // 1. Fetch User Profile
      const userRes = await axios.get('http://127.0.0.1:8000/api/user/', config)
      setUserData(userRes.data)

      // 2. Fetch Chart Data (Snapshot Points)
      const chartRes = await axios.get('http://127.0.0.1:8000/api/trade/chart/', config)
      setChartData(chartRes.data)

      // 3. Fetch History (Closed Trades Only)
      const historyRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=CLOSED', config)
      setClosedOrders(historyRes.data)

      // 4. Fetch All Available Assets for Dropdown
      const assetsRes = await axios.get('http://127.0.0.1:8000/api/assets/', config)
      setAvailableAssets(assetsRes.data)

      // 5. Initial AI Prediction fetch
      fetchAiPrediction('BTC')

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  // --- FETCH AI PREDICTION ---
  const fetchAiPrediction = async (symbol) => {
    setIsPredicting(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Token ${token}` } }
      const res = await axios.get(`http://127.0.0.1:8000/api/ai-predict/?symbol=${symbol}`, config)
      setAiPrediction(res.data)
      setSelectedSymbol(symbol) // State-ai update panrom
    } catch (error) {
      console.error("AI Prediction failed:", error)
      setAiPrediction({ prediction: 'ERROR', confidence: 'N/A' })
    }
    setIsPredicting(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // --- BULK SYNC FUNCTION ---
  const handleBulkSync = async () => {
    setIsSyncing(true)
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://127.0.0.1:8000/api/ai/bulk-sync/', {}, {
            headers: { Authorization: `Token ${token}` }
        })
        alert(res.data.message)
        fetchAiPrediction(selectedSymbol) 
    } catch (error) {
        alert("Sync Failed! Please check your connection.")
    }
    setIsSyncing(false)
  }

  // --- PROFILE PICTURE LOGIC ---
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
        fetchData()
        setIsProfileMenuOpen(false)
    } catch (error) { alert("Upload Failed") }
  }

  const handleDeletePhoto = async () => {
    try {
        const token = localStorage.getItem('token')
        await axios.delete('http://127.0.0.1:8000/api/user/picture/', {
            headers: { Authorization: `Token ${token}` }
        })
        alert("Photo Deleted!")
        fetchData()
        setIsDeleteConfirmOpen(false)
        setIsProfileMenuOpen(false)
    } catch (error) { alert("Delete Failed") }
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
      fetchData()
    } catch (error) { alert("Deposit Failed.") }
  }

  if (loading) return <div className="text-white bg-[#0f172a] h-screen flex items-center justify-center tracking-widest font-bold">LOADING DASHBOARD...</div>

  const balance = parseFloat(userData?.wallet?.balance || 0)
  const leverage = userData?.wallet?.leverage || 100
  const usedMargin = 0.00
  const equity = balance 
  const freeMargin = equity - usedMargin
  const profilePicUrl = userData?.profile_picture ? `http://127.0.0.1:8000${userData.profile_picture}` : null

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX</h1>
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Main Menu</p>
            <button 
              onClick={() => setView('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${view === 'overview' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <LayoutDashboard size={18} /> Accounts
            </button>
            <button 
              onClick={() => setView('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${view === 'history' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <History size={18} /> History
            </button>

            {/* AI TOOLS SECTION */}
            <p className="px-4 pt-6 text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">AI Intelligence</p>
            <button 
                onClick={handleBulkSync}
                disabled={isSyncing}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all ${isSyncing ? 'animate-pulse cursor-not-allowed opacity-50' : ''}`}
            >
              {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />}
              {isSyncing ? 'Syncing Markets...' : 'Sync AI Data'}
            </button>

            <button 
                onClick={() => fetchAiPrediction(selectedSymbol)}
                disabled={isPredicting}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-yellow-500 hover:bg-yellow-900/10 rounded-lg transition-all"
            >
              {isPredicting ? <RefreshCw size={18} className="animate-spin" /> : <Brain size={18} />}
              Refresh Prediction
            </button>

            <div className="pt-4 space-y-1">
                <button onClick={() => setIsDepositOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                  <Wallet size={18} /> Deposit / Withdraw
                </button>
                <button onClick={() => navigate('/terminal')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                  <TrendingUp size={18} /> Trading Terminal
                </button>
            </div>
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
        <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold">{view === 'overview' ? 'Trading Accounts' : 'Transaction History'}</h2>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-yellow-500 font-bold">{userData?.full_name || userData?.username}</span></p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Equity</p>
              <p className="text-xl font-bold text-white">${balance.toLocaleString()} USD</p>
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition focus:outline-none flex items-center justify-center bg-gray-800 shadow-xl"
                >
                    {profilePicUrl ? (
                        <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-yellow-500">{userData?.username?.charAt(0).toUpperCase()}</span>
                    )}
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden transform animate-in fade-in zoom-in duration-200">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <button onClick={() => fileInputRef.current.click()} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"><Upload size={16} /> Upload Photo</button>
                        {profilePicUrl && (
                            <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 border-t border-gray-700"><Trash2 size={16} /> Remove Photo</button>
                        )}
                    </div>
                )}
            </div>
          </div>
        </header>

        {view === 'overview' ? (
          /* --- OVERVIEW VIEW --- */
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ACCOUNT CARD */}
                <div className="lg:col-span-2 bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-500/30 tracking-tighter">LIVE ACCOUNT</span>
                          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Standard</span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter">${balance.toLocaleString()}<span className="text-2xl text-gray-500 font-normal">.00</span></h1>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/terminal')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-3 rounded-xl font-bold text-lg transition shadow-xl transform active:scale-95">Trade</button>
                        <button onClick={() => setIsDepositOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-10 py-3 rounded-xl font-bold transition border border-gray-600 active:scale-95">Deposit</button>
                      </div>
                    </div>

                    {/* CHART */}
                    <div className="h-48 w-full mt-6 relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#eab308' }}
                            labelStyle={{ display: 'none' }}
                          />
                          <Area type="monotone" dataKey="balance" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm relative z-10 mt-6">
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Equity</p><p className="text-lg font-bold text-white">${equity.toLocaleString()}</p></div>
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Used Margin</p><p className="text-lg font-bold text-white">${usedMargin.toFixed(2)}</p></div>
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Free Margin</p><p className="text-lg font-bold text-white">${freeMargin.toLocaleString()}</p></div>
                        <div><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Leverage</p><p className="text-lg font-bold text-white">1:{leverage}</p></div>
                    </div>
                </div>

                {/* --- AI INTELLIGENCE CARD WITH ASSET SELECTOR --- */}
                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Brain size={120} />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 text-yellow-500 mb-6">
                            <Zap size={20} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Intelligence</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* ASSET SELECTOR DROPDOWN */}
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Target Asset</label>
                                <div className="relative">
                                    <select 
                                        value={selectedSymbol}
                                        onChange={(e) => fetchAiPrediction(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 text-white font-bold py-3 px-4 rounded-xl appearance-none outline-none focus:border-yellow-500 transition cursor-pointer"
                                    >
                                        {availableAssets.map(asset => (
                                            <option key={asset.id} value={asset.symbol}>{asset.name} ({asset.symbol})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700 mt-2">
                                <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Current Prediction</p>
                                {isPredicting ? (
                                    <div className="flex items-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-yellow-500" />
                                        <span className="text-xl font-bold animate-pulse text-gray-300">Analyzing {selectedSymbol}...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className={`text-4xl font-black tracking-tighter ${
                                            aiPrediction?.prediction === 'BUY' ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 
                                            aiPrediction?.prediction === 'SELL' ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'text-gray-400'
                                        }`}>
                                            {aiPrediction?.prediction || 'HOLD'}
                                        </span>
                                        <span className="bg-gray-700 px-3 py-1 rounded-full text-[10px] font-bold text-gray-300">
                                            {aiPrediction?.confidence || 'N/A'} Confidence
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => fetchAiPrediction(selectedSymbol)}
                            disabled={isPredicting}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/20"
                        >
                            <RefreshCw size={18} className={isPredicting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                            Refresh AI Insights
                        </button>
                        <p className="text-[9px] text-gray-500 mt-3 text-center italic font-medium tracking-tight">AI trained on {selectedSymbol}/USD history</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">Closed Trades</p><p className="text-3xl font-black">{closedOrders.length}</p></div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">AI Success Rate</p><p className="text-3xl font-black text-green-400">Stable</p></div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">Security</p><p className="text-3xl font-black text-blue-400">Encrypted</p></div>
            </div>
          </div>
        ) : (
          /* --- HISTORY VIEW --- */
          <div className="max-w-5xl mx-auto transform animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        <tr>
                            <th className="px-6 py-5">Asset</th>
                            <th className="px-6 py-5">Type</th>
                            <th className="px-6 py-5">Lots</th>
                            <th className="px-4 py-5">Open Price</th>
                            <th className="px-4 py-5">Close Price</th>
                            <th className="px-6 py-5">Profit/Loss</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm font-mono">
                        {closedOrders.length === 0 ? (
                            <tr><td colSpan="6" className="py-24 text-center text-gray-500 italic text-base">No completed trades found. Start trading to build history.</td></tr>
                        ) : (
                            closedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-700/40 transition group">
                                    <td className="px-6 py-5 font-bold text-white group-hover:text-yellow-500 transition">{order.asset_symbol}</td>
                                    <td className={`px-6 py-5 font-bold ${order.order_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{order.order_type}</td>
                                    <td className="px-6 py-5 text-gray-300">{order.lots}</td>
                                    <td className="px-4 py-5 text-gray-500">{parseFloat(order.open_price).toFixed(5)}</td>
                                    <td className="px-4 py-5 text-gray-500">
                                        {order.close_price ? parseFloat(order.close_price).toFixed(5) : '-'}
                                    </td>
                                    <td className={`px-6 py-5 font-bold ${parseFloat(order.profit_loss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {parseFloat(order.profit_loss) >= 0 ? '+' : ''}{parseFloat(order.profit_loss).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>

      {/* POPUPS REMAIN SAME */}
      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 w-full max-w-sm rounded-3xl border border-gray-700 shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Remove Photo?</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Are you sure you want to delete your profile picture?</p>
                <div className="flex gap-3">
                    <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition">Cancel</button>
                    <button onClick={handleDeletePhoto} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-900/20">Delete</button>
                </div>
            </div>
        </div>
      )}

      {isDepositOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gray-900 p-5 flex justify-between items-center border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white tracking-tight italic">Fund Your Account</h3>
                    <button onClick={() => setIsDepositOpen(false)} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
                </div>
                <form onSubmit={handleDeposit} className="p-8 space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-[0.2em]">Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-yellow-500 opacity-50">$</span>
                            <input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-2xl py-5 pl-10 pr-4 text-white focus:border-yellow-500 outline-none font-black text-3xl transition-all shadow-inner" placeholder="1000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl transition shadow-xl shadow-yellow-900/20 transform active:scale-95 uppercase tracking-widest">Confirm Deposit</button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard