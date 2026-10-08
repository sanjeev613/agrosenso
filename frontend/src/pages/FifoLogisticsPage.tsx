import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  Warehouse,
  ArrowDown,
  ArrowRight,
  Clock,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  LogOut,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Package
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';

interface FifoLogisticsPageProps {
  onOpenShipmentDetails: (shipmentId: number) => void;
  onOpenSimulator?: (shipmentId: number) => void;
  onOpenMarketChannels?: (shipmentId: number) => void;
  onRefreshData: () => void;
}

export const FifoLogisticsPage: React.FC<FifoLogisticsPageProps> = ({
  onOpenShipmentDetails,
  onOpenSimulator,
  onOpenMarketChannels,
  onRefreshData,
}) => {
  const [layoutType, setLayoutType] = useState<'truck' | 'storage'>('truck');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');
  const [gridData, setGridData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadGrid = async (type: 'truck' | 'storage' = layoutType) => {
    try {
      setLoading(true);
      const data = await api.getInventoryGrid(type);
      setGridData(data);
      if (data.grid_cells && data.grid_cells.length > 0) {
        // Select first occupied cell by default
        const firstOccupied = data.grid_cells.find((c: any) => c.batch !== null);
        setSelectedCell(firstOccupied || data.grid_cells[0]);
      }
    } catch (err) {
      console.error('Failed to load FIFO grid:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrid(layoutType);
  }, [layoutType]);

  const handleDispatchNext = async () => {
    try {
      setActionLoading(true);
      setDispatchFeedback(null);
      const res = await api.dispatchNextFifoBatch(layoutType);
      setDispatchFeedback(res.message);
      await loadGrid(layoutType);
      onRefreshData();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSpikeSelectedSlot = async (shipmentId: number) => {
    try {
      setActionLoading(true);
      await api.simulateTemperatureSpike(shipmentId, 18.0, 75.0);
      await loadGrid(layoutType);
      onRefreshData();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getSlotColorClasses = (colorCode?: string) => {
    switch (colorCode) {
      case 'RED':
        return 'border-red-500 bg-red-950/45 text-red-200 shadow-xl shadow-red-950/50 ring-2 ring-red-500/60 animate-pulse';
      case 'YELLOW':
        return 'border-amber-500/90 bg-amber-950/30 text-amber-200 ring-1 ring-amber-500/40';
      case 'GREEN':
        return 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/30';
      default:
        return 'border-slate-800 bg-slate-900/30 text-slate-500 border-dashed';
    }
  };

  const queue = gridData?.fifo_dispatch_queue || [];

  // Filtered cells based on user's active zone filter
  const displayedCells = (gridData?.grid_cells || []).filter((c: any) => {
    if (zoneFilter === 'ALL') return true;
    if (!c.batch) return true;
    return c.batch.color_code === zoneFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Boxes className="w-7 h-7 text-emerald-400" />
              FIFO Visual Logistics & 3-Zone Slotting Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              FIFO / FEFO Spatial Logic
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Automated virtual layout for transport trucks and cold storage facilities. Batches are color-coded into 3 distinct operational zones based on calculated shelf life to optimize physical placement and prevent in-transit spoilage.
          </p>
        </div>

        {/* View Switcher & Dispatch Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setLayoutType('truck');
                loadGrid('truck');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                layoutType === 'truck'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              Reefer Truck Bay
            </button>
            <button
              onClick={() => {
                setLayoutType('storage');
                loadGrid('storage');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                layoutType === 'storage'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              Cold Storage Room
            </button>
          </div>

          <button
            onClick={handleDispatchNext}
            disabled={actionLoading || queue.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
            title="Pop and dispatch highest-priority batch from the Red Zone"
          >
            <LogOut className="w-4 h-4" />
            Unload Next Batch (FIFO #1)
          </button>
        </div>
      </div>

      {/* The Core 3-Zone Logistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RED ZONE CARD */}
        <div
          onClick={() => setZoneFilter(zoneFilter === 'RED' ? 'ALL' : 'RED')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            zoneFilter === 'RED'
              ? 'bg-red-950/50 border-red-500 ring-2 ring-red-500/40 shadow-xl'
              : 'bg-red-950/20 border-red-500/30 hover:border-red-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              🔴 Red Zone (Sell within 24–48 hours)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
              {gridData?.red_zone_batches ?? 0} batches
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Front of Loading Dock or Truck
          </h4>
          <p className="text-xs text-red-200/80 leading-relaxed">
            <strong>Mandatory Placement:</strong> Must be placed at the very front of the loading dock or truck for immediate unload and emergency local clearance.
          </p>
        </div>

        {/* YELLOW ZONE CARD */}
        <div
          onClick={() => setZoneFilter(zoneFilter === 'YELLOW' ? 'ALL' : 'YELLOW')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            zoneFilter === 'YELLOW'
              ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
              : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              🟡 Yellow Zone (Sell within 3–5 days)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {gridData?.yellow_zone_batches ?? 0} batches
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Standard Market Distribution
          </h4>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            <strong>Logistics Strategy:</strong> Standard wholesale mandi distribution. Positioned in mid-cargo bays with normal clearance cadence.
          </p>
        </div>

        {/* GREEN ZONE CARD */}
        <div
          onClick={() => setZoneFilter(zoneFilter === 'GREEN' ? 'ALL' : 'GREEN')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            zoneFilter === 'GREEN'
              ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
              : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              🟢 Green Zone (Stable shelf life)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {gridData?.green_zone_batches ?? 0} batches
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Distant Markets or Reserve
          </h4>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            <strong>Logistics Strategy:</strong> Can be held back or shipped to more distant, high-paying markets. Positioned deep inside cold air plenums.
          </p>
        </div>
      </div>

      {/* Dispatch Feedback Alert */}
      {dispatchFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{dispatchFeedback}</span>
          </div>
          <button
            onClick={() => setDispatchFeedback(null)}
            className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid & Stack Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): The Virtual Physical Grid */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                {layoutType === 'truck' ? (
                  <>
                    <Truck className="w-5 h-5 text-emerald-400" />
                    Reefer Truck Cargo Deck Plan View (Zoned Layout)
                  </>
                ) : (
                  <>
                    <Warehouse className="w-5 h-5 text-blue-400" />
                    Cold Storage Facility Racking Matrix (Zoned Layout)
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical placement ordered from Deep Chiller (Cabin) to Loading Dock Exit.
              </p>
            </div>

            {/* Zone Filter Pill */}
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
              {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoneFilter(z)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    zoneFilter === z
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z === 'ALL' ? 'All Slots' : z === 'RED' ? '🔴 Red' : z === 'YELLOW' ? '🟡 Yellow' : '🟢 Green'}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Graphic Frame with Distinct Physical Zones */}
          <div className="relative rounded-3xl border border-slate-700/80 bg-slate-950/90 p-6 overflow-hidden">
            {/* Top: GREEN ZONE AREA (Deep Chiller / Distant Markets) */}
            <div className="mb-3 p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                🟢 GREEN ZONE SECTION (Deep Chiller Front — Stable Shelf Life / Distant Markets)
              </span>
              <span className="text-[11px] text-slate-400">Can be held back</span>
            </div>

            {/* Grid Cells */}
            <div
              className={`grid gap-3.5 my-3 ${
                layoutType === 'truck' ? 'grid-cols-2 max-w-xl mx-auto' : 'grid-cols-3 max-w-2xl mx-auto'
              }`}
            >
              {displayedCells.map((cell: any) => {
                const b = cell.batch;
                const isSelected = selectedCell?.slot_id === cell.slot_id;
                const colorClasses = getSlotColorClasses(b?.color_code);

                return (
                  <div
                    key={cell.slot_id}
                    onClick={() => setSelectedCell(cell)}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[145px] ${colorClasses} ${
                      isSelected ? 'ring-4 ring-emerald-400 scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">
                        {cell.slot_id}
                      </span>
                      {b && (
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                            b.color_code === 'RED' ? 'bg-red-500 text-white font-bold' : b.color_code === 'YELLOW' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                          }`}>
                            {b.color_code} ZONE
                          </span>
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-white shadow">
                            #{b.fifo_queue_position}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Batch Content */}
                    {b ? (
                      <div className="my-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{b.produce_icon}</span>
                          <div>
                            <span className="font-black text-sm text-white block leading-tight">
                              {b.tracking_number}
                            </span>
                            <span className="text-xs text-slate-300 font-medium">
                              {b.produce_name} • {b.quantity_kg}kg
                            </span>
                          </div>
                        </div>

                        {/* Shelf Life Bar */}
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {b.remaining_shelf_life_hours}h life (~{b.remaining_shelf_life_days}d)
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {b.temperature}°C
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="my-auto text-center py-4 text-slate-600 text-xs font-semibold">
                        [ Empty Slot ]
                      </div>
                    )}

                    {/* Slot Footer Logistics Strategy */}
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[150px]">{cell.zone_name}</span>
                      {b && (
                        <span className="font-semibold text-emerald-400">
                          ₹{b.recommended_price}/kg
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: RED ZONE AREA (Exit / Unload First) */}
            <div className="mt-3 p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between text-xs">
              <span className="font-bold text-red-400 flex items-center gap-1.5">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-red-400" />
                🔴 RED ZONE SECTION (Front of Truck Tailgate / Loading Dock Ramp — Sell within 24–48h)
              </span>
              <span className="text-[11px] font-bold text-red-300 uppercase">
                First Out / Immediate Unload
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Slot & FIFO Queue */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Slot Inspector */}
          {selectedCell && selectedCell.batch ? (
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-800">
                    {selectedCell.batch.produce_icon}
                  </span>
                  <div>
                    <h4 className="font-black text-lg text-white">
                      {selectedCell.batch.tracking_number} ({selectedCell.batch.produce_name})
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      Slot {selectedCell.slot_id} • {selectedCell.zone_name}
                    </span>
                  </div>
                </div>
                <RiskBadge risk={selectedCell.batch.spoilage_risk} size="sm" />
              </div>

              {/* Explicit Zone Strategy Callout */}
              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                selectedCell.batch.color_code === 'RED'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : selectedCell.batch.color_code === 'YELLOW'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              }`}>
                <span className="font-black uppercase tracking-wider block mb-1">
                  {selectedCell.batch.zone_label}
                </span>
                <p className="font-medium">
                  {selectedCell.batch.logistics_instruction}
                </p>
                <div className="mt-2 pt-2 border-t border-current/20 text-[11px]">
                  <strong>Market Target:</strong> {selectedCell.batch.market_strategy}
                </div>
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">FIFO Priority</span>
                  <span className="font-black text-amber-400 text-sm">
                    Sequence #{selectedCell.batch.fifo_queue_position}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Shelf Life Left</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {selectedCell.batch.remaining_shelf_life_hours}h (~{selectedCell.batch.remaining_shelf_life_days}d)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Batch Quantity</span>
                  <span className="font-bold text-white text-sm">
                    {selectedCell.batch.quantity_kg} kg
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-slate-400 block text-[11px]">Unit Price</span>
                  <span className="font-bold text-white text-sm">
                    ₹{selectedCell.batch.recommended_price}/kg
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleSpikeSelectedSlot(selectedCell.batch.shipment_id)}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Simulate Heat Spike (Move to Red Zone)
                </button>

                {onOpenMarketChannels && (
                  <button
                    onClick={() => onOpenMarketChannels(selectedCell.batch.shipment_id)}
                    className="w-full py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Compare 3 Buyer Channels (B2B, Quick-Commerce, Mandi)
                  </button>
                )}

                {onOpenSimulator && (
                  <button
                    onClick={() => onOpenSimulator(selectedCell.batch.shipment_id)}
                    className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    Simulate Heatwave & Local GPS Weather
                  </button>
                )}

                <button
                  onClick={() => onOpenShipmentDetails(selectedCell.batch.shipment_id)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Open Full Telemetry Graphs
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 text-center text-slate-500 text-xs">
              Select a batch in the virtual grid to inspect its zone strategy.
            </div>
          )}

          {/* The Ordered FIFO Unloading Stack */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">FIFO Unloading Sequence</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                {queue.length} in stack
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unloading order prioritized by Red Zone urgency first, followed by Yellow and Green (click any batch to inspect):
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {queue.map((b: any, index: number) => {
                const isTop = index === 0;

                return (
                  <div
                    key={b.shipment_id}
                    onClick={() => {
                      const matched = gridData?.grid_cells?.find((c: any) => c.batch?.shipment_id === b.shipment_id);
                      if (matched) setSelectedCell(matched);
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] ${
                      isTop
                        ? 'bg-red-950/40 border-red-500/60 ring-2 ring-red-500/30 shadow-lg'
                        : b.color_code === 'RED'
                        ? 'bg-red-950/20 border-red-500/30 hover:border-red-500'
                        : b.color_code === 'YELLOW'
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          isTop
                            ? 'bg-red-500 text-white'
                            : b.color_code === 'RED'
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-2xl">{b.produce_icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">
                            {b.tracking_number}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-1 rounded ${
                            b.color_code === 'RED'
                              ? 'bg-red-500/20 text-red-400'
                              : b.color_code === 'YELLOW'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {b.color_code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          {b.produce_name} • {b.quantity_kg}kg
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">
                        {b.remaining_shelf_life_hours}h life
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ₹{b.recommended_price}/kg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
