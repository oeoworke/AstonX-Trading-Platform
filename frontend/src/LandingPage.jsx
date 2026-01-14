import { Link } from 'react-router-dom'
import { 
  Twitter, Linkedin, Send, Mail, MapPin, ExternalLink, ShieldAlert, Globe, MessageSquare 
} from 'lucide-react'

function LandingPage() {
  // Dummy Partners Data
  const partners = [
    "Binance", "Coinbase", "TradingView", "MetaTrader 5", "AWS", "Google Cloud", 
    "Stripe", "Kraken", "Revolut", "Bloomberg"
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      
      {/* Custom Styles for Marquee Animation */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* Header */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-12">
                <h1 className="text-2xl font-bold text-yellow-500 tracking-tighter">AstonX</h1>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition">Trading</a>
                    <a href="#" className="hover:text-white transition">Markets</a>
                    <a href="#" className="hover:text-white transition">Platforms</a>
                    <a href="#" className="hover:text-white transition">Tools</a>
                </div>
            </div>
            
            <div className="flex gap-4">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium px-4 py-2 flex items-center">
                    Sign in
                </Link>
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-bold transition flex items-center">
                    Open Account
                </Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-block bg-gray-800 rounded-full px-4 py-1 text-xs text-yellow-500 font-bold tracking-wide mb-2">
                NEW GENERATION PLATFORM WITH AI
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
                Trade with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Confidence</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Experience ultra-low spreads, instant execution, and AI-powered insights on the world's most advanced trading platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link 
                  to="/terminal" 
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full text-lg font-bold text-center transition transform hover:translate-y-[-2px]"
                >
                  Launch Web Terminal
                </Link>
                <button className="border border-gray-700 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-full text-lg font-bold transition">
                    View Markets
                </button>
            </div>

            <div className="flex justify-center md:justify-start gap-8 pt-8 border-t border-gray-800 mt-8">
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

        {/* Hero Visual */}
        <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-[400px] h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-6 shadow-2xl transform md:rotate-3 hover:rotate-0 transition duration-500">
                <div className="h-full w-full bg-gray-900 rounded-xl overflow-hidden relative">
                    <div className="absolute top-0 w-full h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-yellow-500/20 to-transparent"></div>
                    <svg className="absolute bottom-20 left-0 w-full h-40 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M0 200 C 100 150, 200 250, 300 100 S 400 150, 500 50" />
                    </svg>
                    <div className="absolute top-20 left-6">
                        <p className="text-sm text-gray-400">Bitcoin / USD</p>
                        <p className="text-4xl font-bold text-white mt-2">$94,230.50</p>
                        <p className="text-green-500 mt-1 flex items-center gap-1">▲ +2.45%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- PARTNER LOGO MARQUEE ANIMATION --- */}
      <div className="py-20 border-t border-gray-900 bg-black overflow-hidden">
        <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Our Strategic Partners</p>
        <div className="relative flex">
          <div className="animate-marquee">
            {/* Displaying logos twice for infinite effect */}
            {[...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex items-center gap-2 px-12 group cursor-pointer">
                <Globe className="text-gray-600 group-hover:text-yellow-500 transition-colors" size={24} />
                <span className="text-2xl font-black text-gray-700 group-hover:text-white transition-colors tracking-tighter">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-black border-t border-gray-800 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-yellow-500">AstonX</h3>
              <p className="text-gray-400 leading-relaxed">
                Empowering traders with next-generation AI algorithms and lightning-fast execution. The future of trading is here.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"><Twitter size={20}/></a>
                <a href="#" className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"><Linkedin size={20}/></a>
                <a href="#" className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"><Send size={20}/></a>
                <a href="#" className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"><MessageSquare size={20}/></a>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-500 transition">Web Terminal</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Mobile App</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">AI Predictions</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">API Documentation</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Market Analysis</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-500 transition">About Us</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Contact Support</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Careers</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Terms of Service</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-4">
              <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Get in Touch</h4>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <Mail size={18} className="text-yellow-500 shrink-0" />
                <span>support@astonx.trade</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={18} className="text-yellow-500 shrink-0" />
                <span>Financial District, Jaffna, 40000</span>
              </div>
              <div className="pt-4">
                <button className="flex items-center gap-2 text-xs font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-widest">
                  System Status: Online <ExternalLink size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Risk Disclosure */}
          <div className="border-y border-gray-900 py-10 mb-8">
            <div className="flex items-start gap-4 text-gray-500 text-xs leading-relaxed">
              <ShieldAlert className="shrink-0 text-gray-700" size={24} />
              <p>
                <span className="text-gray-400 font-bold">RISK WARNING:</span> Trading financial instruments involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose and should ensure that you fully understand the risks involved. Trading leveraged products may not be suitable for all investors. Before trading, please take into consideration your level of experience, investment objectives and seek independent financial advice if necessary.
              </p>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AstonX AI Trading. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500 font-medium">
              <a href="#" className="hover:text-white transition">Cookies</a>
              <a href="#" className="hover:text-white transition">Security</a>
              <a href="#" className="hover:text-white transition">AML Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage