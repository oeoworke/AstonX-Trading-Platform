import { useEffect, useRef } from 'react'
import { Globe, ShieldCheck, Activity } from 'lucide-react'

function Calendar() {
  const container = useRef();

  useEffect(() => {
    // Pathaiya widget edhavadhu irundha clear panrom
    if (container.current) {
      container.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    
    // TradingView Economic Calendar Configuration
    // height-ai 100% nu maathi, container full-ah varum pdi set pannirukkom
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "colorTheme": "dark",
      "isTransparent": false,
      "locale": "en",
      "importanceFilter": "-1,0,1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-6 font-sans flex flex-col h-screen">
      
      {/* Header Section - Konjam compact-ah maathi irukkom to give more space for news */}
      <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-md gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Globe className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">Economic Intelligence</h1>
            <p className="text-gray-500 text-xs font-medium">Real-time Global Market Events</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
          <Activity className="text-green-500" size={14} />
          <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">Live Stream Active</span>
        </div>
      </header>

      {/* Main Content: TradingView Widget Container */}
      {/* h-full and flex-1 logic-ai use panni, indha box-ai screen-oda 
        bottom varai perusaakki irukkoam.
      */}
      <div className="flex-1 bg-[#131722] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative mb-4">
        {/* TradingView Widget Inga load aagum */}
        <div ref={container} className="tradingview-widget-container w-full h-full">
          <div className="tradingview-widget-container__widget w-full h-full"></div>
        </div>
      </div>

      {/* Footer Info - Shrink-0 helps to keep footer at the bottom without overlapping */}
      <footer className="flex flex-col md:flex-row justify-between items-center gap-4 px-2 opacity-60 shrink-0 mb-2">
        <div className="flex items-center gap-2 text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">
          <ShieldCheck size={12} />
          Institutional Grade Data Source
        </div>
        <p className="text-gray-500 text-[9px] uppercase tracking-[0.1em]">
          © {new Date().getFullYear()} AstonX AI Trading
        </p>
      </footer>

    </div>
  )
}

export default Calendar