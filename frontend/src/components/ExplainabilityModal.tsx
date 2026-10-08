import React from 'react';
import { X, HelpCircle, Thermometer, Droplets, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Shipment, Prediction } from '../types';
import { RiskBadge } from './RiskBadge';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  prediction?: Prediction | null;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  shipment,
  prediction: propPrediction,
}) => {
  if (!isOpen || !shipment) return null;

  const prediction = propPrediction || shipment.latest_prediction;
  const telemetry = shipment.latest_telemetry;
  const produce = shipment.produce;

  const currentTemp = telemetry?.temperature ?? 4.0;
  const currentHum = telemetry?.humidity ?? 75.0;
  const transitHours = telemetry?.transit_hours ?? 18.0;
  const transitDelay = telemetry?.transit_delay ?? 0.0;

  const idealTempRange = produce
    ? `${produce.ideal_temp_min}°C – ${produce.ideal_temp_max}°C`
    : '2.0°C – 6.0°C';
  const idealHumRange = produce
    ? `${produce.ideal_humidity_min}% – ${produce.ideal_humidity_max}%`
    : '70% – 85%';

  const tempDiff = produce ? currentTemp - produce.ideal_temp_max : 0;
  const isTempExceeded = tempDiff > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Prediction Explainability Breakdown
              </h3>
              <p className="text-sm text-slate-400">
                Shipment {shipment.tracking_number} ({shipment.produce?.name || 'Produce'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Remaining Shelf Life</span>
            <span className="text-lg font-bold text-emerald-400">
              {prediction ? `${prediction.remaining_shelf_life_hours} hrs` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 block">
              (~{prediction ? (prediction.remaining_shelf_life_hours / 24).toFixed(1) : 0} days)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Spoilage Risk</span>
            <div className="mt-0.5">
              <RiskBadge risk={prediction?.spoilage_risk || 'LOW'} size="sm" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Degradation Score</span>
            <span className="text-lg font-bold text-amber-400">
              {prediction?.degradation_score ? `${prediction.degradation_score}%` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Model Confidence</span>
            <span className="text-lg font-bold text-blue-400">
              {prediction?.confidence_score ? `${prediction.confidence_score}%` : '95.0%'}
            </span>
          </div>
        </div>

        {/* Major Contributing Factors */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Major Factors Influencing Shelf-Life Degradation
          </h4>

          <div className="space-y-3">
            {/* Factor 1: Temperature */}
            <div
              className={`p-4 rounded-xl border transition ${
                isTempExceeded
                  ? 'bg-red-950/20 border-red-500/30 text-red-200'
                  : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer
                    className={`w-5 h-5 ${isTempExceeded ? 'text-red-400' : 'text-emerald-400'}`}
                  />
                  <span className="font-semibold text-white">Temperature Impact Factor</span>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    isTempExceeded ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {currentTemp}°C (Optimal: {idealTempRange})
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {isTempExceeded
                  ? `Temperature is +${tempDiff.toFixed(1)}°C above the recommended cold-chain limit. Produce cellular respiration rate accelerates exponentially following Q10 enzymatic kinetics, consuming organic acids and sugars rapidly.`
                  : `Temperature is strictly within optimal cold-chain limits (${idealTempRange}), keeping cellular metabolism minimized.`}
              </p>
            </div>

            {/* Factor 2: Humidity */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Moisture & Transpiration Factor</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                  {currentHum}% (Optimal: {idealHumRange})
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {currentHum < (produce?.ideal_humidity_min || 70)
                  ? `Low relative humidity increases vapor pressure deficit, accelerating cellular water loss, wilting, and weight shrinkage.`
                  : currentHum > (produce?.ideal_humidity_max || 85)
                  ? `Elevated humidity (>85%) raises microbial spore germination risk and surface water condensation on packaging.`
                  : `Relative humidity is well-calibrated for skin firmness and minimal transpiration.`}
              </p>
            </div>

            {/* Factor 3: Transit Duration & Delay */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Transit Elapsed & Delay Impact</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                  {transitHours}h elapsed {transitDelay > 0 ? `(+${transitDelay}h delay)` : ''}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {transitDelay > 0
                  ? `Traffic or checkpoint delays of +${transitDelay} hours compound metabolic degradation, shortening the retailer handling window.`
                  : `Shipment is on scheduled transit timeline without significant delays.`}
              </p>
            </div>
          </div>
        </div>

        {/* AI Natural Language Synthesis */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Natural Language Explanation
          </span>
          <p className="text-sm text-slate-200 italic">
            "{prediction?.explanation || 'Estimated shelf life reflects current sensor telemetry and historical thermal exposure.'}"
          </p>
        </div>

        {/* Prototype Food-Safety Disclaimer (Mandatory Requirement) */}
        <div className="mt-5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Technical Evaluation Notice:</strong> This shelf-life degradation model is a prototype simulated prediction engine based on Q10 bio-chemical kinetics. It provides operational decision support and does not constitute a certified food-safety certification.
          </p>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer shadow-lg shadow-emerald-900/30"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
