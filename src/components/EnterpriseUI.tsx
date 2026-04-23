import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../lib/utils';
import { Eye, EyeOff, Copy, Check, Loader2, Info } from 'lucide-react';

// --- GLASS CARD ---
export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("glass-card p-6 border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden", className)}
  >
    {children}
  </motion.div>
);

// --- PRODUCT LOGO ---
export const KeyGateLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-500">
      <path d="M8 4V28M8 16H14L24 4M14 16L24 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="font-sans font-bold tracking-tight text-white text-lg">KeyGate</span>
  </div>
);

// --- REFINED BUTTON ---
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const HapticButton = ({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary text-slate-200",
    ghost: "btn-ghost",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      disabled={isLoading}
      className={cn(
        "btn text-xs font-semibold tracking-wide uppercase px-5 py-2.5 rounded-lg",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
      {children}
    </motion.button>
  );
};

// --- REFINED INPUT ---
type SecureInputProps = (
  | ({ isTextarea?: false } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ isTextarea: true } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
) & {
  label: string;
  error?: string;
  hint?: string;
};

export const SecureInput = ({ label, error, hint, isTextarea, ...props }: SecureInputProps) => {
  const InputComponent = isTextarea ? 'textarea' : 'input';
  
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.05em]">{label}</label>
        {error && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{error}</span>}
      </div>
      <div className="relative">
        <InputComponent 
          {...(props as any)}
          className={cn(
            "input-field",
            error ? "border-red-500/30 focus:border-red-500/50" : "border-slate-800/80",
            isTextarea ? "min-h-[140px] font-mono text-slate-300 leading-relaxed custom-scrollbar py-3" : "h-11",
            (props as any).className
          )}
        />
      </div>
      {hint && !error && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Info className="w-2.5 h-2.5" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};

// --- ELITE TOKEN PANEL ---
export const TokenPanel = ({ token, label }: { token: string, label: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <div className="relative group bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-indigo-500/30 shadow-inner">
        <div className="font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap pr-24 select-all text-indigo-300 tracking-wider font-medium">
          {isVisible ? token : "••••••••••••••••••••••••••••••••"}
        </div>
        <div className="flex gap-2 shrink-0 absolute right-3">
          <HapticButton 
            variant="ghost"
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 h-8 w-8 hover:bg-indigo-500/10 hover:text-indigo-400"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </HapticButton>
          <HapticButton 
            variant="ghost"
            onClick={handleCopy}
            className="p-1.5 h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </HapticButton>
        </div>
      </div>
    </div>
  );
};
