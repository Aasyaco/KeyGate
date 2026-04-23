import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Scale, AlertTriangle, Info, Terminal, Database } from 'lucide-react';
import { GlassCard } from './EnterpriseUI';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
        <p className="text-slate-400 font-medium">Last Updated: April 23, 2026</p>
      </div>

      <GlassCard className="p-8 md:p-12 space-y-10 bg-slate-900/50">
        {/* SECTION 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Info className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">1. Introduction</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            KeyGate is a professional developer API gateway designed for the secure generation of GitHub App installation access tokens. By accessing or using the KeyGate website or API (the "Service"), you agree to be bound by these Terms of Service.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Scale className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">2. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your use of the Service constitutes explicit agreement to these terms. If you do not agree, you must immediately cease all access and use of the Service. These terms are enforceable as a binding agreement between you and KeyGate Contributors.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">3. Permitted Use</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Permitted use is strictly limited to:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-500 space-y-2 ml-4">
            <li>Legitimate authentication and authorization flows for GitHub Apps.</li>
            <li>Integration within internal enterprise developer tooling.</li>
            <li>Non-commercial testing and development of GitHub-integrated services.</li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">4. Prohibited Use</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            You are strictly forbidden from:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-500 space-y-2 ml-4">
            <li>Credential harvesting or unauthorized data extraction.</li>
            <li>Reverse engineering the Service for malicious intent.</li>
            <li>Redistributing the Service as a competing commercial product.</li>
            <li>Automated abuse, spam, or denial-of-service attempts.</li>
            <li>Injecting malformed payloads to bypass security filters.</li>
          </ul>
        </section>

        {/* SECTION 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">5. Security Responsibility</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            KeyGate is a stateless pass-through gateway. You maintain sole responsibility for the confidentiality of your GitHub App Private Keys. Licensor accepts no liability for leaked credentials, unauthorized access, or losses resulting from your failure to secure your cryptographic secrets.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">6. Rate Limiting & Fair Use</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            To ensure stability, the Service employs strict rate-limiting protocols. Bypassing these limits or attempting to disrupt Service availability will result in immediate termination of access.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-widest">7. Data Handling</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            KeyGate operates on a zero-persistence model. Private keys and access tokens are processed exclusively in volatile memory and are purged immediately upon transaction completion. No telemetry or tracking data is collected.
          </p>
        </section>

        {/* SECTION 8 & 9 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">8. Disclaimer</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              "As-is" service. No warranty of uptime, accuracy, or suitability for any specific purpose. Service and components provided without guarantee.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">9. Liability Limitation</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Licensor is not responsible for any indirect, incidental, or consequential damages resulting from the use or inability to use the Service.
            </p>
          </section>
        </div>

        {/* SECTION 10 & 11 */}
        <div className="pt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            10. Access can be terminated without notice for violations.
          </p>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            11. These terms are governed by standard software industry legal frameworks.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
