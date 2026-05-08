import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  ShieldCheck, 
  Target, 
  Search,
  Bell,
  BarChart3
} from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';

// --- Types ---
interface TickerData {
  symbol: string;
  tvSymbol: string;
  price: number;
  change: number;
  trend: 'BULL' | 'BEAR' | 'SIDE';
  category: 'STOCKS' | 'FOREX' | 'CRYPTO';
  prediction?: 'Bullish' | 'Bearish';
  confidence?: number;
  atr: number;
  mtfTrends: {
    '5m': 'BULL' | 'BEAR' | 'SIDE';
    '15m': 'BULL' | 'BEAR' | 'SIDE';
    '1h': 'BULL' | 'BEAR' | 'SIDE';
    '4h': 'BULL' | 'BEAR' | 'SIDE';
  };
}

interface PaperTrade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
  timestamp: number;
}

// --- Mock Data ---
const INITIAL_TICKERS: TickerData[] = [
  { 
    symbol: 'RELIANCE', tvSymbol: 'NSE:RELIANCE', price: 2945.10, change: 0.5, trend: 'BULL', category: 'STOCKS', prediction: 'Bullish', confidence: 88.4,
    atr: 45.2, mtfTrends: { '5m': 'BULL', '15m': 'BULL', '1h': 'BULL', '4h': 'SIDE' }
  },
  { 
    symbol: 'TCS', tvSymbol: 'NSE:TCS', price: 3820.00, change: 0.2, trend: 'SIDE', category: 'STOCKS', prediction: 'Bearish', confidence: 72.1,
    atr: 65.5, mtfTrends: { '5m': 'SIDE', '15m': 'BEAR', '1h': 'SIDE', '4h': 'BULL' }
  },
  { 
    symbol: 'INFY', tvSymbol: 'NSE:INFY', price: 1450.30, change: -1.5, trend: 'BEAR', category: 'STOCKS', prediction: 'Bearish', confidence: 91.5,
    atr: 28.4, mtfTrends: { '5m': 'BEAR', '15m': 'BEAR', '1h': 'BEAR', '4h': 'BEAR' }
  },
  { 
    symbol: 'HDFCBANK', tvSymbol: 'NSE:HDFCBANK', price: 1642.15, change: 0.8, trend: 'BULL', category: 'STOCKS', prediction: 'Bullish', confidence: 84.0,
    atr: 22.1, mtfTrends: { '5m': 'BULL', '15m': 'BULL', '1h': 'SIDE', '4h': 'BULL' }
  },
  { 
    symbol: 'EUR/USD', tvSymbol: 'FX:EURUSD', price: 1.08450, change: 0.12, trend: 'BULL', category: 'FOREX', prediction: 'Bullish', confidence: 79.2,
    atr: 0.0045, mtfTrends: { '5m': 'BULL', '15m': 'BULL', '1h': 'BULL', '4h': 'BULL' }
  },
  { 
    symbol: 'GBP/USD', tvSymbol: 'FX:GBPUSD', price: 1.26420, change: -0.05, trend: 'SIDE', category: 'FOREX', prediction: 'Bearish', confidence: 68.4,
    atr: 0.0058, mtfTrends: { '5m': 'SIDE', '15m': 'SIDE', '1h': 'BEAR', '4h': 'BULL' }
  },
];

// --- Components ---
const NeuralChart: React.FC<{ 
  ticker: TickerData, 
  trades: PaperTrade[] 
}> = ({ ticker, trades }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const stSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#020617' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#4f46e5', labelBackgroundColor: '#4f46e5' },
        horzLine: { color: '#4f46e5', labelBackgroundColor: '#4f46e5' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        timeVisible: true,
      },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const emaSeries = chart.addLineSeries({
      color: 'rgba(148, 163, 184, 0.5)',
      lineWidth: 1,
      title: 'EMA 200',
    });

    const stSeries = chart.addLineSeries({
      color: '#22c55e',
      lineWidth: 2,
      title: 'Supertrend',
    });

    // Initial Data Generation (Simulated History)
    const initialData = [];
    const now = Math.floor(Date.now() / 1000);
    let basePrice = ticker.price - (ticker.change * 10);
    
    for (let i = 100; i >= 0; i--) {
      const time = now - (i * 60);
      const open = basePrice + (Math.random() - 0.5) * ticker.atr;
      const close = open + (Math.random() - 0.5) * ticker.atr;
      const high = Math.max(open, close) + Math.random() * (ticker.atr * 0.5);
      const low = Math.min(open, close) - Math.random() * (ticker.atr * 0.5);
      
      initialData.push({ time, open, high, low, close });
      basePrice = close;
    }

    candleSeries.setData(initialData as any);
    
    // Simulating EMA and Supertrend
    const emaData = initialData.map((d, i) => ({
      time: d.time,
      value: d.close * (1 + (Math.sin(i / 10) * 0.01))
    }));
    emaSeries.setData(emaData);

    const stData = initialData.map((d, i) => ({
      time: d.time,
      value: d.close * (1 - (ticker.prediction === 'Bullish' ? 0.01 : -0.01))
    }));
    stSeries.setData(stData);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    emaSeriesRef.current = emaSeries;
    stSeriesRef.current = stSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [ticker.symbol]);

  // Update real-time candle
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    
    const lastTime = Math.floor(Date.now() / 1000);
    const lastCandle = {
      time: lastTime,
      open: ticker.price - (Math.random() * 2),
      high: ticker.price + Math.random() * 5,
      low: ticker.price - Math.random() * 5,
      close: ticker.price
    };
    
    candleSeriesRef.current.update(lastCandle as any);

    // Markers for trades
    const markers = trades.filter(t => t.symbol === ticker.symbol).map(t => ({
      time: Math.floor(t.timestamp / 1000),
      position: t.type === 'LONG' ? 'belowBar' : 'aboveBar',
      color: t.type === 'LONG' ? '#22c55e' : '#ef4444',
      shape: t.type === 'LONG' ? 'arrowUp' : 'arrowDown',
      text: t.type === 'LONG' ? 'BUY' : 'SELL',
    }));
    
    candleSeriesRef.current.setMarkers(markers as any);
  }, [ticker.price, trades]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

const MTFTrendGrid: React.FC<{ trends: TickerData['mtfTrends'] }> = ({ trends }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {Object.entries(trends).map(([tf, state]) => (
        <div key={tf} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{tf}</span>
          <div className="flex items-center justify-between">
             <span className={`text-[11px] font-bold tracking-tight ${
               state === 'BULL' ? 'text-green-500' : state === 'BEAR' ? 'text-red-500' : 'text-slate-400'
             }`}>{state === 'BULL' ? 'BULLISH' : state === 'BEAR' ? 'BEARISH' : 'SIDEWAYS'}</span>
             <div className={`w-1.5 h-1.5 rounded-full ${
               state === 'BULL' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
               state === 'BEAR' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
               'bg-slate-600'
             }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const containerId = "tv-chart-container";
  const [tickers, setTickers] = useState<TickerData[]>(INITIAL_TICKERS);
  const [activeTicker, setActiveTicker] = useState(INITIAL_TICKERS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTrades, setActiveTrades] = useState<PaperTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<PaperTrade[]>([]);

  // --- Auto-Trading Engine ---
  useEffect(() => {
    // 1. Monitor signals for active ticker
    const liveActiveTicker = tickers.find(t => t.tvSymbol === activeTicker.tvSymbol) || activeTicker;
    
    if (liveActiveTicker.confidence && liveActiveTicker.confidence > 88) {
      const hasOpenTrade = activeTrades.some(t => t.symbol === liveActiveTicker.symbol && t.status === 'OPEN');
      
      if (!hasOpenTrade) {
        // Execute Auto-Trade
        const type = liveActiveTicker.prediction === 'Bullish' ? 'LONG' : 'SHORT';
        const sl = type === 'LONG' ? liveActiveTicker.price - (liveActiveTicker.atr * 2) : liveActiveTicker.price + (liveActiveTicker.atr * 2);
        const tp = type === 'LONG' ? liveActiveTicker.price + (liveActiveTicker.atr * 3) : liveActiveTicker.price - (liveActiveTicker.atr * 3);
        
        const newTrade: PaperTrade = {
          id: Math.random().toString(36).substr(2, 9),
          symbol: liveActiveTicker.symbol,
          type,
          entryPrice: liveActiveTicker.price,
          currentPrice: liveActiveTicker.price,
          sl,
          tp,
          pnl: 0,
          status: 'OPEN',
          timestamp: Date.now()
        };
        
        setActiveTrades(prev => [newTrade, ...prev]);
        console.log(`[Auto-Trader] Executed ${type} for ${liveActiveTicker.symbol}`);
      }
    }
  }, [tickers, activeTicker.symbol]);

  // 2. Manage Active Trades (Update PnL & Check SL/TP)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => {
        const updated = prev.map(trade => {
          const liveTicker = tickers.find(t => t.symbol === trade.symbol);
          if (!liveTicker) return trade;
          
          const currentPrice = liveTicker.price;
          const pnl = trade.type === 'LONG' 
            ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100
            : ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100;
          
          return { ...trade, currentPrice, pnl };
        });

        // Check for exits
        const closed: PaperTrade[] = [];
        const stillOpen = updated.filter(t => {
          const hitSL = t.type === 'LONG' ? t.currentPrice <= t.sl : t.currentPrice >= t.sl;
          const hitTP = t.type === 'LONG' ? t.currentPrice >= t.tp : t.currentPrice <= t.tp;
          
          if (hitSL || hitTP) {
            closed.push({ ...t, status: 'CLOSED' });
            return false;
          }
          return true;
        });

        if (closed.length > 0) {
          setTradeHistory(prevH => [...closed, ...prevH]);
        }
        
        return stillOpen;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tickers]);

  // --- Real-Time Sync Engine ---
  useEffect(() => {
    // 1. Mock Data for Stocks & Forex
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        if (t.category === 'CRYPTO') return t; // Skip crypto, handled by WS
        const volatility = t.category === 'FOREX' ? 0.0001 : 1.5;
        const priceChange = (Math.random() - 0.5) * volatility;
        return { 
          ...t, 
          price: t.price + priceChange,
          confidence: t.confidence ? Math.min(99, Math.max(60, t.confidence + (Math.random() - 0.5))) : 80
        };
      }));
    }, 2000);

    // 2. Real-Time WebSocket for Crypto (Binance)
    const cryptoTickers = tickers.filter(t => t.category === 'CRYPTO');
    if (cryptoTickers.length === 0) return () => clearInterval(interval);

    const streams = cryptoTickers.map(t => {
      const clean = t.tvSymbol.toLowerCase().replace('binance:', '').replace('usdt', '');
      return `${clean}usdt@ticker`;
    }).join('/');

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s; // e.g. BTCUSDT
      const currentPrice = parseFloat(data.c);
      const dayChange = parseFloat(data.P);

      setTickers(prev => prev.map(t => {
        const tMatch = t.tvSymbol.toUpperCase().replace('BINANCE:', '').replace('USDT', '') + 'USDT';
        if (tMatch === symbol) {
          return { ...t, price: currentPrice, change: dayChange, trend: dayChange >= 0 ? 'UP' : 'DOWN' };
        }
        return t;
      }));
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [tickers.length]); // Re-init if new tickers added

  // --- Sync Engine Update ---
  // (We'll keep the interval engine as it is, it drives the ticker price which drives the chart)

  // --- Search Handler ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    // Smart Prefixing (Help users who type simple symbols)
    let tvSymbol = query;
    if (!query.includes(':')) {
      if (query.includes('INR') || query.includes('NSE') || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'].includes(query)) {
        tvSymbol = `NSE:${query}`;
      } else if (['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'].includes(query)) {
        tvSymbol = `BINANCE:${query}USDT`;
      } else if (query.length === 6 && !query.includes('/')) {
        tvSymbol = `FX_IDC:${query}`;
      } else {
        // Default to a broad search or common exchange
        tvSymbol = query;
      }
    }

    const existing = tickers.find(t => t.tvSymbol === tvSymbol || t.symbol === query);
    
    if (existing) {
      setActiveTicker(existing);
      setSearchQuery("");
      return;
    }

    // Determine category
    const isForex = tvSymbol.includes('FX') || tvSymbol.includes('/') || (query.length === 6 && !query.includes(':'));
    const isCrypto = tvSymbol.includes('BINANCE') || tvSymbol.includes('CRYPTO') || ['BTC', 'ETH', 'USDT'].some(c => query.includes(c));
    
    let basePrice = 100;
    if (isForex) {
      basePrice = 1.0 + (Math.random() * 0.2);
    } else if (isCrypto) {
      if (query.includes('BTC')) basePrice = 64000 + (Math.random() * 2000);
      else if (query.includes('ETH')) basePrice = 3400 + (Math.random() * 200);
      else basePrice = 1 + (Math.random() * 1000);
    } else {
      basePrice = 50 + (Math.random() * 5000);
    }
    
    const newTicker: TickerData = {
      symbol: query.split(':')[1] || query,
      tvSymbol: tvSymbol,
      price: basePrice,
      change: (Math.random() * 4) - 2, 
      trend: Math.random() > 0.5 ? 'BULL' : 'BEAR',
      category: isCrypto ? 'CRYPTO' : isForex ? 'FOREX' : 'STOCKS',
      prediction: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
      confidence: 75 + Math.random() * 15,
      atr: isForex ? 0.005 : isCrypto ? basePrice * 0.02 : basePrice * 0.015,
      mtfTrends: {
        '5m': Math.random() > 0.5 ? 'BULL' : 'BEAR',
        '15m': Math.random() > 0.5 ? 'BULL' : 'BEAR',
        '1h': Math.random() > 0.5 ? 'BULL' : 'SIDE',
        '4h': Math.random() > 0.5 ? 'BULL' : 'SIDE'
      }
    };

    setTickers(prev => [newTicker, ...prev]);
    setActiveTicker(newTicker);
    setSearchQuery("");
  };

  // Find the live data for the active ticker from the tickers array
  const liveActiveTicker = tickers.find(t => t.tvSymbol === activeTicker.tvSymbol) || activeTicker;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <nav className="h-16 border-b border-white/5 px-6 flex items-center justify-between glass z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">OmniTrade AI</h1>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Neural Pro Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 glow-green"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Neural Engine: Active</span>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-white/5 rounded-lg"><Search className="w-5 h-5 text-slate-400" /></button>
             <button className="p-2 hover:bg-white/5 rounded-lg relative"><Bell className="w-5 h-5 text-slate-400" /></button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 sidebar-glass flex flex-col relative z-20">
          <div className="p-6 border-b border-white/5">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search market (Ex: AAPL, BTC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-200 placeholder:text-slate-600"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-8">
            {[
              { id: 'STOCKS', label: 'Stocks', icon: <Target className="w-3.5 h-3.5" /> },
              { id: 'FOREX', label: 'Forex', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
              { id: 'CRYPTO', label: 'Crypto', icon: <Bell className="w-3.5 h-3.5" /> }
            ].map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="section-header">
                   <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                     {cat.icon}
                   </div>
                   <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat.label}</h2>
                </div>
                <div className="flex flex-col gap-2 px-2">
                  {tickers.filter(t => t.category === (cat.id as any)).map((t) => (
                    <button 
                      key={t.tvSymbol}
                      onClick={() => setActiveTicker(t)}
                      className={`ticker-card relative group ${activeTicker.tvSymbol === t.tvSymbol ? 'active' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[13px] tracking-tight text-slate-200 group-hover:text-white transition-colors">{t.symbol}</div>
                          <div className="text-[10px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{t.tvSymbol}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-mono font-bold tracking-tighter text-slate-200">
                            {t.category === 'STOCKS' ? '₹' : t.category === 'CRYPTO' ? '$' : ''}
                            {t.price.toLocaleString(undefined, { minimumFractionDigits: t.category === 'FOREX' ? 5 : 2 })}
                          </div>
                          <div className={`text-[9px] font-black tracking-widest ${t.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {t.change >= 0 ? '+' : ''}{t.change}%
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 min-h-0 w-full relative bg-[#020617] group">
             {/* Floating Signal Indicator */}
             <div className="absolute top-6 right-6 z-30 pointer-events-none transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                <div className={`flex flex-col gap-4 p-5 rounded-[2rem] border backdrop-blur-2xl shadow-2xl transition-all duration-700 ${
                  liveActiveTicker.prediction === 'Bullish'
                  ? 'bg-green-500/10 border-green-500/20 shadow-green-500/10'
                  : 'bg-red-500/10 border-red-500/20 shadow-red-500/10'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${liveActiveTicker.prediction === 'Bullish' ? 'bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}>
                      {liveActiveTicker.prediction === 'Bullish' ? <TrendingUp className="w-6 h-6 text-green-500" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
                    </div>
                     <div>
                       <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Neural Bias</div>
                       <div className={`text-xl font-black uppercase tracking-widest ${liveActiveTicker.prediction === 'Bullish' ? 'text-green-500' : 'text-red-500'}`}>
                         {liveActiveTicker.prediction === 'Bullish' ? 'Strong Buy' : 'Strong Sell'}
                       </div>
                       <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-1 h-1 rounded-full ${liveActiveTicker.trend === 'SIDE' ? 'bg-indigo-400' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'}`}></div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Phase: {liveActiveTicker.trend === 'SIDE' ? 'Sideways (Neutral)' : 'Trending (Aggressive)'}
                          </span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${liveActiveTicker.prediction === 'Bullish' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${liveActiveTicker.confidence || 80}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center px-1">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confidence</div>
                    <div className="text-xs font-mono font-bold text-slate-200">{(liveActiveTicker.confidence || 80).toFixed(1)}%</div>
                  </div>
                </div>
             </div>
             <div id={containerId} className="w-full h-full relative">
                <NeuralChart ticker={liveActiveTicker} trades={activeTrades} />
             </div>
          </div>

          <div className="h-56 border-t border-white/5 p-6 flex gap-6 sidebar-glass mt-auto relative z-20">
             <div className="flex-1 bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
                      <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">Execution Terminal</span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">Neural Optimized Parameters</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 glow-green"></div>
                    <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Live Consensus</span>
                  </div>
                </div>
                
                 <div className="grid grid-cols-4 gap-8 mt-6 relative z-10">
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">Entry Price</span>
                        <span className="text-lg font-mono font-bold text-slate-200 tracking-tighter">
                          {liveActiveTicker.category === 'STOCKS' ? '₹' : liveActiveTicker.category === 'CRYPTO' ? '$' : ''}
                          {liveActiveTicker.price.toFixed(liveActiveTicker.category === 'FOREX' ? 5 : 2)}
                        </span>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-red-500/50 font-black uppercase tracking-widest opacity-80">Stop Loss</span>
                        <span className="text-lg font-mono font-bold text-red-400 tracking-tighter">
                          {liveActiveTicker.category === 'STOCKS' ? '₹' : liveActiveTicker.category === 'CRYPTO' ? '$' : ''}
                          {(liveActiveTicker.prediction === 'Bullish' 
                            ? liveActiveTicker.price - (liveActiveTicker.atr * 2)
                            : liveActiveTicker.price + (liveActiveTicker.atr * 2)).toFixed(liveActiveTicker.category === 'FOREX' ? 5 : 2)}
                        </span>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-green-500/50 font-black uppercase tracking-widest opacity-80">Target TP1</span>
                        <span className="text-lg font-mono font-bold text-green-400 tracking-tighter">
                          {liveActiveTicker.category === 'STOCKS' ? '₹' : liveActiveTicker.category === 'CRYPTO' ? '$' : ''}
                          {(liveActiveTicker.prediction === 'Bullish' 
                            ? liveActiveTicker.price + (liveActiveTicker.atr * 1.5)
                            : liveActiveTicker.price - (liveActiveTicker.atr * 1.5)).toFixed(liveActiveTicker.category === 'FOREX' ? 5 : 2)}
                        </span>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-emerald-500/50 font-black uppercase tracking-widest opacity-80">Target TP2</span>
                        <span className="text-lg font-mono font-bold text-emerald-400 tracking-tighter">
                          {liveActiveTicker.category === 'STOCKS' ? '₹' : liveActiveTicker.category === 'CRYPTO' ? '$' : ''}
                          {(liveActiveTicker.prediction === 'Bullish' 
                            ? liveActiveTicker.price + (liveActiveTicker.atr * 3)
                            : liveActiveTicker.price - (liveActiveTicker.atr * 3)).toFixed(liveActiveTicker.category === 'FOREX' ? 5 : 2)}
                        </span>
                     </div>
                 </div>

                                <div className="flex items-center gap-8 mt-6 pt-5 border-t border-white/5 relative z-10">
                    <div className="flex-1 flex flex-col gap-2.5">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-indigo-400/70">Neural Auto-Trader</span>
                         <span className={`font-mono ${activeTrades.length > 0 ? 'text-green-500 animate-pulse' : 'text-slate-600'}`}>
                           {activeTrades.length > 0 ? 'AUTO-TRADING ACTIVE' : 'MONITORING SIGNALS...'}
                         </span>
                       </div>
                       <div className="h-2 w-full bg-slate-800/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                         <div className={`h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] ${activeTrades.length > 0 ? 'animate-pulse' : ''}`} style={{ width: `${liveActiveTicker.confidence || 80}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-white/5 pl-8">
                       <div className="text-right">
                         <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Active Trades</div>
                         <div className="text-base font-mono font-bold text-slate-200">{activeTrades.length}</div>
                       </div>
                       <div className="flex flex-col gap-2">
                         <button className="px-8 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                           Trading Active
                         </button>
                         <button 
                           onClick={() => {
                             setIsSyncing(true);
                             setTimeout(() => setIsSyncing(false), 2000);
                           }}
                           className={`px-8 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${
                             isSyncing ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                           }`}
                         >
                           {isSyncing ? 'Syncing...' : 'Sync Price'}
                         </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="w-[420px] bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 flex flex-col shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 blur-[60px] rounded-full -ml-12 -mb-12"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
                      <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">Live Positions</span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">Neural Trading Log</h3>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                     <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active: {activeTrades.length}</span>
                  </div>
                </div>
                
                 <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {activeTrades.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
                           <Activity className="w-8 h-8 mb-3" />
                           <p className="text-xs font-bold uppercase tracking-widest">Waiting for High Confidence Signal (>88%)</p>
                        </div>
                      )}
                      {activeTrades.map(trade => (
                        <div key={trade.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group/trade hover:bg-white/[0.08] transition-all">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-black text-slate-200">{trade.symbol}</span>
                                 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${trade.type === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{trade.type}</span>
                              </div>
                              <div className={`text-[13px] font-mono font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                 {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                              </div>
                           </div>
                           <div className="flex justify-between items-end">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Entry</span>
                                 <span className="text-[10px] font-mono font-bold text-slate-400">{trade.entryPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-right">
                                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Current</span>
                                 <span className="text-[10px] font-mono font-bold text-slate-300 animate-pulse">{trade.currentPrice.toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                              <div className="absolute inset-0 flex justify-center items-center px-1">
                                 <div className="h-full w-px bg-white/20 z-10"></div>
                              </div>
                              <div className={`h-full transition-all duration-500 ${trade.pnl >= 0 ? 'bg-green-500 ml-[50%]' : 'bg-red-500 mr-[50%] absolute right-0'}`} style={{ width: `${Math.min(50, Math.abs(trade.pnl) * 5)}%` }}></div>
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recent Exits</span>
                         <span className="text-[10px] font-mono font-bold text-slate-400">P/L: {tradeHistory.reduce((acc, t) => acc + t.pnl, 0).toFixed(2)}%</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {tradeHistory.map(t => (
                           <div key={t.id} className="flex-shrink-0 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                              <span className="text-[9px] font-black text-slate-300">{t.symbol}</span>
                              <span className={`text-[10px] font-mono font-bold ${t.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(1)}%
                              </span>
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
