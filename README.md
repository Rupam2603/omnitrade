# OmniTrade AI [Pro] ⚡

Institutional-grade algorithmic trading terminal powered by a multi-layer neural ensemble and sub-second execution engine.

![Terminal Preview](https://github.com/Rupam2603/omnitrade/raw/main/public/icons.svg)

## 🚀 Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Charting**: Lightweight-Charts (TradingView Engine)
- **Neural Engine**: 3-Tier Ensemble (Confidence-based signal generation)
- **Data Flow**: Sub-second price synchronization via Binance WebSockets & Institutional Mock Feeds
- **Risk Management**: Dynamic ATR-based Stop-Loss/Take-Profit calculation

## ✨ Key Features

### 1. Neural Auto-Trader
Fully autonomous paper trading engine that executes trades based on high-confidence signals (>88%). It manages the entire trade lifecycle, including auto-exits on SL/TP hits.

### 2. Multi-Timeframe (MTF) Trend Grid
Real-time trend consensus across 5m, 15m, 1h, and 4h timeframes, providing a holistic view of market direction and momentum.

### 3. Custom Indicator Suite
- **Supertrend**: Volatility-aware trend tracking.
- **EMA 200**: Institutional trend filter.
- **Signal Markers**: On-chart visual markers for automated entry/exit points.

### 4. Institutional HUD
- **Neural Bias Gauge**: Visual confidence tracker for current trade signals.
- **Execution Terminal**: Real-time position sizing and risk parameter monitoring.
- **Live Trading Log**: Persistent session tracking for active and historical trades.

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/Rupam2603/omnitrade.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📈 Roadmap
- [x] Automated Paper Trading Engine
- [x] Custom Chart Indicator Integration
- [x] MTF Trend Consensus Grid
- [ ] Multi-Asset Portfolio Management
- [ ] Advanced Order Types (Trailing Stops, Partial Profit)
- [ ] Backend Persistence for Trade History

---
**Disclaimer**: This is a paper trading simulation and research tool. Use for educational purposes only.
