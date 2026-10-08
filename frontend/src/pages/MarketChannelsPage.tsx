import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Factory,
  Zap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Clock,
  ShieldAlert,
  Percent,
  Check,
  RotateCcw,
  Store,
  Layers,
  FileCheck
} from 'lucide-react';
import { Shipment } from '../types';
import { api } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';

interface MarketChannelsPageProps {
  shipments: Shipment[];
  initialShipmentId?: number | null;
  onConsignmentRouted: () => void;
  onOpenShipmentDetails: (id: number) => void;
}

export const MarketChannelsPage: React.FC<MarketChannelsPageProps> = ({
  shipments,
  initialShipmentId,
  onConsignmentRouted,
  onOpenShipmentDetails,
}) => {
  const [selectedShipmentId, setSelectedShipmentId] = useState<number>(
    initialShipmentId || (shipments.length > 0 ? shipments[0].id : 1)
  );
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [confirmedDeal, setConfirmedDeal] = useState<any>(null);

  // Sync initialShipmentId if provided or changed externally
  useEffect(() => {
    if (initialShipmentId) {
      setSelectedShipmentId(initialShipmentId);
    }
  }, [initialShipmentId]);

  const loadData = async (shipmentId: number = selectedShipmentId) => {
    try {
      setLoading(true);
      const [compRes, tickerRes] = await Promise.all([
        api.getMarketChannelComparison(shipmentId),
        api.getLiveMarketTicker(),
      ]);
      setComparisonData(compRes);
      setTickerData(tickerRes.live_ticker || []);
    } catch (err) {
      console.error('Failed to load market comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedShipmentId);
  }, [selectedShipmentId]);

  const handleRefreshFluctuations = async () => {
    await loadData(selectedShipmentId);
  };

  const handleRouteToChannel = async (option: any) => {
    try {
      setActionLoading(true);
      const res = await api.routeConsignmentToChannel({
        shipment_id: selectedShipmentId,
        channel_id: option.id,
        channel_name: option.name,
        negotiated_price: option.net_price_per_kg,
      });
      setConfirmedDeal(res);
      onConsignmentRouted();
    } catch (err: any) {
      alert(`Routing failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const currentShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
              Multi-Channel Market & Buyer Liquidation Engine
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Live Price Arbitrage
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Simulates real-time wholesale mandi auctions alongside quick-commerce dark stores and B2B processing factories, empowering farmers with a direct side-by-side comparison matrix.
          </p>
        </div>

        <button
          onClick={handleRefreshFluctuations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          Simulate Market Fluctuations
        </button>
      </div>

      {/* Live Market Price Ticker */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-x-auto shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Inter-Market Commodity Rates Index (₹/kg):
          </span>
        </div>
        <div className="flex items-center gap-4 no-scrollbar min-w-max">
          {tickerData.map((item) => (
            <div
              key={item.produce}
              className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-4 text-xs"
            >
              <span className="font-bold text-white text-sm">{item.produce}</span>
              <div>
                <span className="text-[10px] text-slate-400 block">APMC Mandi Spot</span>
                <span className="font-mono font-bold text-amber-400">
                  ₹{item.mandi_spot}
                  <span className={`text-[10px] ml-1 font-semibold ${item.mandi_change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.mandi_change_pct >= 0 ? `+${item.mandi_change_pct}%` : `${item.mandi_change_pct}%`}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Blinkit Bid</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{item.quick_commerce_bid}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Factory Buyout</span>
                <span className="font-mono font-bold text-blue-400">
                  ₹{item.processing_bid}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consignment Selector Bar */}
      <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-slate-800">
            {currentShipment?.produce?.icon || '📦'}
          </span>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block">
              Evaluate Options For Consignment:
            </label>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(Number(e.target.value))}
              className="mt-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tracking_number} — {s.produce?.name} ({s.quantity} kg, {s.origin} → {s.destination})
                  {s.tracking_number === 'AGRO102' ? ' [OFFICIAL DEMO]' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">Remaining Shelf Life:</span>
            <span className="font-bold text-emerald-400 text-sm">
              {comparisonData?.shipment?.remaining_shelf_life_hours} hours
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Spoilage Risk:</span>
            <div className="mt-0.5">
              <RiskBadge risk={comparisonData?.shipment?.spoilage_risk || 'LOW'} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-slate-400 block">Consignment Volume:</span>
            <span className="font-bold text-white text-sm">
              {comparisonData?.shipment?.quantity_kg} kg
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Order Banner */}
      {confirmedDeal && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start justify-between gap-4 shadow-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-white text-base">
                Consignment Successfully Routed!
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                {confirmedDeal.message}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-emerald-300">
                <span>Total Contract Settlement: ₹{confirmedDeal.total_contract_value?.toLocaleString()}</span>
                <span>•</span>
                <span>Direct Dock Clearance Authorized</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfirmedDeal(null)}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Channel Recommendation Banner */}
      {comparisonData?.recommendation_reason && (
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                AI Commercial Optimization Strategy
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {comparisonData.recommendation_reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side 3-Option Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisonData?.options?.map((option: any) => {
          const isRecommended = option.is_recommended;

          return (
            <div
              key={option.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isRecommended
                  ? 'bg-slate-900/90 border-amber-500/80 shadow-2xl shadow-amber-950/40 ring-2 ring-amber-500/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">
                      {option.icon}
                    </span>
                    <div>
                      <h3 className="font-black text-lg text-white leading-tight">
                        {option.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {option.tagline}
                      </span>
                    </div>
                  </div>
                </div>

                {isRecommended && (
                  <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI RECOMMENDED BUYER
                  </div>
                )}

                {/* Price Matrix */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Offered Gross Bid:</span>
                    <span className="font-mono font-bold text-slate-200">₹{option.offered_price_per_kg}/kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Fees / Deductions:</span>
                    <span className="font-mono text-red-400">-₹{option.deductions_per_kg}/kg</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Net Realized Price:</span>
                    <span className="text-xl font-black text-emerald-400">₹{option.net_price_per_kg}/kg</span>
                  </div>
                </div>

                {/* Total Payout Showcase */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block mb-0.5">Estimated Total Payout</span>
                  <span className="text-2xl font-black text-white">
                    ₹{option.total_payout.toLocaleString()}
                  </span>
                </div>

                {/* Turnaround & Rejection Risk */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Intake Turnaround:
                    </span>
                    <span className="font-bold text-white">{option.turnaround_time}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Rejection / Spoilage Risk:
                    </span>
                    <span className={`font-bold ${option.rejection_risk_pct > 30 ? 'text-red-400' : option.rejection_risk_pct > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {option.rejection_risk_pct}%
                    </span>
                  </div>
                </div>

                {/* Quality Acceptance Threshold */}
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs">
                  <span className="font-bold text-slate-300 block mb-1">Quality Acceptance Standard:</span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {option.quality_threshold}
                  </p>
                </div>

                {/* Pros and Cons */}
                <div className="space-y-1.5 text-xs">
                  {option.pros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{pro}</span>
                    </div>
                  ))}
                  {option.cons.map((con: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-red-300">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60">
                <button
                  disabled={actionLoading}
                  onClick={() => handleRouteToChannel(option)}
                  className={`w-full py-3 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                    isRecommended
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-900/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  Select & Route to {option.name.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Comparison Matrix Table (Farmer Comparison Tool) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-lg text-white">
            Farmer Direct Comparison Matrix
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Side-by-side technical and financial breakdown across all 3 liquidation channels:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/50">
                <th className="py-3.5 px-4">Decision Parameter</th>
                <th className="py-3.5 px-4">🏭 1. B2B Processing Factory</th>
                <th className="py-3.5 px-4">⚡ 2. Quick-Commerce (Blinkit)</th>
                <th className="py-3.5 px-4">🏛️ 3. Local Wholesale Mandi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Gross Offered Bid</td>
                <td className="py-3.5 px-4 font-mono font-bold">₹{comparisonData?.options[0]?.offered_price_per_kg}/kg</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹{comparisonData?.options[1]?.offered_price_per_kg}/kg (Highest)</td>
                <td className="py-3.5 px-4 font-mono font-bold">₹{comparisonData?.options[2]?.offered_price_per_kg}/kg (Auction Spot)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Commission & Deductions</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold">₹0.00 (Zero Commission)</td>
                <td className="py-3.5 px-4 text-amber-400 font-semibold">4% Platform slotting</td>
                <td className="py-3.5 px-4 text-red-400 font-semibold">7% Commission + ₹1.5/kg Labor</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Net Realized Price</td>
                <td className="py-3.5 px-4 font-mono font-black">₹{comparisonData?.options[0]?.net_price_per_kg}/kg</td>
                <td className="py-3.5 px-4 font-mono font-black text-emerald-400">₹{comparisonData?.options[1]?.net_price_per_kg}/kg</td>
                <td className="py-3.5 px-4 font-mono font-black">₹{comparisonData?.options[2]?.net_price_per_kg}/kg</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Total Expected Payout</td>
                <td className="py-3.5 px-4 font-mono font-black text-white">₹{comparisonData?.options[0]?.total_payout.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-mono font-black text-emerald-400">₹{comparisonData?.options[1]?.total_payout.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-mono font-black text-amber-400">₹{comparisonData?.options[2]?.total_payout.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Dock Intake Speed</td>
                <td className="py-3.5 px-4 text-blue-400 font-medium">3 - 4 hours (Fast Tanker)</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">1 - 2 hours (Ultra-Fast Hub)</td>
                <td className="py-3.5 px-4 text-red-400 font-medium">14 - 18 hours (Auction Line)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Rejection / Spoilage Dump Risk</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">&lt;2% (Pulp & Puree accepts ripe)</td>
                <td className="py-3.5 px-4 text-amber-400 font-semibold">
                  {comparisonData?.options[1]?.rejection_risk_pct}% (Strict firmness audit)
                </td>
                <td className="py-3.5 px-4 text-red-400 font-semibold">
                  {comparisonData?.options[2]?.rejection_risk_pct}% (Dump risk during long queue)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Payment Settlement</td>
                <td className="py-3.5 px-4">Bank NEFT within 24h</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Instant Escrow on Dock Scan</td>
                <td className="py-3.5 px-4 text-slate-400">Mandi Slip (7–14 days credit)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white">Best Suited For</td>
                <td className="py-3.5 px-4 text-red-300 font-semibold">Red Zone Batches (&lt;24h life)</td>
                <td className="py-3.5 px-4 text-emerald-300 font-semibold">Yellow/Green Zone (24-72h)</td>
                <td className="py-3.5 px-4 text-slate-400">Stable Bulk Non-Perishables</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
