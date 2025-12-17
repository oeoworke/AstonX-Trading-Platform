import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-12">
                <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX.</h1>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition">Trading</a>
                    <a href="#" className="hover:text-white transition">Markets</a>
                    <a href="#" className="hover:text-white transition">Platforms</a>
                    <a href="#" className="hover:text-white transition">Tools</a>
                </div>
            </div>
            
            {/* --- INGA DHAAN MAATRAM SEITHULLOM (Login & Register Links) --- */}
            <div className="flex gap-4">
                {/* Sign In Button -> Login Page */}
                <Link to="/login" className="text-gray-300 hover:text-white font-medium px-4 py-2 flex items-center">
                    Sign in
                </Link>
                
                {/* Open Account Button -> Register Page */}
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-bold transition flex items-center">
                    Open Account
                </Link>
            </div>
            {/* ----------------------------------------------------------- */}

        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
            <div className="inline-block bg-gray-800 rounded-full px-4 py-1 text-xs text-yellow-500 font-bold tracking-wide mb-2">
                NEW GENERATION PLATFORM
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
                Trade with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Confidence</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                Experience ultra-low spreads, instant execution, and AI-powered insights on the world's most advanced trading platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Launch Terminal Button */}
                <Link 
                  to="/terminal" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full text-lg font-bold text-center transition transform hover:translate-y-[-2px]"
                >
                  Launch Web Terminal ↗
                </Link>
                <button className="border border-gray-700 hover:border-gray-500 px-8 py-4 rounded-full text-lg font-bold transition">
                    View Markets
                </button>
            </div>

            <div className="flex gap-8 pt-8 border-t border-gray-800 mt-8">
                <div>
                    <p className="text-3xl font-bold text-white">0.0</p>
                    <p className="text-sm text-gray-500 mt-1">Pip Spreads</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-white">0.1s</p>
                    <p className="text-sm text-gray-500 mt-1">Execution Speed</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-white">24/7</p>
                    <p className="text-sm text-gray-500 mt-1">Support</p>
                </div>
            </div>
        </div>

        {/* Hero Visual (CSS Art) */}
        <div className="flex-1 w-full flex justify-center">
            <div className="relative w-[400px] h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                {/* Mockup Screen Content */}
                <div className="h-full w-full bg-gray-900 rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 w-full h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    {/* Abstract Chart Line */}
                    <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-yellow-500/20 to-transparent"></div>
                    <svg className="absolute bottom-20 left-0 w-full h-40 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M0 200 C 100 150, 200 250, 300 100 S 400 150, 500 50" />
                    </svg>
                    
                    <div className="absolute top-20 left-6">
                        <p className="text-sm text-gray-400">Bitcoin / USD</p>
                        <p className="text-4xl font-bold text-white mt-2">$94,230.50</p>
                        <p className="text-green-500 mt-1 flex items-center gap-1">
                            ▲ +2.45%
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage