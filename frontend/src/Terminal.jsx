import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Pencil, X } from 'lucide-react'

function Terminal() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")
  const [selectedCategory, setSelectedCategory] = useState("CRYPTO")
  
  const [currentPrice, setCurrentPrice] = useState(0.00)
  const [lots, setLots] = useState(0.01)
  const [orders, setOrders] = useState([])
  const [balance, setBalance] = useState(0)
  
  // New Order Inputs
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')

  // --- EDIT MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editSL, setEditSL] = useState('')
  const [editTP, setEditTP] = useState('')

  const [equity, setEquity] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)

  // 1. Initial Data Load (Fetching only OPEN orders)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return navigate('/login')
        const config = { headers: { Authorization: `Token ${token}` } }
        
        const assetRes = await axios.get('http://127.0.0.1:8000/api/assets/', config)
        setAssets(assetRes.data)
        
        // --- FILTERING: status=OPEN மட்டும் கேட்கிறோம் ---
        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=OPEN', config)
        setOrders(orderRes.data)
        
        const userRes = await axios.get('http://127.0.0.1:8000/api/user/', config)
        setBalance(parseFloat(userRes.data.wallet.balance))
      } catch (error) { console.error("Error loading data") }
    }
    fetchData()
  }, [navigate])

  // 2. Live Price & PnL
  useEffect(() => {
    const updateMarket = async () => {
      try {
        const token = localStorage.getItem('token')
        const config = { headers: { Authorization: `Token ${token}` } }
        const res = await axios.get(`http://127.0.0.1:8000/api/price/${selectedCategory}/${selectedSymbol}/`, config)
        const price = parseFloat(res.data.price)
        setCurrentPrice(price)

        let floatingPnL = 0
        orders.forEach(order => {
            if (order.status === 'OPEN' && order.asset_symbol === selectedSymbol) {
                const diff = order.order_type === 'BUY' ? (price - parseFloat(order.open_price)) : (parseFloat(order.open_price) - price)
                floatingPnL += diff * parseFloat(order.lots)
            }
        })
        setTotalPnL(floatingPnL)
        setEquity(balance + floatingPnL)
      } catch (error) { console.error("Price error") }
    }
    updateMarket()
    const interval = setInterval(updateMarket, 3000) 
    return () => clearInterval(interval)
  }, [selectedSymbol, selectedCategory, orders, balance])

  // 3. Load TradingView
  useEffect(() => {
    const loadTV = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "width": "100%", "height": "100%", "symbol": selectedCategory === 'CRYPTO' ? "BINANCE:" + selectedSymbol + "USDT" : "FX:" + selectedSymbol,
          "interval": "D", "timezone": "Etc/UTC", "theme": "dark",
          "style": "1", "locale": "en", "toolbar_bg": "#f1f3f6",
          "enable_publishing": false, "allow_symbol_change": true,
          "container_id": "tradingview_chart"
        });
      }
    }
    if (!document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = loadTV;
      document.head.appendChild(script);
    } else { loadTV(); }
  }, [selectedSymbol, selectedCategory]);
  
  // 4. Trade Functions
  const handleTrade = async (type) => {
    try {
        const token = localStorage.getItem('token')
        await axios.post('http://127.0.0.1:8000/api/trade/place/', {
            symbol: selectedSymbol, type: type, lots: lots, price: currentPrice,
            stop_loss: stopLoss || null, take_profit: takeProfit || null
        }, { headers: { Authorization: `Token ${token}` } })

        alert(`${type} Order Placed!`)
        setStopLoss(''); setTakeProfit('') 
        // Refresh with OPEN filter
        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=OPEN', { headers: { Authorization: `Token ${token}` } })
        setOrders(orderRes.data)
    } catch (error) { alert("Trade Failed") }
  }

  const handleClose = async (orderId) => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://127.0.0.1:8000/api/trade/close/', { order_id: orderId, current_price: currentPrice }, { headers: { Authorization: `Token ${token}` } })
        setBalance(parseFloat(res.data.new_balance))
        // Refresh with OPEN filter (to remove closed order)
        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=OPEN', { headers: { Authorization: `Token ${token}` } })
        setOrders(orderRes.data)
    } catch (error) { alert("Close Failed") }
  }

  // --- EDIT FUNCTIONS ---
  const openEditModal = (order) => {
    setEditingOrder(order)
    setEditSL(order.stop_loss || '')
    setEditTP(order.take_profit || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    try {
        const token = localStorage.getItem('token')
        await axios.post('http://127.0.0.1:8000/api/trade/update/', {
            order_id: editingOrder.id,
            stop_loss: editSL || null,
            take_profit: editTP || null
        }, { headers: { Authorization: `Token ${token}` } })

        alert("Order Updated!")
        setIsEditModalOpen(false)
        // Refresh with OPEN filter
        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/?status=OPEN', { headers: { Authorization: `Token ${token}` } })
        setOrders(orderRes.data)
    } catch (error) { alert("Update Failed") }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden relative">
      <nav className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center h-14 shrink-0">
        <h1 className="text-lg font-bold text-blue-500">AstonX <span className="text-white">Terminal</span></h1>
        <div className="flex items-center gap-6 text-sm">
            <div className="text-right"><p className="text-[10px] text-gray-400 uppercase">Balance</p><p className="font-bold">${balance.toFixed(2)}</p></div>
            <div className="text-right"><p className="text-[10px] text-gray-400 uppercase">Equity</p><p className={`font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>${equity.toFixed(2)}</p></div>
            <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition">Dashboard</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Asset List */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {assets.map((asset) => (
            <div key={asset.id} onClick={() => { setSelectedSymbol(asset.symbol); setSelectedCategory(asset.category); }}
              className={`p-3 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700 transition ${selectedSymbol === asset.symbol ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''}`}>
              <span className="font-bold text-sm block">{asset.symbol}</span>
              <span className="text-[10px] text-gray-400">{asset.name}</span>
            </div>
          ))}
        </div>

        {/* Center: Chart & Order Table */}
        <div className="flex-1 bg-[#131722] flex flex-col">
            <div className="flex-1 relative border-b border-gray-800">
                <div id="tradingview_chart" className="w-full h-full"></div>
            </div>
            
            <div className="h-52 bg-gray-900 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                    <thead className="text-gray-500 bg-gray-800 sticky top-0 uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-4 py-3">Symbol</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Lots</th>
                            <th className="px-4 py-3">Open Price</th>
                            <th className="px-4 py-3 text-red-400">SL</th>
                            <th className="px-4 py-3 text-green-400">TP</th>
                            <th className="px-4 py-3">Live P/L</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-12 text-gray-500 italic text-sm">
                                    No open positions available.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                let displayPnL = 0;
                                if (order.asset_symbol === selectedSymbol) {
                                    const diff = order.order_type === 'BUY' ? (currentPrice - parseFloat(order.open_price)) : (parseFloat(order.open_price) - currentPrice)
                                    displayPnL = diff * parseFloat(order.lots)
                                }

                                return (
                                    <tr key={order.id} className="hover:bg-gray-800 transition">
                                        <td className="px-4 py-3 font-bold">{order.asset_symbol}</td>
                                        <td className={`px-4 py-3 font-bold ${order.order_type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{order.order_type}</td>
                                        <td className="px-4 py-3">{order.lots}</td>
                                        <td className="px-4 py-3">{parseFloat(order.open_price).toFixed(5)}</td>
                                        
                                        {/* SL Column with Pencil */}
                                        <td className="px-4 py-3 text-red-400/80 group">
                                            <div className="flex items-center gap-1.5">
                                                {order.stop_loss ? parseFloat(order.stop_loss).toFixed(5) : '-'}
                                                <Pencil size={10} className="cursor-pointer opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition" onClick={() => openEditModal(order)} />
                                            </div>
                                        </td>

                                        {/* TP Column with Pencil */}
                                        <td className="px-4 py-3 text-green-400/80 group">
                                            <div className="flex items-center gap-1.5">
                                                {order.take_profit ? parseFloat(order.take_profit).toFixed(5) : '-'}
                                                <Pencil size={10} className="cursor-pointer opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition" onClick={() => openEditModal(order)} />
                                            </div>
                                        </td>

                                        <td className={`px-4 py-3 font-bold ${displayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {displayPnL.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleClose(order.id)} className="bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition">CLOSE</button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right Panel: Trading Controls */}
        <div className="w-72 bg-gray-800 border-l border-gray-700 p-4 space-y-8">
            <div>
                <h3 className="font-bold text-lg">{selectedSymbol} <span className="text-green-400 text-xs ml-2 uppercase tracking-tighter">Live</span></h3>
                <p className="text-3xl font-bold mt-2 tracking-tight">${currentPrice.toFixed(2)}</p>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-[11px] text-gray-400 uppercase font-bold">Lots (Volume)</label>
                    <input type="number" step="0.01" value={lots} onChange={(e) => setLots(parseFloat(e.target.value))} className="w-full bg-gray-900 p-3 rounded border border-gray-700 mt-1 font-bold outline-none focus:border-blue-500 transition" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] text-red-400 uppercase font-bold">Stop Loss</label>
                        <input type="number" placeholder="Price" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full bg-gray-900 p-3 rounded border border-gray-700 mt-1 text-sm outline-none focus:border-red-500 transition" />
                    </div>
                    <div>
                        <label className="text-[11px] text-green-400 uppercase font-bold">Take Profit</label>
                        <input type="number" placeholder="Price" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="w-full bg-gray-900 p-3 rounded border border-gray-700 mt-1 text-sm outline-none focus:border-green-500 transition" />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={() => handleTrade('SELL')} className="flex-1 bg-red-600 hover:bg-red-700 p-4 rounded-lg font-bold transition shadow-lg shadow-red-900/20">SELL</button>
                    <button onClick={() => handleTrade('BUY')} className="flex-1 bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold transition shadow-lg shadow-green-900/20">BUY</button>
                </div>
                
                <p className="text-[10px] text-gray-500 text-center italic mt-2">Required Margin: ${(currentPrice * lots).toFixed(2)} USD</p>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Modify Position #{editingOrder?.id}</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdateOrder} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-red-400 uppercase mb-2">Stop Loss Price</label>
                        <input type="number" step="0.00001" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 outline-none transition" value={editSL} onChange={(e) => setEditSL(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-green-400 uppercase mb-2">Take Profit Price</label>
                        <input type="number" step="0.00001" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 outline-none transition" value={editTP} onChange={(e) => setEditTP(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/30">Apply Changes</button>
                </form>
            </div>
        </div>
      )}

    </div>
  )
}

export default Terminal