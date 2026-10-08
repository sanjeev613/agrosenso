import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Clock,
  PackageCheck,
  IndianRupee,
  Search,
  Filter,
  Eye,
  Activity,
  HelpCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Boxes,
  Store,
  Compass
} from 'lucide-react';
import { Shipment, AnalyticsOverview, UserRole } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface DashboardPageProps {
  shipments: Shipment[];
  analytics: AnalyticsOverview | null;
  loading: boolean;
  currentRole: UserRole;
  onSelectShipment: (shipmentId: number) => void;
  onOpenNewShipment: () => void;
  onOpenSimulator: (shipmentId: number) => void;
  onOpenExplainability: (shipment: Shipment) => void;
  onOpenMarketChannels?: (shipmentId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  shipments,
  analytics,
  loading,
  currentRole,
  onSelectShipment,
  onOpenNewShipment,
  onOpenSimulator,
  onOpenExplainability,
  onOpenMarketChannels,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.produce?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const risk = s.latest_prediction?.spoilage_risk || 'LOW';
    const matchesRisk = riskFilter === 'ALL' || risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Calculate metrics
  const activeCount = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const atRiskCount = shipments.filter(
    (s) => s.latest_prediction?.spoilage_risk === 'HIGH' || s.latest_prediction?.spoilage_risk === 'CRITICAL'
  ).length;

  const totalShelfLifeHours = shipments.reduce(
    (acc, s) => acc + (s.latest_prediction?.remaining_shelf_life_hours || 72),
    0
  );
  const avgShelfLifeHours = shipments.length > 0 ? totalShelfLifeHours / shipments.length : 72;
  const avgShelfLifeDays = (avgShelfLifeHours / 24).toFixed(1);

  const lossAvoided = analytics?.estimated_loss_avoided || 32500;
  const productsSavedKg = analytics?.products_saved_kg || 1700;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Shipments */}
        <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Active Shipments
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{activeCount}</span>
              <span className="text-xs text-slate-400">in transit</span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Stream
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Shipments at Risk */}
        <div className="p-5 rounded-3xl border border-orange-500/30 bg-orange-950/20 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-orange-500/50 transition">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400 block mb-1">
              Shipments at Risk
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-orange-400">{atRiskCount}</span>
              <span className="text-xs text-orange-300/70">critical/high</span>
            </div>
            <span className="text-[11px] text-orange-300/80 block mt-1 font-semibold">
              Liquidation Eligible
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Avg Remaining Shelf Life */}
        <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Avg Remaining Life
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{avgShelfLifeDays}</span>
              <span className="text-xs text-slate-400 font-semibold">days</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              ~{Math.round(avgShelfLifeHours)} hours median
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Products Saved */}
        <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Produce Rescued
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-emerald-400">{productsSavedKg.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <span className="text-[11px] text-emerald-400/80 block mt-1 font-semibold">
              Zero Waste Route
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 5: Estimated Loss Avoided */}
        <div className="p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/80 to-emerald-950/40 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-emerald-500/50 transition">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
              Value Preserved
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">₹{lossAvoided.toLocaleString()}</span>
            </div>
            <span className="text-[11px] text-emerald-300/80 block mt-1 font-semibold">
              Farmer Revenue Saved
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Shipments Section */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-emerald-400" />
              Active Consignments Fleet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry, biological degradation kinetics, and automated dynamic liquidation offers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracking, produce, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
              />
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex rounded-xl bg-slate-800/90 p-1 border border-slate-700 text-xs font-semibold">
              {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    riskFilter === r
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {currentRole === 'transporter' && (
              <button
                onClick={onOpenNewShipment}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <Plus className="w-4 h-4" />
                Add Consignment
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider text-[11px]">
                <th className="py-3.5 px-3">Tracking ID</th>
                <th className="py-3.5 px-3">Produce</th>
                <th className="py-3.5 px-3">Volume</th>
                <th className="py-3.5 px-3">Transit Route</th>
                <th className="py-3.5 px-3">Temp</th>
                <th className="py-3.5 px-3">Humidity</th>
                <th className="py-3.5 px-3">Remaining Life</th>
                <th className="py-3.5 px-3">Risk Assessment</th>
                <th className="py-3.5 px-3">Liquidation Price</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredShipments.map((s) => {
                const latestTel = s.latest_telemetry;
                const latestPred = s.latest_prediction;
                const latestPrice = s.latest_price_recommendation;

                const isSpikeTemp = (latestTel?.temperature ?? 4) > 10;
                const isHighRisk = latestPred?.spoilage_risk === 'HIGH' || latestPred?.spoilage_risk === 'CRITICAL';

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-800/40 transition group ${
                      s.tracking_number === 'AGRO102' ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    {/* Shipment ID */}
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{s.tracking_number}</span>
                        {s.tracking_number === 'AGRO102' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-sans font-bold">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Produce */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base p-1 rounded-lg bg-slate-800 border border-slate-700/60">
                          {s.produce?.icon || '📦'}
                        </span>
                        <span className="font-bold text-slate-100">{s.produce?.name}</span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-3 font-semibold text-slate-300">
                      {s.quantity.toLocaleString()} kg
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="font-medium text-slate-200">{s.origin}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className="text-slate-400">{s.destination}</span>
                    </td>

                    {/* Temperature */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-lg inline-block ${
                          (latestTel?.temperature ?? 4) >= 35
                            ? 'bg-red-600 text-white animate-pulse'
                            : isSpikeTemp
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {latestTel ? `${latestTel.temperature.toFixed(1)}°C` : '4.0°C'}
                      </span>
                    </td>

                    {/* Humidity */}
                    <td className="py-3.5 px-3 font-mono text-slate-300 font-semibold">
                      {latestTel ? `${latestTel.humidity.toFixed(0)}%` : '75%'}
                    </td>

                    {/* Remaining Life */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-extrabold ${
                          isHighRisk ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {latestPred?.remaining_shelf_life_hours ?? 120}h
                      </span>
                      <span className="text-[10px] text-slate-500 block font-normal">
                        (~{(((latestPred?.remaining_shelf_life_hours ?? 120)) / 24).toFixed(1)} days)
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-3">
                      <RiskBadge risk={latestPred?.spoilage_risk || 'LOW'} size="sm" />
                    </td>

                    {/* Liquidation Price */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-emerald-400">
                          ₹{latestPrice?.recommended_price ?? s.original_price}
                        </span>
                        <span className="text-[10px] text-slate-500">/kg</span>
                      </div>
                      {latestPrice && latestPrice.discount_percentage > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 block">
                          -{latestPrice.discount_percentage}% OFF
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectShipment(s.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-slate-700/80"
                          title="View Full Telemetry & Spoilage Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => onOpenSimulator(s.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition cursor-pointer flex items-center gap-1"
                          title="Open Climate & Heatwave Simulator for this shipment"
                        >
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulate</span>
                        </button>

                        {onOpenMarketChannels && (
                          <button
                            onClick={() => onOpenMarketChannels(s.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
                            title="Compare 3 Buyer Channels (B2B, Quick-Commerce, Mandi)"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                            <span>Channels</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenExplainability(s)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-500/30 transition cursor-pointer flex items-center gap-1"
                          title="Explain Biological Prediction (Section 18)"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Why?</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
