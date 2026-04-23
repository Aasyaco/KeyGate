import React, { useState, useEffect } from 'react';
import { 
  Lock, Terminal, Clock, ShieldCheck, Cpu, History, 
  ArrowRight, ShieldAlert, CheckCircle2, ChevronDown, 
  Shield, Globe, Database, Fingerprint, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  GlassCard, HapticButton, SecureInput, TokenPanel, KeyGateLogo 
} from './components/EnterpriseUI';
import { Documentation } from './components/Documentation';
import { TermsOfService } from './components/TermsOfService';

interface ResponseData {
  token: string;
  expires_at: string;
  expires_in: number;
  permissions: Record<string, string>;
  traceId: string;
}

export default function App() {
  const [view, setView] = useState<'generator' | 'docs' | 'tos'>('generator');
  const [nodeStatus, setNodeStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [formData, setFormData] = useState({
    x_api_key: '',
    app_id: '',
    client_id: '',
    private_key: '',
    installation_id: '',
    requested_ttl: 3600
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{message: string, traceId?: string, code?: string} | null>(null);
  const [result, setResult] = useState<ResponseData | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- HEALTH MONITOR ---
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setNodeStatus('online');
        else setNodeStatus('offline');
      } catch {
        setNodeStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- COUNTDOWN LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': formData.x_api_key
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw { 
            message: data.message || 'The secure handshake was rejected by the gateway.', 
            traceId: data.traceId,
            code: data.code
          };
        }
        setResult(data);
        setCountdown(data.expires_in);
      } else {
        const text = await response.text();
        console.error('Unexpected non-JSON response:', text.slice(0, 200));
        throw { 
          message: `The server returned an unexpected response format (Status: ${response.status}). This often happens if the API route is misconfigured or a proxy intercepted the request.`,
          code: 'INVALID_RESPONSE'
        };
      }
    } catch (err: any) {
      setError({ 
        message: err.message || 'Network connectivity error. The vault node appears offline.', 
        traceId: err.traceId,
        code: err.code
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500/30">
      
      {/* HEADER HUD */}
      <header className="w-full h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setView('generator')} className="hover:opacity-80 transition-opacity">
          <KeyGateLogo />
        </button>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            <button 
              onClick={() => setView('generator')}
              className={cn("hover:text-indigo-400 transition-colors", view === 'generator' && "text-indigo-400")}
            >
              Generator
            </button>
            <button 
              onClick={() => setView('docs')}
              className={cn("hover:text-indigo-400 transition-colors", view === 'docs' && "text-indigo-400")}
            >
              Documentation
            </button>
            <button 
              onClick={() => setView('tos')}
              className={cn("hover:text-indigo-400 transition-colors", view === 'tos' && "text-indigo-400")}
            >
              Terms of Service
            </button>
          </nav>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              nodeStatus === 'online' ? "bg-emerald-500" : nodeStatus === 'offline' ? "bg-red-500" : "bg-amber-500"
            )} />
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
              NODE: {nodeStatus === 'online' ? 'STABLE' : nodeStatus === 'offline' ? 'DISCONNECTED' : 'SYNCING'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        
        {view === 'generator' ? (
          <>
            {/* HERO SECTION */}
            <section className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Secure Token Provisioning 
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                A high-assurance gateway for generating scoped GitHub App installation access tokens. 
                Zero logging, in-memory processing, enterprise-grade auditability.
              </p>
            </section>

            <div className="grid grid-cols-12 gap-6">
              {/* CONFIGURATION COLUMN */}
              <div className="col-span-12 lg:col-span-12 xl:col-span-8 space-y-6">
                <GlassCard className="animate-shimmer">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Generator Configuration</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Session-based ephemeral credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <Shield className="w-3 h-3" />
                        RS256 ENCRYPTION
                      </div>
                      <HapticButton variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                        Run Provisioning
                      </HapticButton>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2">
                      <SecureInput 
                        label="Gateway Access Key"
                        placeholder="Enter your enterprise API key"
                        value={formData.x_api_key}
                        onChange={e => setFormData({...formData, x_api_key: e.target.value})}
                        required
                        hint="Required to authenticate with the secure vault gateway."
                      />
                    </div>
                    <SecureInput 
                      label="App ID"
                      placeholder="ID assigned by GitHub"
                      value={formData.app_id}
                      onChange={e => setFormData({...formData, app_id: e.target.value})}
                      hint="Numeric identifier (e.g. 847291)"
                    />
                    <SecureInput 
                      label="Installation ID"
                      placeholder="Target installation ID"
                      value={formData.installation_id}
                      onChange={e => setFormData({...formData, installation_id: e.target.value})}
                      required
                      hint="Numeric identifier for the specific org/repo"
                    />
                    <div className="md:col-span-2">
                      <SecureInput 
                        label="Private Key (PEM)"
                        placeholder="Paste your RSA private key here..."
                        isTextarea
                        value={formData.private_key}
                        onChange={e => setFormData({...formData, private_key: e.target.value})}
                        required
                        hint="Key stays in memory and is wiped immediately after the handshake."
                      />
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-slate-800/50">
                      <button 
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                      >
                        Advanced Protocol Options
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 overflow-hidden"
                          >
                             <SecureInput 
                              label="Client UID (Optional)"
                              placeholder="Application Client ID"
                              value={formData.client_id}
                              onChange={e => setFormData({...formData, client_id: e.target.value})}
                            />
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">Session TTL</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[1800, 3600].map(val => (
                                  <button 
                                    key={val}
                                    type="button"
                                    onClick={() => setFormData({...formData, requested_ttl: val})}
                                    className={cn(
                                      "py-2 rounded-lg text-xs font-mono border transition-all",
                                      formData.requested_ttl === val 
                                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" 
                                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                                    )}
                                  >
                                    {val/60}m
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </GlassCard>

                {/* TRUST SIGNALS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: ShieldCheck, title: "Zero Logs", desc: "No sensitive payloads are written to disk or long-term observability." },
                    { icon: Cpu, title: "In-Memory", desc: "Handshake buffers are cleared immediately after the API response." },
                    { icon: Zap, title: "High Perf", desc: "Global edge-optimized network for minimal latency overhead." },
                  ].map((feat, i) => (
                    <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                      <feat.icon className="w-5 h-5 text-slate-500" />
                      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{feat.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESULTS PANEL COLUMN */}
              <div className="col-span-12 xl:col-span-4 h-full">
                <AnimatePresence mode="wait">
                  {!result && !error && !isLoading ? (
                    <div className="h-full flex flex-col gap-6">
                       <GlassCard className="flex-1 flex flex-col items-center justify-center text-center gap-6 bg-slate-900/10 opacity-60">
                        <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center border border-slate-800/50">
                          <Fingerprint className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Protocol Stale</h3>
                          <p className="text-[11px] text-slate-600 font-medium px-12 mt-1">Submit configuration to initiate key exchange</p>
                        </div>
                      </GlassCard>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                         <Lock className="w-4 h-4 text-amber-500/50 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-amber-500/70 leading-relaxed font-medium">Warning: Private keys should be stored in secure secrets managers. Do not share key files via unencrypted channels.</p>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <GlassCard className="h-full flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">Establishing Sec-Channel...</p>
                    </GlassCard>
                  ) : error ? (
                    <GlassCard className="h-full bg-red-500/[0.03] border-red-500/20 flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <h3 className="text-xs font-bold text-red-100 uppercase tracking-widest">Handshake Failed</h3>
                      </div>
                      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4">
                         <div className="text-[10px] font-bold text-red-500/40 uppercase tracking-[0.3em] font-mono">{error.code || 'SYS_ERROR'}</div>
                         <p className="text-xs text-red-200/80 font-medium leading-relaxed font-mono">{error.message}</p>
                         {error.traceId && (
                           <div className="mt-4 px-3 py-1 bg-red-500/5 border border-red-500/10 rounded font-mono text-[9px] text-red-400/40 uppercase tracking-widest">
                             Trace: {error.traceId}
                           </div>
                         )}
                      </div>
                      <HapticButton variant="secondary" onClick={() => setError(null)} className="h-10">Reset Handshake</HapticButton>
                    </GlassCard>
                  ) : result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full"
                    >
                      <GlassCard className="h-full bg-indigo-500/[0.03] border-indigo-500/20 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest">Provisioned Token</h2>
                          </div>
                          <div className="px-2 py-0.5 bg-indigo-500/10 rounded text-[9px] font-bold text-indigo-400 uppercase">Secure</div>
                        </div>
                        
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
                          <TokenPanel token={result.token} label="Installation Access Token" />
                          <div className="space-y-4 pt-6 border-t border-slate-800/80">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time to expiry</span>
                              <span className={cn(countdown < 300 ? "text-red-400 animate-pulse" : "text-white font-mono")}>
                                {formatTime(countdown)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500 flex items-center gap-1.5"><Database className="w-3 h-3" /> Trace Identifier</span>
                              <span className="text-slate-400 font-mono text-[9px] truncate max-w-[140px]">{result.traceId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-1">
                             Handshake successfully completed via RS256 signature protocol. Token is strictly scoped to the provided installation context.
                           </p>
                        </div>
                        <HapticButton variant="secondary" onClick={() => setResult(null)} className="h-10">Clear Session</HapticButton>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* SECURITY & ARCHITECTURE DOCS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-800/50">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Deployment Architecture
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  KeyGate is an edge-based application built for stateless operation. 
                  Each submission initiates a distinct RSA cryptographic assertion. 
                  The private key is used only as a ephemeral signing material for the JWT object 
                  and is purged from the execution environment upon response completion.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Observability & Compliance
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Systems are audited for zero-leak compliance. Every transaction is assigned 
                  a unique Trace Identifier (TR-ID), allowing secure debugging without 
                  need for inspecting sensitive payloads. All requests are TLS-secured over 
                  standard transit protocols.
                </p>
              </div>
            </section>
          </>
        ) : view === 'docs' ? (
          <Documentation />
        ) : (
          <TermsOfService />
        )}

      </main>

      <footer className="w-full py-12 px-6 flex flex-col items-center gap-6 border-t border-slate-800 bg-slate-950 mt-auto">
        <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          <button onClick={() => setView('tos')} className="hover:text-indigo-400 transition-colors">Terms of Service</button>
          <button onClick={() => setView('docs')} className="hover:text-indigo-400 transition-colors">Audit & Security</button>
          <button onClick={() => setView('docs')} className="hover:text-indigo-400 transition-colors">API Docs</button>
          <a href="#" className="hover:text-indigo-400 transition-colors">Open Source</a>
        </div>
        <p className="text-[9px] text-slate-700 font-mono tracking-tighter uppercase font-bold text-center">
          &copy; 2026 KeyGate. PROPRIETARY AND CONFIDENTIAL. ALL CRYPTOGRAPHIC ASSERTIONS ARE LOCALIZED IN-MEMORY.
        </p>
      </footer>
    </div>
  );
}
