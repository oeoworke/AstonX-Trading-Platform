import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")
  const [selectedCategory, setSelectedCategory] = useState("CRYPTO")
  
  // Trading States
  const [currentPrice, setCurrentPrice] = useState(0.00)
  const [lots, setLots] = useState(0.01)
  const [orders, setOrders] = useState([])
  const [balance, setBalance] = useState(0)
  
  // Calculated States
  const [equity, setEquity] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)

  // 1. Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return navigate('/login')
        const config = { headers: { Authorization: `Token ${token}` } }

        const assetRes = await axios.get('http://127.0.0.1:8000/api/assets/', config)
        setAssets(assetRes.data)

        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/', config)
        setOrders(orderRes.data)

        const userRes = await axios.get('http://127.0.0.1:8000/api/user/', config)
        setBalance(parseFloat(userRes.data.wallet.balance))

      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    fetchData()
  }, [navigate])

  // 2. Live Price & PnL Calculation Loop (FIXED WITH AUTH)
  useEffect(() => {
    const updateMarket = async () => {
      try {
        const token = localStorage.getItem('token')
        const config = { headers: { Authorization: `Token ${token}` } }

        // GET Live Price with Auth Token
        const res = await axios.get(`http://127.0.0.1:8000/api/price/${selectedCategory}/${selectedSymbol}/`, config)
        const price = parseFloat(res.data.price)
        setCurrentPrice(price)

        // Calculate Floating P/L for Open Positions
        let floatingPnL = 0
        orders.forEach(order => {
            if (order.status === 'OPEN' && order.asset_symbol === selectedSymbol) {
                const diff = order.order_type === 'BUY' 
                    ? (price - parseFloat(order.open_price)) 
                    : (parseFloat(order.open_price) - price)
                floatingPnL += diff * parseFloat(order.lots)
            }
        })

        setTotalPnL(floatingPnL)
        setEquity(balance + floatingPnL)

      } catch (error) {
        console.error("Price update error:", error)
      }
    }

    updateMarket()
    const interval = setInterval(updateMarket, 3000) 
    return () => clearInterval(interval)
  }, [selectedSymbol, selectedCategory, orders, balance])

  // 3. Trade Functions
  const handleTrade = async (type) => {
    try {
        const token = localStorage.getItem('token')
        await axios.post('http://127.0.0.1:8000/api/trade/place/', {
            symbol: selectedSymbol,
            type: type,
            lots: lots,
            price: currentPrice
        }, { headers: { Authorization: `Token ${token}` } })

        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/', {
            headers: { Authorization: `Token ${token}` } 
        })
        setOrders(orderRes.data)
    } catch (error) {
        alert("Trade Failed")
    }
  }

  const handleClose = async (orderId) => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.post('http://127.0.0.1:8000/api/trade/close/', {
            order_id: orderId,
            current_price: currentPrice
        }, { headers: { Authorization: `Token ${token}` } })

        setBalance(parseFloat(res.data.new_balance))
        const orderRes = await axios.get('http://127.0.0.1:8000/api/trade/orders/', {
            headers: { Authorization: `Token ${token}` } 
        })
        setOrders(orderRes.data)

    } catch (error) {
        alert("Close Failed")
    }
  }

  // Load TradingView Script
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
    } else {
      loadTV();
    }
  }, [selectedSymbol, selectedCategory]);

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden">
      {/* Top Navbar */}
      <nav className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center h-14 shrink-0">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-blue-500">AstonX <span className="text-white">Terminal</span></h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
                <p className="text-[10px] text-gray-400">BALANCE</p>
                <p className="font-bold text-white">${balance.toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-400">EQUITY</p>
                <p className={`font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${equity.toFixed(2)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-400">OPEN P/L</p>
                <p className={`font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                </p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs">Exit</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Assets */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 overflow-y-auto">
          {assets.map((asset) => (
            <div key={asset.id} onClick={() => { setSelectedSymbol(asset.symbol); setSelectedCategory(asset.category); }}
              className={`p-3 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700 transition ${selectedSymbol === asset.symbol ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''}`}>
              <span className="font-bold text-sm block">{asset.symbol}</span>
              <span className="text-[10px] text-gray-400">{asset.name}</span>
            </div>
          ))}
        </div>

        {/* Center: Chart & History */}
        <div className="flex-1 relative bg-[#131722] flex flex-col">
            <div className="flex-1 relative"><div id="tradingview_chart" className="w-full h-full"></div></div>
            <div className="h-48 bg-gray-900 border-t border-gray-700 overflow-y-auto">
                <table className="w-full text-left text-xs">
                    <thead className="text-gray-500 bg-gray-800 sticky top-0 uppercase">
                        <tr>
                            <th className="px-4 py-2">Symbol</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Open Price</th>
                            <th className="px-4 py-2">P/L</th>
                            <th className="px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            let displayPnL = parseFloat(order.profit_loss);
                            if (order.status === 'OPEN' && order.asset_symbol === selectedSymbol) {
                                const diff = order.order_type === 'BUY' ? (currentPrice - parseFloat(order.open_price)) : (parseFloat(order.open_price) - currentPrice)
                                displayPnL = diff * parseFloat(order.lots)
                            }
                            return (
                                <tr key={order.id} className="border-b border-gray-800">
                                    <td className="px-4 py-2 font-bold">{order.asset_symbol}</td>
                                    <td className={`px-4 py-2 font-bold ${order.order_type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{order.order_type}</td>
                                    <td className="px-4 py-2">{parseFloat(order.open_price).toFixed(5)}</td>
                                    <td className={`px-4 py-2 font-bold ${displayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{displayPnL.toFixed(2)}</td>
                                    <td className="px-4 py-2">
                                        {order.status === 'OPEN' && (
                                            <button onClick={() => handleClose(order.id)} className="bg-red-500/20 text-red-400 px-2 py-1 rounded">CLOSE</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right: Trade Panel */}
        <div className="w-72 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="font-bold text-lg mb-4">{selectedSymbol} <span className="text-green-400 text-xs ml-2">Live</span></h3>
            <p className="text-3xl font-bold mb-6">${currentPrice.toFixed(2)}</p>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400">Lots</label>
                    <input type="number" value={lots} onChange={(e) => setLots(e.target.value)} className="w-full bg-gray-900 p-2 rounded border border-gray-700 outline-none mt-1" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleTrade('SELL')} className="flex-1 bg-red-600 p-3 rounded font-bold hover:bg-red-700 transition">SELL</button>
                    <button onClick={() => handleTrade('BUY')} className="flex-1 bg-green-600 p-3 rounded font-bold hover:bg-green-700 transition">BUY</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default App