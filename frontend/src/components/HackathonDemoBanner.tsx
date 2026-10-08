import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Bell,
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from './RiskBadge';

interface HackathonDemoBannerProps {
  onScenarioExecuted: () => void;
  onNavigateToTab?: (tab: string) => void;
  onDismiss?: () => void;
}

export const HackathonDemoBanner: React.FC<HackathonDemoBannerProps> = ({
  onScenarioExecuted,
  onNavigateToTab,
  onDismiss,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [demoState, setDemoState] = useState<'idle' | 'spiked' | 'reset'>('idle');
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const steps = [
    { title: 'Telemetry Spiked', desc: '18.0°C recorded' },
    { title: 'Q10 Biological Decay', desc: 'Respiration surge' },
    { title: 'Shelf Life Drop', desc: '120h → 18 hours' },
    { title: 'Risk Critical Alert', desc: 'Transporter flagged' },
    { title: 'Dynamic Discount', desc: '-35% Liquidation' },
    { title: 'Retailer Listed', desc: 'Marketplace live' },
  ];

  const handleSimulateTemperatureSpike = async () => {
    try {
      setIsRunning(true);
      setPipelineStep(1);

      const interval = setInterval(() => {
        setPipelineStep((prev) => {
          if (prev >= 5) {
            clearInterval(interval);
            return 6;
          }
          return prev + 1;
        });
      }, 200);

      await api.simulateTemperatureSpike(undefined, 18.0, 75.0);
      setDemoState('spiked');
      onScenarioExecuted();
    } catch (err) {
      console.error('Failed demo simulation:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsRunning(true);
      setPipelineStep(0);
      await api.simulateReset();
      setDemoState('reset');
      onScenarioExecuted();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900/95 via-emerald-950/30 to-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Subtle ambient lighting */}
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Judges & Evaluation Demonstration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  Live DB Active
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Simulate Temperature Spike & Automated Liquidation Pipeline
              </h2>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSimulateTemperatureSpike}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Spike (18°C)</span>
            </button>

            <button
              onClick={handleResetDemo}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Normal (4°C)</span>
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Dismiss Banner"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 6-Step Pipeline Visual Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {steps.map((st, i) => {
            const isCompleted = pipelineStep > i || demoState === 'spiked';
            const isCurrent = pipelineStep === i + 1;
            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : isCurrent
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 scale-102 ring-1 ring-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                    Step 0{i + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {st.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic State Preview Strip */}
        {demoState === 'spiked' && (
          <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/40 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <TrendingDown className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-black text-orange-300 uppercase tracking-wide block">
                  Scenario Executed Successfully:
                </span>
                <span className="text-xs text-orange-200/90">
                  Batch AGRO102 (Tomato) shelf life dropped from <strong>120h (5 days)</strong> to <strong>18 hours</strong>. 35% liquidation discount active (₹100 → ₹65/kg).
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-extrabold">
                HIGH SPOILAGE RISK
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                LISTED ON MARKETPLACE
              </span>

              {onNavigateToTab && (
                <>
                  <button
                    onClick={() => onNavigateToTab('fifo')}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>View Red Zone in FIFO Grid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToTab('marketplace')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>Inspect Liquidation Lot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToTab('channels')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>Compare Buyer Channels</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
