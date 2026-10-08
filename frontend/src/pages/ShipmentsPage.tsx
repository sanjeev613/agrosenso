import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Activity,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  MapPin
} from 'lucide-react';
import { Shipment, UserRole } from '../types';
import { RiskBadge } from '../components/RiskBadge';

interface ShipmentsPageProps {
  shipments: Shipment[];
  currentRole: UserRole;
  onSelectShipment: (id: number) => void;
  onOpenNewShipment: () => void;
  onOpenSimulator: (id: number) => void;
  onOpenExplainability: (s: Shipment) => void;
  onEmergencyLiquidation: (shipmentId: number) => void;
  onOpenMarketChannels?: (id: number) => void;
}

export const ShipmentsPage: React.FC<ShipmentsPageProps> = ({
  shipments,
  currentRole,
  onSelectShipment,
  onOpenNewShipment,
  onOpenSimulator,
  onOpenExplainability,
  onEmergencyLiquidation,
  onOpenMarketChannels,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = shipments.filter((s) => {
    const matchesSearch =
      s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.produce?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-emerald-400" />
            Consignment Fleet & Cold Chain Shipments
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of produce in transit, route tracking, and automated shelf-life estimation.
          </p>
        </div>

        {currentRole === 'transporter' && (
          <button
            onClick={onOpenNewShipment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            Add New Shipment
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, produce, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
          {['ALL', 'IN_TRANSIT', 'LIQUIDATED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/40">
                <th className="py-4 px-4">Tracking Code</th>
                <th className="py-4 px-4">Produce</th>
                <th className="py-4 px-4">Quantity</th>
                <th className="py-4 px-4">Origin → Destination</th>
                <th className="py-4 px-4">Telemetry (T / H)</th>
                <th className="py-4 px-4">Elapsed</th>
                <th className="py-4 px-4">Remaining Life</th>
                <th className="py-4 px-4">Risk</th>
                <th className="py-4 px-4">Current Price</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => {
                const latestTel = s.latest_telemetry;
                const latestPred = s.latest_prediction;
                const latestPrice = s.latest_price_recommendation;

                const isSpikeTemp = (latestTel?.temperature ?? 4) > 10;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {s.tracking_number}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{s.produce?.icon || '📦'}</span>
                        <span className="font-bold text-white">{s.produce?.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-200">
                      {s.quantity} kg
                    </td>

                    <td className="py-4 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>{s.origin}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span>{s.destination}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <span className={isSpikeTemp ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {latestTel?.temperature ?? 4}°C
                      </span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-blue-400">{latestTel?.humidity ?? 75}%</span>
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      {latestTel?.transit_hours ?? 18}h
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-400">
                        {latestPred?.remaining_shelf_life_hours ?? 120}h
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        (~{((latestPred?.remaining_shelf_life_hours ?? 120) / 24).toFixed(1)} days)
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <RiskBadge risk={latestPred?.spoilage_risk || 'LOW'} size="sm" />
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">
                          ₹{latestPrice?.recommended_price ?? s.original_price}/kg
                        </span>
                        {latestPrice && latestPrice.discount_percentage > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                            -{latestPrice.discount_percentage}%
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectShipment(s.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="View Telemetry Graphs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenSimulator(s.id)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition cursor-pointer"
                          title="Simulate Climate Conditions"
                        >
                          <Activity className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenExplainability(s)}
                          className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition cursor-pointer"
                          title="AI Explainability (Why?)"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>

                        {onOpenMarketChannels && (
                          <button
                            onClick={() => onOpenMarketChannels(s.id)}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition cursor-pointer"
                            title="Compare 3 Market Buyer Channels"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}

                        {currentRole === 'transporter' && s.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => onEmergencyLiquidation(s.id)}
                            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 transition cursor-pointer"
                            title="Trigger Emergency Liquidation Listing"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No shipments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
