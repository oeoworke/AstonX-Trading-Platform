import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  LayoutDashboard, TrendingUp, Wallet, History, LogOut, X, Trash2, Upload, Database, RefreshCw, Cpu, Brain, Zap, ChevronDown, Shield, Activity, Settings, BellRing, Newspaper, CreditCard, ArrowDownCircle
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
  const [availableAssets, setAvailableAssets] = useState([])
  const [isAutoPilot, setIsAutoPilot] = useState(false)

  // --- RISK SETTINGS STATES ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [botSettings, setBotSettings] = useState({
    lot_size: 0.01,
    stop_loss_pct: 1.0,
    take_profit_pct: 2.0
  })

  // --- LIVE NOTIFICATION STATE ---
  const [liveNotification, setLiveNotification] = useState(null)

  // View State (Accounts, History, or Withdrawals)
  const [view, setView] = useState('overview') 
  
  // Data States
  const [chartData, setChartData] = useState([])
  const [closedOrders, setClosedOrders] = useState([])
  const [withdrawalHistory, setWithdrawalHistory] = useState([]) // New state

  // Popup States
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  
  // --- NEW: WITHDRAWAL STATES ---
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('CRYPTO')
  const [withdrawDetails, setWithdrawDetails] = useState('')

  // Profile Picture States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const fileInputRef = useRef(null)

  // --- FETCH DATA (Modified to include withdrawal history) ---
  const fetchData = async (silent = false) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
          navigate('/login')
          return
      }
      const config = { headers: { Authorization: `Token ${token}` } }

      const userRes = await axios.get('http://127.0.0.1:8000/api/user/', config)
      setUserData(userRes.data)

      const chartRes = await axios.get('http://127.0.0.1:8000/api/trade/chart/', config)
      setChartData(chartRes.data)

      const historyRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=CLOSED', config)
      setClosedOrders(historyRes.data)

      // Withdrawal History fetch
      const withdrawRes = await axios.get('http://127.0.0.1:8000/api/withdraw/history/', config)
      setWithdrawalHistory(withdrawRes.data)

      if (!silent) {
        const assetsRes = await axios.get('http://127.0.0.1:8000/api/assets/', config)
        const freshAssets = assetsRes.data
        setAvailableAssets(freshAssets)
        fetchAiPrediction('BTC', freshAssets)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  // --- WEBSOCKET REAL-TIME CONNECTION ---
  useEffect(() => {
    if (!userData?.id) return;

    console.log("🚀 Attempting WebSocket connection...");
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/trade/');

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.event === "TRADE_EXECUTED" && data.user_id === userData.id) {
            setLiveNotification(data.text);
            fetchData(true);
            setTimeout(() => setLiveNotification(null), 8000);
        }
    };
    
    return () => socket.close();
  }, [userData?.id]);

  // --- FETCH AI PREDICTION ---
  const fetchAiPrediction = async (symbol, currentAssets = null) => {
    setIsPredicting(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Token ${token}` } }
      const res = await axios.get(`http://127.0.0.1:8000/api/ai-predict/?symbol=${symbol}`, config)
      setAiPrediction(res.data)
      setSelectedSymbol(symbol)
      const listToCheck = currentAssets || availableAssets
      const currentAsset = listToCheck.find(a => a.symbol === symbol)
      if (currentAsset) {
          setIsAutoPilot(currentAsset.is_auto_pilot)
          setBotSettings({
            lot_size: currentAsset.lot_size,
            stop_loss_pct: currentAsset.stop_loss_pct,
            take_profit_pct: currentAsset.take_profit_pct
          })
      }
    } catch (error) { setAiPrediction({ prediction: 'ERROR', confidence: 'N/A' }) }
    setIsPredicting(false)
  }

  // --- TOGGLE AUTO-PILOT ---
  const handleToggleAutoPilot = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Token ${token}` } }
      const res = await axios.post('http://127.0.0.1:8000/api/ai/toggle-auto-pilot/', { symbol: selectedSymbol }, config)
      setIsAutoPilot(res.data.is_auto_pilot)
      setAvailableAssets(prev => prev.map(a => a.symbol === selectedSymbol ? { ...a, is_auto_pilot: res.data.is_auto_pilot } : a))
    } catch (error) { alert("Failed to toggle Auto-Pilot") }
  }

  // --- SAVE RISK SETTINGS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Token ${token}` } }
      const res = await axios.post('http://127.0.0.1:8000/api/ai/update-settings/', {
        symbol: selectedSymbol,
        lot_size: botSettings.lot_size,
        stop_loss_pct: botSettings.stop_loss_pct,
        take_profit_pct: botSettings.take_profit_pct
      }, config)
      setAvailableAssets(prev => prev.map(a => a.symbol === selectedSymbol ? { ...a, lot_size: res.data.lot_size, stop_loss_pct: res.data.stop_loss_pct, take_profit_pct: res.data.take_profit_pct } : a))
      setIsSettingsOpen(false)
      alert("Settings Saved!")
    } catch (error) { alert("Failed to update settings") }
  }

  useEffect(() => { fetchData() }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleBulkSync = async () => {
    setIsSyncing(true)
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://127.0.0.1:8000/api/ai/bulk-sync/', {}, { headers: { Authorization: `Token ${token}` } })
        alert(res.data.message); fetchAiPrediction(selectedSymbol) 
    } catch (error) { alert("Sync Failed!") }
    setIsSyncing(false)
  }

  // Profile logic
  const handleFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('profile_picture', file);
    try {
        const token = localStorage.getItem('token')
        await axios.post('http://127.0.0.1:8000/api/user/picture/', formData, { headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' } })
        fetchData(); setIsProfileMenuOpen(false)
    } catch (error) { alert("Upload Failed") }
  }

  const handleDeletePhoto = async () => {
    try {
        const token = localStorage.getItem('token')
        await axios.delete('http://127.0.0.1:8000/api/user/picture/', { headers: { Authorization: `Token ${token}` } })
        fetchData(); setIsDeleteConfirmOpen(false); setIsProfileMenuOpen(false)
    } catch (error) { alert("Delete Failed") }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://127.0.0.1:8000/api/deposit/', { amount: depositAmount }, { headers: { Authorization: `Token ${token}` } })
      setIsDepositOpen(false); setDepositAmount(''); fetchData()
    } catch (error) { alert("Deposit Failed.") }
  }

  // --- NEW: HANDLE WITHDRAWAL ---
  const handleWithdraw = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('http://127.0.0.1:8000/api/withdraw/request/', { 
        amount: withdrawAmount,
        method: withdrawMethod,
        address_details: withdrawDetails
      }, { headers: { Authorization: `Token ${token}` } })
      
      alert(res.data.message)
      setIsWithdrawOpen(false)
      setWithdrawAmount('')
      setWithdrawDetails('')
      fetchData() // Refresh balance and history
    } catch (error) { 
      alert(error.response?.data?.error || "Withdrawal Failed.") 
    }
  }

  if (loading) return <div className="text-white bg-[#0f172a] h-screen flex items-center justify-center tracking-widest font-bold">LOADING DASHBOARD...</div>

  const balance = parseFloat(userData?.wallet?.balance || 0)
  const leverage = userData?.wallet?.leverage || 100
  const equity = balance 
  const profilePicUrl = userData?.profile_picture ? `http://127.0.0.1:8000${userData.profile_picture}` : null

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      
      {/* LIVE NOTIFICATION POPUP */}
      {liveNotification && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500">
            <div className="bg-blue-600 border border-blue-400 px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center gap-4 min-w-[320px]">
                <div className="bg-white/20 p-2 rounded-full animate-bounce"><BellRing size={24} className="text-white" /></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-blue-200">System Notification</p><p className="text-sm font-bold text-white leading-tight">{liveNotification}</p></div>
                <button onClick={() => setLiveNotification(null)} className="ml-auto text-blue-200 hover:text-white transition"><X size={18} /></button>
            </div>
        </div>
      )}

      {/* --- SIDEBAR (Updated with h-full and flex layout for scrolling) --- */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0">
        {/* Top Header Section */}
        <div className="p-6 shrink-0">
          <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX</h1>
        </div>
        
        {/* Middle Navigation Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Main Menu</p>
          <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${view === 'overview' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><LayoutDashboard size={18} /> Accounts</button>
          <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${view === 'history' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><History size={18} /> History</button>
          <button onClick={() => setView('withdrawals')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${view === 'withdrawals' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><ArrowDownCircle size={18} /> Withdrawals</button>

          <p className="px-4 pt-6 text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">AI Intelligence</p>
          <button onClick={handleBulkSync} disabled={isSyncing} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all ${isSyncing ? 'animate-pulse cursor-not-allowed opacity-50' : ''}`}>{isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />} {isSyncing ? 'Syncing...' : 'Sync AI Data'}</button>
          <button onClick={() => fetchAiPrediction(selectedSymbol)} disabled={isPredicting} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-yellow-500 hover:bg-yellow-900/10 rounded-lg transition-all">{isPredicting ? <RefreshCw size={18} className="animate-spin" /> : <Brain size={18} />} Refresh Prediction</button>
          
          <div className="pt-4 space-y-1">
              <button onClick={() => setIsDepositOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all"><Wallet size={18} /> Deposit </button>
              <button onClick={() => navigate('/terminal')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all"><TrendingUp size={18} /> Trading Terminal</button>
              <button onClick={() => window.open('/calendar', '_blank')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-yellow-500 hover:bg-yellow-600/10 rounded-lg transition-all group border border-transparent hover:border-yellow-500/20"><Newspaper size={18} className="group-hover:scale-110 transition" /> Economic News</button>
          </div>
        </div>

        {/* Bottom Section (Pinned Logout) */}
        <div className="p-4 border-t border-gray-800 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-800 hover:text-red-100 transition-all"><LogOut size={18} /> Log Out</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#0f172a] p-8">
        <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold">
              {view === 'overview' ? 'Trading Accounts' : view === 'history' ? 'Transaction History' : 'Withdrawal Requests'}
            </h2>
            <p className="text-gray-400 mt-1">Welcome, <span className="text-yellow-500 font-bold">{userData?.full_name || userData?.username}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Equity</p><p className="text-xl font-bold text-white">${balance.toLocaleString()} USD</p></div>
            <div className="relative">
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition bg-gray-800 flex items-center justify-center">
                    {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-yellow-500">{userData?.username?.charAt(0).toUpperCase()}</span>}
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden transform animate-in fade-in zoom-in duration-200">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <button onClick={() => fileInputRef.current.click()} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"><Upload size={16} /> Upload Photo</button>
                        {profilePicUrl && <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 border-t border-gray-700"><Trash2 size={16} /> Remove Photo</button>}
                    </div>
                )}
            </div>
          </div>
        </header>

        {view === 'overview' ? (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div><div className="flex items-center gap-3 mb-3"><span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-500/30 tracking-tighter">DEMO ACCOUNT</span></div><h1 className="text-6xl font-black text-white tracking-tighter">${balance.toLocaleString()}<span className="text-2xl text-gray-500 font-normal">.00</span></h1></div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/terminal')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-20 py-3 rounded-xl font-bold text-lg transition transform active:scale-95 shadow-lg shadow-yellow-500/20">Trade</button>
                        <div className="flex gap-2">
                          <button onClick={() => setIsDepositOpen(true)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition border border-gray-600 active:scale-95">Deposit</button>
                          <button onClick={() => setIsWithdrawOpen(true)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-bold transition border border-gray-700 active:scale-95 flex items-center justify-center gap-2"> Withdraw</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[250px] mt-6 relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs><linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/><stop offset="95%" stopColor="#eab308" stopOpacity={0}/></linearGradient></defs>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} itemStyle={{ color: '#eab308' }} />
                          <Area type="monotone" dataKey="balance" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-700 mt-6 relative z-10">
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Equity</p><p className="text-lg font-bold text-white">${equity.toLocaleString()}</p></div>
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Used Margin</p><p className="text-lg font-bold text-white">$0.00</p></div>
                        <div className="border-r border-gray-700 pr-4"><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Free Margin</p><p className="text-lg font-bold text-white">${equity.toLocaleString()}</p></div>
                        <div><p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Leverage</p><p className="text-lg font-bold text-white">1:{leverage}</p></div>
                    </div>
                </div>

                <div className={`bg-gray-900 rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between relative overflow-hidden group ${isAutoPilot ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-gray-700 shadow-2xl'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Brain size={120} /></div>
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-yellow-500"><Zap size={20} fill="currentColor" /><span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Intelligence</span></div>
                            {isAutoPilot && <div className="flex items-center gap-1 text-blue-400 animate-pulse"><Shield size={14} /><span className="text-[9px] font-bold uppercase">System Active</span></div>}
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Target Asset</label>
                                <div className="relative">
                                    <select value={selectedSymbol} onChange={(e) => fetchAiPrediction(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white font-bold py-3 px-4 rounded-xl appearance-none outline-none focus:border-yellow-500 transition cursor-pointer">
                                        {availableAssets.map(asset => (<option key={asset.id} value={asset.symbol}>{asset.name} ({asset.symbol})</option>))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={18} /></div>
                                </div>
                            </div>
                            <div className="bg-gray-800/40 p-4 rounded-2xl border border-gray-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isAutoPilot ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'}`}><Activity size={18} /></div>
                                    <p className="text-white text-xs font-bold">Auto-Pilot Mode</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 rounded-lg"><Settings size={18} /></button>
                                    <button onClick={handleToggleAutoPilot} className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isAutoPilot ? 'bg-blue-600' : 'bg-gray-700'}`}><div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${isAutoPilot ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700 mt-2">
                                <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Signal Status</p>
                                {isPredicting ? (
                                    <div className="flex items-center gap-3"><RefreshCw size={24} className="animate-spin text-yellow-500" /><span className="text-xl font-bold animate-pulse text-gray-300">Analyzing...</span></div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className={`text-4xl font-black tracking-tighter ${aiPrediction?.prediction === 'BUY' ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]' : aiPrediction?.prediction === 'SELL' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.2)]' : 'text-gray-400'}`}>{aiPrediction?.prediction || 'HOLD'}</span>
                                        <span className="bg-gray-700 px-3 py-1 rounded-full text-[10px] font-bold text-gray-300">{aiPrediction?.confidence || 'N/A'} Confidence</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 relative z-10"><button onClick={() => fetchAiPrediction(selectedSymbol)} disabled={isPredicting} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 group"><RefreshCw size={18} className={isPredicting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />Refresh Bot Signal</button></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">Closed Trades</p><p className="text-3xl font-black">{closedOrders.length}</p></div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">AI Success Rate</p><p className="text-3xl font-black text-green-400">Stable</p></div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700"><p className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-widest">Security</p><p className="text-3xl font-black text-blue-400">Encrypted</p></div>
            </div>
          </div>
        ) : view === 'history' ? (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        <tr><th className="px-6 py-5">Asset</th><th className="px-6 py-5">Type</th><th className="px-6 py-5">Lots</th><th className="px-4 py-5">Open Price</th><th className="px-4 py-5">Close Price</th><th className="px-6 py-5">Profit/Loss</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm font-mono text-gray-300">
                        {closedOrders.length === 0 ? (<tr><td colSpan="6" className="py-24 text-center">No completed trades found.</td></tr>) : (
                            closedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-700/40 transition group">
                                    <td className="px-6 py-5 font-bold text-white group-hover:text-yellow-500">{order.asset_symbol}</td>
                                    <td className={`px-6 py-5 font-bold ${order.order_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{order.order_type}</td>
                                    <td className="px-6 py-5">{order.lots}</td>
                                    <td className="px-4 py-5">{parseFloat(order.open_price).toFixed(5)}</td>
                                    <td className="px-4 py-5">{order.close_price ? parseFloat(order.close_price).toFixed(5) : '-'}</td>
                                    <td className={`px-6 py-5 font-bold ${parseFloat(order.profit_loss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{parseFloat(order.profit_loss) >= 0 ? '+' : ''}{parseFloat(order.profit_loss).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        <tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">Amount</th><th className="px-6 py-5">Method</th><th className="px-6 py-5">Details</th><th className="px-6 py-5">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm font-mono text-gray-300">
                        {withdrawalHistory.length === 0 ? (<tr><td colSpan="5" className="py-24 text-center">No withdrawal requests found.</td></tr>) : (
                            withdrawalHistory.map((w) => (
                                <tr key={w.id} className="hover:bg-gray-700/40 transition group">
                                    <td className="px-6 py-5 text-gray-400">{w.date}</td>
                                    <td className="px-6 py-5 font-bold text-white">${w.amount.toFixed(2)}</td>
                                    <td className="px-6 py-5 uppercase text-xs">{w.method}</td>
                                    <td className="px-6 py-5 text-xs truncate max-w-[200px]" title={w.address}>{w.address}</td>
                                    <td className="px-6 py-5">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                        w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 
                                        w.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 
                                        'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                        {w.status}
                                      </span>
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

      {/* --- ALL MODALS (UNCHANGED) --- */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-gray-900 p-5 flex justify-between items-center border-b border-gray-700"><div className="flex items-center gap-2 text-yellow-500"><Settings size={20} /><h3 className="text-lg font-bold text-white tracking-tight">Bot Risk Settings</h3></div><button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white transition"><X size={24} /></button></div>
                <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Lot Size</label><input type="number" step="0.01" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-yellow-500 transition" value={botSettings.lot_size} onChange={(e) => setBotSettings({...botSettings, lot_size: e.target.value})} required /></div>
                        <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Stop Loss (%)</label><input type="number" step="0.1" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-yellow-500 transition" value={botSettings.stop_loss_pct} onChange={(e) => setBotSettings({...botSettings, stop_loss_pct: e.target.value})} required /></div>
                        <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Take Profit (%)</label><input type="number" step="0.1" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-yellow-500 transition" value={botSettings.take_profit_pct} onChange={(e) => setBotSettings({...botSettings, take_profit_pct: e.target.value})} required /></div>
                    </div>
                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition shadow-lg">Save Configuration</button>
                </form>
            </div>
        </div>
      )}

      {isDepositOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 overflow-hidden">
                <div className="bg-gray-900 p-5 flex justify-between items-center border-b border-gray-700"><h3 className="text-lg font-bold text-white tracking-tight italic">Fund Account</h3><button onClick={() => setIsDepositOpen(false)} className="text-gray-500 hover:text-white transition"><X size={24} /></button></div>
                <form onSubmit={handleDeposit} className="p-8 space-y-8">
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-3 tracking-[0.2em]">Amount (USD)</label>
                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-yellow-500 opacity-50">$</span><input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-2xl py-5 pl-10 pr-4 text-white font-black text-3xl outline-none" placeholder="1000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required /></div>
                    </div>
                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl uppercase tracking-widest">Confirm Deposit</button>
                </form>
            </div>
        </div>
      )}

      {isWithdrawOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 overflow-hidden animate-in fade-in duration-300">
                <div className="bg-gray-900 p-5 flex justify-between items-center border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 italic"><CreditCard size={20} /> Request Withdrawal</h3>
                  <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-500 hover:text-white transition"><X size={24} /></button>
                </div>
                <form onSubmit={handleWithdraw} className="p-8 space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Amount (USD)</label>
                      <input type="number" className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-yellow-500 transition" placeholder="Enter amount to withdraw" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required />
                      <p className="text-[10px] text-gray-500 mt-2 italic text-right">Available: ${balance.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setWithdrawMethod('CRYPTO')} className={`py-3 rounded-xl font-bold text-xs transition border ${withdrawMethod === 'CRYPTO' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-400 border-gray-700'}`}>Crypto (USDT)</button>
                      <button type="button" onClick={() => setWithdrawMethod('BANK')} className={`py-3 rounded-xl font-bold text-xs transition border ${withdrawMethod === 'BANK' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-400 border-gray-700'}`}>Bank Transfer</button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">{withdrawMethod === 'CRYPTO' ? 'USDT (TRC20/ERC20) Address' : 'Bank Name & Account Details'}</label>
                      <textarea rows="3" className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white text-sm outline-none focus:border-yellow-500 transition" placeholder={withdrawMethod === 'CRYPTO' ? "Enter your wallet address" : "Bank Name, Acc Number, SWIFT Code"} value={withdrawDetails} onChange={(e) => setWithdrawDetails(e.target.value)} required />
                    </div>

                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition shadow-lg shadow-yellow-500/20 transform active:scale-95">Send Request</button>
                    <p className="text-[9px] text-gray-500 text-center uppercase tracking-widest">Requests take 2-4 hours for verification</p>
                </form>
            </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <div className="bg-gray-800 w-full max-w-sm rounded-3xl border border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Remove Photo?</h3>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold">Cancel</button>
                    <button onClick={handleDeletePhoto} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard