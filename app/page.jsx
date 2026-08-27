import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Activity, Wallet, AlertTriangle, RefreshCw, 
  Clock, ShieldAlert, Download, Server, Key, CheckCircle, XCircle
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
      // Извикваме нашия собствен сигурен сървърен API маршрут, който говори с OKX
      const res = await fetch('/api/okx');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Грешка при зареждане на данните');
      }

      setBots(data.bots || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
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

  const portfolioROI = portfolio.invested ? ((portfolio.totalPnl / portfolio.invested) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-8 p-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">OKX<span className="text-blue-500">Cloud</span></span>
        </div>

        <div className="mb-6 px-3 py-2 bg-green-900/20 border border-green-800/50 rounded-lg flex items-center justify-center space-x-2 text-green-400 text-sm font-bold">
          <Server className="w-4 h-4" />
          <span>LIVE OKX SERVER</span>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LineChart className="w-5 h-5" />
            <span className="font-medium">Табло (Dashboard)</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen bg-[#0a0e17]">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Общ преглед на портфолиото</h1>
              <p className="text-gray-400 mt-1">
                {lastUpdated && <span>Последно синхронизиране: {lastUpdated}</span>}
              </p>
            </div>
            <button onClick={loadData} disabled={loading} className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-800 transition-colors">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Обнови сега
            </button>
          </header>

          {apiError && (
            <div className="bg-red-900/40 border border-red-500 p-4 rounded-xl flex items-start text-red-200">
              <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-red-400" />
              <div>
                <h4 className="font-bold text-red-400">Грешка при извличане на данни</h4>
                <p className="text-sm mt-1">{apiError}</p>
                <p className="text-xs text-gray-300 mt-2">Уверете се, че сте задали правилно Vercel Environment Variables (OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE).</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Общ PnL</div>
              <div className={`text-3xl font-bold ${portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatMoney(portfolio.totalPnl)}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Grid Печалба</div>
              <div className="text-3xl font-bold text-green-400">
                {formatMoney(portfolio.gridProfit)}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">Нереализиран PnL</div>
              <div className={`text-3xl font-bold ${portfolio.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatMoney(portfolio.unrealizedPnl)}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-gray-400 text-sm font-semibold mb-1 uppercase">ROI</div>
              <div className={`text-3xl font-bold ${portfolioROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolioROI >= 0 ? '+' : ''}{portfolioROI}%
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Активни Grid Ботове</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Бот / Валутна двойка</th>
                    <th className="p-4 font-medium">Инвестирани средства</th>
                    <th className="p-4 font-medium">Нетна печалба</th>
                    <th className="p-4 font-medium">Нереализиран PnL</th>
                    <th className="p-4 font-medium">Общ PnL</th>
                    <th className="p-4 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bots.map((bot) => (
                    <tr key={bot.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="p-4 font-bold text-white">{bot.pair}</td>
                      <td className="p-4 text-gray-300">${bot.invested.toFixed(2)}</td>
                      <td className="p-4 font-medium text-green-400">{formatMoney(bot.realizedPnl)}</td>
                      <td className={`p-4 font-medium ${bot.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(bot.unrealizedPnl)}</td>
                      <td className={`p-4 font-bold ${bot.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(bot.totalPnl)}</td>
                      <td className="p-4">
                        <span className="flex items-center text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded w-max">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          {bot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bots.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">Няма активни ботове в този акаунт.</td>
                    </tr>
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
