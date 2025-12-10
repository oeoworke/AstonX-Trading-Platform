import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  History, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Plus,
  ArrowUpRight
} from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('accounts')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      
      {/* --- LEFT SIDEBAR (Vertical Navigation) --- */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX.</h1>
          </div>

          {/* Menu Items */}
          <nav className="mt-4 px-2 space-y-1">
            
            {/* Trading Section */}
            <div className="mb-6">
              <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Trading</p>
              <button 
                onClick={() => setActiveMenu('accounts')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeMenu === 'accounts' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
                My Accounts
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
                <TrendingUp size={18} />
                Performance
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
                <History size={18} />
                History of Orders
              </button>
            </div>

            {/* Wallet Section */}
            <div className="mb-6">
              <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Payments & Wallet</p>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
                <Plus size={18} />
                Deposit
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
                <ArrowUpRight size={18} />
                Withdrawal
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
                <Wallet size={18} />
                Transaction History
              </button>
            </div>

          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-all">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>

      {/* --- MAIN DASHBOARD CONTENT (Center) --- */}
      <div className="flex-1 overflow-y-auto bg-[#0f172a]">
        
        {/* Top Header */}
        <header className="flex justify-between items-center py-6 px-10 border-b border-gray-800 bg-[#0f172a]">
          <h2 className="text-2xl font-bold">My Accounts</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Total Equity:</span>
            <span className="text-xl font-bold text-white">$10,000.00 USD</span>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-yellow-500 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Account Card (Exness Style) */}
        <div className="p-10">
          
          {/* Main Account Box */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl max-w-4xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">Real</span>
                  <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">Standard</span>
                  <span className="text-gray-500 text-sm"># 274860606</span>
                </div>
                <h1 className="text-5xl font-bold text-white mt-4">$10,000<span className="text-2xl text-gray-400">.00</span> <span className="text-lg text-gray-500 font-normal">USD</span></h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/terminal')} 
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg flex items-center gap-2"
                >
                  Trade
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition">
                  Deposit
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition">
                  ...
                </button>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-12 bg-gray-900/50 p-6 rounded-lg">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400 text-sm">Free Margin</span>
                    <span className="font-bold text-white">10,000.00 USD</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400 text-sm">Leverage</span>
                    <span className="font-bold text-white">1:100</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400 text-sm">Equity</span>
                    <span className="font-bold text-white">10,000.00 USD</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-400 text-sm">Floating P/L</span>
                    <span className="font-bold text-green-400">0.00 USD</span>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard