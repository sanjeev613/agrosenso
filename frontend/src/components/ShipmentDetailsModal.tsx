import React, { useState, useEffect } from 'react';
import {
  X,
  Thermometer,
  Droplets,
  Clock,
  MapPin,
  TrendingUp,
  Tag,
  Zap,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Shipment } from '../types';
import { RiskBadge } from './RiskBadge';
import { api } from '../api/client';
import { ExplainabilityModal } from './ExplainabilityModal';

interface ShipmentDetailsModalProps {
  shipmentId: number | null;
  onClose: () => void;
  onShipmentUpdated: () => void;
}

export const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = ({
  shipmentId,
  onClose,
  onShipmentUpdated,
}) => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'degradation' | 'risk'>('telemetry');
  const [showExplainModal, setShowExplainModal] = useState(false);

  const loadShipmentData = async () => {
    if (!shipmentId) return;
    try {
      setLoading(true);
      const data = await api.getShipmentById(shipmentId);
      setShipment(data);
    } catch (err) {
      console.error('Failed to load shipment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipmentData();
  }, [shipmentId]);

  if (!shipmentId) return null;

  // Telemetry spike simulation handler
  const handleSimulateSpike = async () => {
    try {
      setActionLoading(true);
      await api.simulateTemperatureSpike(shipmentId, 18.0, 75.0);
      await loadShipmentData();
      onShipmentUpdated();
    } catch (err) {
      console.error('Failed to simulate spike:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delay simulation
  const handleSimulateDelay = async () => {
    try {
      setActionLoading(true);
      await api.simulateTransitDelay(shipmentId, 8.0);
      await loadShipmentData();
      onShipmentUpdated();
    } catch (err) {
      console.error('Failed to simulate delay:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset to normal
  const handleReset = async () => {
    try {
      setActionLoading(true);
      await api.simulateReset(shipmentId);
      await loadShipmentData();
      onShipmentUpdated();
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Prepare chart data
  const chartData = (shipment?.telemetry_history || []).map((t, idx) => {
    const timeLabel = `T+${t.transit_hours}h`;
    // Risk score numerical mapping
    const temp = t.temperature;
    let riskVal = 10;
    if (temp > 15) riskVal = 85;
    else if (temp > 10) riskVal = 55;
    else if (temp > 6) riskVal = 30;

    return {
      index: idx,
      time: timeLabel,
      temperature: t.temperature,
      humidity: t.humidity,
      transit_hours: t.transit_hours,
      risk_score: riskVal,
      shelf_life_hours: Math.max(10, 120 - t.transit_hours * (temp > 10 ? 4 : 1)),
    };
  });

  const latestTel = shipment?.latest_telemetry;
  const latestPred = shipment?.latest_prediction;
  const latestPrice = shipment?.latest_price_recommendation;

  const remainingDays = latestPred ? (latestPred.remaining_shelf_life_hours / 24).toFixed(1) : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl text-slate-100 max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">
              {shipment?.produce?.icon || '🍅'}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {shipment?.tracking_number} — {shipment?.produce?.name}
                </h2>
                <RiskBadge risk={latestPred?.spoilage_risk || 'LOW'} size="md" />
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {shipment?.origin} <ArrowRight className="w-3 h-3 text-slate-500" /> {shipment?.destination}
                <span className="text-slate-600">•</span>
                <span>{shipment?.quantity} kg</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExplainModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-sm font-semibold transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Why this Prediction?
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Section 6 Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1">Produce</span>
              <span className="text-base font-bold text-white block truncate">
                {shipment?.produce?.name || 'Tomatoes'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1">Quantity</span>
              <span className="text-base font-bold text-white block">
                {shipment?.quantity || 500} kg
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1">Origin</span>
              <span className="text-base font-bold text-white block truncate">
                {shipment?.origin || 'Chennai'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1">Destination</span>
              <span className="text-base font-bold text-white block truncate">
                {shipment?.destination || 'Coimbatore'}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border col-span-1 ${
              (latestTel?.temperature ?? 4) > 10 ? 'bg-red-950/40 border-red-500/40' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-red-400" /> Temperature
              </span>
              <span className={`text-base font-bold ${(latestTel?.temperature ?? 4) > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                {latestTel?.temperature ?? 4}°C
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
              </span>
              <span className="text-base font-bold text-blue-400">
                {latestTel?.humidity ?? 75}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-1">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Transit Duration
              </span>
              <span className="text-base font-bold text-purple-300">
                {latestTel?.transit_hours ?? 18} hrs
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border col-span-1 ${
              (latestPred?.remaining_shelf_life_hours ?? 120) < 24 ? 'bg-orange-950/40 border-orange-500/40' : 'bg-slate-800/60 border-slate-700/60'
            }`}>
              <span className="text-xs text-slate-400 block mb-1">Remaining Shelf Life</span>
              <span className={`text-base font-bold ${(latestPred?.remaining_shelf_life_hours ?? 120) < 24 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {latestPred?.remaining_shelf_life_hours ?? 120}h ({remainingDays}d)
              </span>
            </div>
          </div>

          {/* Pricing & Liquidation Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-400 block">Original Price</span>
                <span className="text-lg font-bold text-slate-300">
                  ₹{shipment?.original_price || 100}/kg
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <span className="text-xs text-slate-400 block">Recommended Price</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{latestPrice?.recommended_price || shipment?.original_price || 100}/kg
                </span>
              </div>
              {latestPrice && latestPrice.discount_percentage > 0 && (
                <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
                  {latestPrice.discount_percentage}% LIQUIDATION DISCOUNT
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 max-w-md">
              <strong className="text-slate-300">Pricing Engine Reason:</strong>{' '}
              {latestPrice?.reason || 'Standard baseline cold chain condition. No liquidation required.'}
            </div>
          </div>

          {/* Interactive Graphs Section (Section 6) */}
          <div className="rounded-2xl border border-slate-700/80 bg-slate-800/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-white">Cold Chain Telemetry & Predictive Analytics</h3>
              </div>

              {/* Graph Switch Tabs */}
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'telemetry' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Temp & Humidity Over Time
                </button>
                <button
                  onClick={() => setActiveTab('degradation')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'degradation' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Shelf-Life Degradation
                </button>
                <button
                  onClick={() => setActiveTab('risk')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'risk' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Risk Trajectory
                </button>
              </div>
            </div>

            {/* Recharts Area */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'telemetry' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis yAxisId="left" stroke="#ef4444" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight', fill: '#3b82f6' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Temperature (°C)" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Humidity (%)" />
                  </LineChart>
                ) : activeTab === 'degradation' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorShelf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#10b981" label={{ value: 'Remaining Shelf Life (Hours)', angle: -90, position: 'insideLeft', fill: '#10b981' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="shelf_life_hours" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorShelf)" name="Remaining Shelf Life (Hours)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#f97316" label={{ value: 'Spoilage Risk Score (%)', angle: -90, position: 'insideLeft', fill: '#f97316' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="risk_score" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" name="Risk Score (%)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Direct Simulation Trigger Buttons (Section 7) */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Live Sensor Simulation Controls for {shipment?.tracking_number}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Trigger real-time telemetry events. All events immediately recalculate degradation models and persist to the database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={actionLoading}
                onClick={handleSimulateSpike}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-900/30"
              >
                <Thermometer className="w-4 h-4" />
                Simulate Temperature Spike (18°C)
              </button>

              <button
                disabled={actionLoading}
                onClick={handleSimulateDelay}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/30"
              >
                <Clock className="w-4 h-4" />
                Simulate Transit Delay (+8h)
              </button>

              <button
                disabled={actionLoading}
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-sm border border-slate-600 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Normal Conditions
              </button>
            </div>
          </div>
        </div>

        {/* Explainability Modal Nested */}
        {showExplainModal && (
          <ExplainabilityModal
            isOpen={showExplainModal}
            onClose={() => setShowExplainModal(false)}
            shipment={shipment}
          />
        )}
      </div>
    </div>
  );
};
