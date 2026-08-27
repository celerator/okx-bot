import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Activity, Wallet, AlertTriangle, Settings, RefreshCw, 
  Clock, ShieldAlert, Key, CheckCircle, XCircle
} from 'lucide-react';

const formatMoney = (val) => {
  const num = Number(val) || 0;
  const prefix = num >= 0 ? '+' : '';
  return `${prefix}$${Math.abs(num).toFixed(2)}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bots, setBots] = useState([]);
  const [apiError, setApiError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/okx');
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Грешка при зареждане на данните');
      }

      const rawBotsData = json.data || [];
      const processedBots = rawBotsData.map(b => {
        const invested = Number(b.investAmt || 0);
        const gridProfit = Number(b.gridProfit || 0);
        const fees = Number(b.fee || 0);
        const unrealizedPnl = Number(b.floatProfit || 0);
        
        const realizedPnl = gridProfit - fees;
        const totalPnl = realizedPnl + unrealizedPnl;
        const roi = invested > 0 ? ((totalPnl / invested) * 100).toFixed(2) : 0;

        return {
          id: b.algoId,
          name: `${b.instId} Grid`,
          pair: b.instId,
          type: 'Grid',
          status: b.state === 'running' ? 'RUNNING' : b.state,
          invested,
          gridProfit,
          fees,
          unrealizedPnl,
          realizedPnl,
          totalPnl,
          roi
        };
      });

      setBots(processedBots);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
      setApiError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const portfolio = useMemo(() => {
    return bots.reduce((acc, bot) => {
      acc.invested += bot.invested;
      acc.gridProfit += bot.gridProfit;
      acc.fees += bot.fees;
      acc.unrealizedPnl += bot.unrealizedPnl;
      acc.realizedPnl += bot.realizedPnl;
      acc.totalPnl += bot.totalPnl;
      return acc;
    }, { invested: 0, gridProfit: 0, fees: 0, unrealizedPnl: 0, realizedPnl: 0, totalPnl: 0 });
  }, [bots]);

  const portfolioROI = portfolio.invested > 0 ? ((portfolio.totalPnl / portfolio.invested) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-8 p-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">OKX<span className="text-blue-500">Dash</span></span>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen bg-[#0a0e17]">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Portfolio Overview</h1>
              <p className="text-gray-400 mt-1">{lastUpdated && <span>Последно обновяване: {lastUpdated}</span>}</p>
            </div>
            <button onClick={loadData} className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-800 transition-colors">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Обнови сега
            </button>
          </header>

          {apiError && (
            <div className="bg-red-900/40 border border-red-500 p-4 rounded-xl flex items-start text-red-200">
              <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-red-400" />
              <div>
                <h4 className="font-bold text-red-400">Грешка при връзката с OKX</h4>
                <p className="text-sm mt-1">{apiError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Total PnL</div>
              <div className={`text-3xl font-bold ${portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(portfolio.totalPnl)}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Grid Profit</div>
              <div className="text-3xl font-bold text-green-400">{formatMoney(portfolio.gridProfit)}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Unrealized PnL</div>
              <div className={`text-3xl font-bold ${portfolio.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(portfolio.unrealizedPnl)}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Total ROI</div>
              <div className={`text-3xl font-bold ${portfolioROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>{portfolioROI}%</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Active Grid Bots</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Pair</th>
                    <th className="p-4 font-medium">Invested</th>
                    <th className="p-4 font-medium">Grid Profit</th>
                    <th className="p-4 font-medium">Unrealized</th>
                    <th className="p-4 font-medium">Total PnL</th>
                    <th className="p-4 font-medium">ROI</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bots.map((bot) => (
                    <tr key={bot.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="p-4 font-bold text-white">{bot.pair}</td>
                      <td className="p-4 text-gray-300">${bot.invested.toFixed(2)}</td>
                      <td className="p-4 font-medium text-green-400">{formatMoney(bot.gridProfit)}</td>
                      <td className={`p-4 font-medium ${bot.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(bot.unrealizedPnl)}</td>
                      <td className={`p-4 font-bold ${bot.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(bot.totalPnl)}</td>
                      <td className={`p-4 font-medium ${bot.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{bot.roi}%</td>
                      <td className="p-4"><span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">{bot.status}</span></td>
                    </tr>
                  ))}
                  {bots.length === 0 && !loading && (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">Няма намерени активни ботове или грешка в ключовете.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
