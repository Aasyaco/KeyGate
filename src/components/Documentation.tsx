import React, { useState } from 'react';
import { 
  Book, Code, Shield, Zap, Terminal, Copy, Check, 
  ChevronRight, ExternalLink, Info, Lock, Clock, GitBranch
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { GlassCard, HapticButton } from './EnterpriseUI';

const CodeBlock = ({ code, language = "bash" }: { code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{language}</span>
        <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto custom-scrollbar leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'parameters', label: 'Input Parameters', icon: Terminal },
    { id: 'flow', label: 'Token Flow', icon: GitBranch },
    { id: 'expiration', label: 'Expiration Rules', icon: Clock },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'security', label: 'Security Policy', icon: Shield },
  ];

  const sections = {
    overview: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-slate-400 leading-relaxed">
          KeyGate is a high-assurance gateway designed for the secure generation of GitHub App installation access tokens. 
          It serves as a stateless bridge between your private infrastructure and the GitHub API, ensuring that production 
          keys never touch persistent storage or long-term logs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <GlassCard className="bg-indigo-500/5 border-indigo-500/10">
            <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2">Target Users</h4>
            <p className="text-[11px] text-slate-500 font-medium">DevOps engineers, CI/CD pipelines, and security auditors requiring temporary repository access.</p>
          </GlassCard>
          <GlassCard className="bg-emerald-500/5 border-emerald-500/10">
            <h4 className="text-xs font-bold text-emerald-300 uppercase mb-2">Core Philosophy</h4>
            <p className="text-[11px] text-slate-500 font-medium">Stateless execution. No databases. Immediate memory zeroing for all cryptographic material.</p>
          </GlassCard>
        </div>
      </div>
    ),
    quickstart: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Quick Start</h2>
        <p className="text-slate-400 leading-relaxed">Follow these steps to generate your first installation token via the KeyGate dashboard.</p>
        <ol className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
          {[
            { title: "Configuration", desc: "Obtain your App ID and Installation ID from the GitHub App settings panel." },
            { title: "Key Assertion", desc: "Paste your RSA Private Key (PEM format) into the secure generator field." },
            { title: "Execution", desc: "Select a TTL and click 'Run Provisioning'. The token will appear in the result panel." },
          ].map((item, i) => (
            <li key={i} className="pl-8 relative">
              <span className="absolute left-0 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">{i + 1}</span>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    ),
    parameters: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Input Parameters</h2>
        <div className="space-y-4">
          {[
            { name: "x_api_key", type: "Key String", status: "Required", desc: "The enterprise gateway access key for vault authentication." },
            { name: "app_id", type: "Numeric String", status: "Required*", desc: "The unique identifier of your GitHub App." },
            { name: "installation_id", type: "Numeric String", status: "Required", desc: "The ID of the specific account or repository installation." },
            { name: "private_key", type: "PEM String", status: "Required", desc: "The RSA private key for JWT signing. Must include BEGIN/END headers." },
            { name: "client_id", type: "String", status: "Optional", desc: "The GitHub App's Client ID. Used as a secondary resolver." },
            { name: "requested_ttl", type: "Integer", status: "Optional", desc: "Requested token lifetime in seconds (default 3600)." },
          ].map((param, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-slate-800 bg-slate-950/50 rounded-xl">
              <div className="md:w-48">
                <code className="text-xs font-bold text-indigo-400 font-mono tracking-wider">{param.name}</code>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-bold text-slate-600 border border-slate-800 px-1.5 rounded">{param.type}</span>
                  <span className={cn("text-[9px] font-bold px-1.5 rounded", param.status === 'Required' ? "text-red-400 bg-red-500/5" : "text-slate-500 bg-slate-500/5")}>{param.status}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">{param.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex gap-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-500/70 font-medium">*At least one of app_id or client_id must be provided to identify the issuer.</p>
        </div>
      </div>
    ),
    flow: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Token Flow</h2>
        <div className="space-y-12 pt-4">
          {[
            { icon: Lock, title: "1. RS256 Assertion", desc: "The gateway receives your private key and generates a self-signed JWT with a 10-minute maximum expiry." },
            { icon: GitBranch, title: "2. GitHub API Handshake", desc: "KeyGate sends the JWT to GitHub's REST API. GitHub verifies the signature against the public key on file." },
            { icon: Zap, title: "3. Access Provisioning", desc: "Upon verification, GitHub returns an Installation Access Token (IAT) and the gateway passes it to you." }
          ].map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
               <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{step.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    ),
    expiration: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Expiration Rules</h2>
        <p className="text-slate-400 leading-relaxed">KeyGate enforces strict temporal boundaries to minimize the window of vulnerability.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                 <Clock className="w-4 h-4" />
                 <h4 className="text-xs font-bold uppercase">JWT (Assertion)</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium">Valid for **10 minutes**. This is a hard limit set by GitHub for all App-to-App handshakes.</p>
           </GlassCard>
           <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                 <Lock className="w-4 h-4" />
                 <h4 className="text-xs font-bold uppercase">Access Token</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium">Valid for up to **1 hour**. You can request a shorter TTL via the configuration panel.</p>
           </GlassCard>
        </div>
      </div>
    ),
    api: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">API Reference</h2>
        <div>
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">POST /api/generate-token</h3>
          <p className="text-xs text-slate-500 mb-6">Programmatic access for CI/CD pipelines. Ensure all payloads are sent over TLS.</p>
          
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Curl Example</h4>
          <CodeBlock code={`curl -X POST https://keygate.io/api/generate-token \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_MASTER_KEY" \\
  -d '{
    "app_id": "12345",
    "installation_id": "54321",
    "private_key": "-----BEGIN RSA PRIVATE KEY-----\\nMIIEp...\\n-----END RSA PRIVATE KEY-----"
  }'`} />

          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-8">Success Response (200 OK)</h4>
          <CodeBlock language="json" code={`{
  "token": "ghs_8X...vA2",
  "expires_at": "2026-04-22T16:24:21Z",
  "expires_in": 3600,
  "traceId": "6f2d9...3b9e",
  "timestamp": "2026-04-22T15:24:21Z"
}`} />

          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-8">Error Response (400 Bad Request)</h4>
          <CodeBlock language="json" code={`{
  "code": "CRYPTO_FAILURE",
  "message": "Cryptographic failure: The provided Private Key is malformed.",
  "traceId": "af73...92c",
  "timestamp": "2026-04-22T15:25:01Z"
}`} />
        </div>
      </div>
    ),
    security: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Security Policy</h2>
        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
           <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Trust Assurance</h3>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed">
             KeyGate is built as a **Defense-in-Depth** system. We prioritize the safety of your GitHub credentials over convenience.
           </p>
           <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "No Record Storage", desc: "No database. No Redis. No session stickiness." },
                { title: "Redacted I/O", desc: "Application logs are configured to ignore request bodies." },
                { title: "Strict Handshake", desc: "RS256 with forced timestamp validation." },
                { title: "In-Memory Wiping", desc: "Garbage collector guidance used to clear secret buffers." },
              ].map((policy, i) => (
                <li key={i} className="flex items-start gap-2">
                   <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                      <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">{policy.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{policy.desc}</span>
                   </div>
                </li>
              ))}
           </ul>
        </div>
      </div>
    ),
  };

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* SIDEBAR NAVIGATION */}
      <aside className="col-span-12 lg:col-span-3 sticky top-24 space-y-2">
        <div className="px-4 py-2 mb-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Documentation</h3>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
              activeSection === item.id 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
            )}
          >
            <item.icon className={cn("w-4 h-4", activeSection === item.id ? "text-indigo-400" : "text-slate-500")} />
            {item.label}
          </button>
        ))}
      </aside>

      {/* CONTENT AREA */}
      <div className="col-span-12 lg:col-span-9">
        <motion.div
           key={activeSection}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.3 }}
           className="glass-card p-8 md:p-12 min-h-[600px]"
        >
          {sections[activeSection as keyof typeof sections]}
        </motion.div>
        
        {/* FOOTER ACTION */}
        <div className="mt-8 flex justify-between items-center px-4">
           <p className="text-[11px] text-slate-500 font-medium">Was this page helpful?</p>
           <div className="flex gap-4">
              <a href="#" className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                 View on GitHub <ExternalLink className="w-3 h-3" />
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};
