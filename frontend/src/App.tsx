import { useEffect, useState } from 'react';
import { fetchSystemStatus } from './lib/api';
import type { SystemStatus } from './lib/contracts/api';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Server, Terminal, Shield } from 'lucide-react';

export function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSystemStatus();
      setStatus(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Modern Project Base</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Agent-Native Operator Cockpit • Axum (Rust) + React/Vite (TS)
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Card 1: Health State */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs uppercase font-semibold tracking-wider">Health Status</span>
            {error ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-white">
              {error ? 'Degraded' : status?.healthy ? 'System Healthy' : 'Initializing...'}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {error ? error : `Last verified: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>

        {/* Card 2: Backend Uptime */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs uppercase font-semibold tracking-wider">Service Uptime</span>
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold text-white">
            {status ? `${status.uptime_secs}s` : '—'}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Environment: <span className="text-slate-300 font-mono">{status?.environment || 'unknown'}</span>
          </p>
        </div>

        {/* Card 3: Engine Version */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs uppercase font-semibold tracking-wider">Engine Version</span>
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-white">
            v{status?.version || '0.0.0'}
          </div>
          <p className="mt-2 text-xs text-slate-500 font-mono">
            Synced via ts-rs contract bridge
          </p>
        </div>
      </div>

      {/* Operator Invariant Banner */}
      <div className="mt-8 p-6 bg-slate-900/40 border border-slate-800/80 rounded-xl">
        <div className="flex items-center gap-2 text-slate-300 font-medium mb-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3>Operator Feedback Invariant</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          This system verifies itself via deterministic pipelines. Any change to Rust backend models instantly projects into <code className="text-emerald-400 font-mono">src/lib/contracts/api.ts</code>. Frontend type safety is enforced by strict TypeScript compilation without human manual code review.
        </p>
      </div>
    </div>
  );
}

export default App;
