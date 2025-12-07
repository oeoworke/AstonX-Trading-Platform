import { useState, useEffect } from 'react'
import axios from 'axios'

function Terminal() {
  const [assets, setAssets] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")
  const [selectedCategory, setSelectedCategory] = useState("CRYPTO")

  // API Call to get Assets from Django
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/assets/')
      .then(response => {
        setAssets(response.data)
      })
      .catch(error => {
        console.error("Error fetching assets:", error)
      })
  }, [])

  // Load TradingView Script
  useEffect(() => {
    // Only load script if it doesn't exist
    if (!document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => loadChart(selectedSymbol, selectedCategory);
      document.head.appendChild(script);
    } else {
        // If script exists, just load chart
        loadChart(selectedSymbol, selectedCategory);
    }
  }, []);

  // Function to Load/Update Chart
  const loadChart = (symbol, category) => {
    let tvSymbol = symbol;
    if (category === 'CRYPTO') {
      tvSymbol = "BINANCE:" + symbol + "USDT";
    } else if (category === 'FOREX') {
      tvSymbol = "FX:" + symbol;
    }

    if (window.TradingView) {
      new window.TradingView.widget({
        "width": "100%",
        "height": "100%", // Full container height
        "symbol": tvSymbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart"
      });
    }
  }

  // Handle Asset Click
  const handleAssetClick = (symbol, category) => {
    setSelectedSymbol(symbol);
    setSelectedCategory(category);
    loadChart(symbol, category);
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden">
      {/* Top Navbar */}
      <nav className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center h-14 shrink-0">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-blue-500">AstonX <span className="text-white">Terminal</span></h1>
            <div className="bg-gray-800 px-3 py-1 rounded text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Standard Account
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] text-gray-400">EQUITY</p>
                <p className="text-sm font-bold text-green-400">$10,000.00 USD</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-bold">DEPOSIT</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Asset List (Instruments) */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-700">
            <input type="text" placeholder="Search markets..." className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"/>
          </div>
          
          {/* Scrollable List */}
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
            {assets.map((asset) => (
              <div 
                key={asset.id}
                onClick={() => handleAssetClick(asset.symbol, asset.category)}
                className={`p-2 mb-1 rounded cursor-pointer flex justify-between items-center hover:bg-gray-700 transition ${selectedSymbol === asset.symbol ? 'bg-blue-600/20 border-l-2 border-blue-500' : ''}`}
              >
                <div>
                    <span className="font-bold text-sm block">{asset.symbol}</span>
                    <span className="text-[10px] text-gray-400">{asset.name}</span>
                </div>
                <span className="text-[9px] bg-gray-900 px-1.5 py-0.5 rounded text-gray-400 border border-gray-700">{asset.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Chart */}
        <div className="flex-1 relative bg-[#131722] flex flex-col">
            {/* Chart Container */}
            <div id="tradingview_chart" className="w-full h-full"></div>
        </div>

        {/* Right: Order Panel */}
        <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold text-lg flex items-center justify-between">
                    {selectedSymbol} <span className="text-xs font-normal text-gray-400 bg-gray-900 px-2 py-1 rounded">Market Open</span>
                </h3>
            </div>

            <div className="p-4 flex-1">
                {/* Volume Input */}
                <div className="mb-6">
                    <label className="text-xs text-gray-400 block mb-1">Volume (Lots)</label>
                    <div className="flex items-center">
                        <button className="bg-gray-700 p-2 rounded-l hover:bg-gray-600">-</button>
                        <input type="number" defaultValue="0.01" className="w-full bg-gray-900 text-center py-2 border-y border-gray-600 text-white focus:outline-none" />
                        <button className="bg-gray-700 p-2 rounded-r hover:bg-gray-600">+</button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                    <div>
                        <p className="text-gray-500">Margin</p>
                        <p className="font-bold">23.45 USD</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Leverage</p>
                        <p className="font-bold">1:100</p>
                    </div>
                </div>

                {/* Buy/Sell Buttons */}
                <div className="flex gap-3 mt-4">
                    <button className="flex-1 bg-red-500/10 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 py-3 rounded transition flex flex-col items-center">
                        <span className="text-xs font-bold">SELL</span>
                        <span className="text-lg font-bold">1.0845</span>
                    </button>
                    <button className="flex-1 bg-green-500/10 border border-green-500/50 hover:bg-green-500 hover:text-white text-green-500 py-3 rounded transition flex flex-col items-center">
                        <span className="text-xs font-bold">BUY</span>
                        <span className="text-lg font-bold">1.0848</span>
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default Terminal