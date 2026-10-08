import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Truck,
  IndianRupee,
  Info,
  Check
} from 'lucide-react';
import { MarketplaceListing } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../api/client';

interface MarketplacePageProps {
  listings: MarketplaceListing[];
  onListingUpdated: () => void;
  onOpenShipmentDetails: (shipmentId: number) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  listings,
  onListingUpdated,
  onOpenShipmentDetails,
}) => {
  const [selectedDeal, setSelectedDeal] = useState<MarketplaceListing | null>(null);
  const [purchasedListing, setPurchasedListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'AVAILABLE' | 'SOLD' | 'ALL'>('AVAILABLE');

  const availableListings = listings.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const handleAcceptOffer = async (listing: MarketplaceListing) => {
    try {
      setLoading(true);
      const res = await api.acceptMarketplaceOffer(listing.id);
      setPurchasedListing(res.listing);
      setSelectedDeal(null);
      onListingUpdated();
    } catch (err: any) {
      alert(`Could not accept offer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-emerald-400" />
              Smart Liquidation Marketplace
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Autonomous Liquidation Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic discounts automatically triggered when transit cold-chain risks are detected, connecting logistics to local retail buyers before spoilage occurs.
          </p>
        </div>

        {/* Filter */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Deals ({listings.filter((l) => l.status === 'AVAILABLE').length})
          </button>
          <button
            onClick={() => setStatusFilter('SOLD')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'SOLD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sold / Liquidated ({listings.filter((l) => l.status === 'SOLD').length})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Success Receipt Banner */}
      {purchasedListing && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">
                Liquidation Deal Accepted Successfully!
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Order confirmed for <strong className="text-white">{purchasedListing.quantity} kg of {purchasedListing.produce_name}</strong> at{' '}
                <strong className="text-emerald-400">₹{purchasedListing.price}/kg</strong> (-{purchasedListing.discount_percentage}% OFF).
                Total batch value: <strong className="text-white">₹{(purchasedListing.quantity * purchasedListing.price).toLocaleString()}</strong>.
              </p>
              <span className="text-xs text-slate-400 block mt-1 font-mono">
                Consignment: {purchasedListing.tracking_number} (En-route from {purchasedListing.origin})
              </span>
            </div>
          </div>
          <button
            onClick={() => setPurchasedListing(null)}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Listings Cards Grid (Section 12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableListings.map((item) => {
          const isSold = item.status === 'SOLD';
          const totalOriginal = item.quantity * item.original_price;
          const totalDiscounted = item.quantity * item.price;
          const totalSavings = totalOriginal - totalDiscounted;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isSold
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/30'
              }`}
            >
              {/* Card Top Banner */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                      {item.produce_icon}
                    </span>
                    <div>
                      <h3 className="font-black text-lg text-white">
                        Fresh {item.produce_name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 block">
                        Shipment {item.tracking_number}
                      </span>
                    </div>
                  </div>

                  {/* Discount Badge */}
                  <div className="text-right">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                      {item.discount_percentage}% OFF
                    </span>
                    {isSold && (
                      <span className="block text-[10px] uppercase font-bold text-blue-400 mt-1">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Spec Badges */}
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Available Volume</span>
                    <span className="font-bold text-white text-sm">{item.quantity} kg</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Estimated Shelf Life</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {item.remaining_shelf_life_hours} hours
                    </span>
                  </div>
                </div>

                {/* Location & Spoilage Risk */}
                <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {item.origin} → {item.destination}
                  </span>
                  <RiskBadge risk={item.spoilage_risk} size="sm" />
                </div>

                {/* Pricing Block */}
                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Price per kg</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through text-slate-500">
                        ₹{item.original_price}
                      </span>
                      <span className="text-2xl font-black text-emerald-400">
                        ₹{item.price}
                        <span className="text-xs font-normal text-slate-400">/kg</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Batch Total</span>
                    <span className="text-sm font-bold text-white">
                      ₹{totalDiscounted.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      Save ₹{totalSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Why Discounted? (Section 12) */}
                <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                    Why Discounted?
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{item.discount_reason}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2">
                <button
                  onClick={() => setSelectedDeal(item)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  [View Deal Details]
                </button>

                {!isSold ? (
                  <button
                    disabled={loading}
                    onClick={() => handleAcceptOffer(item)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    [Accept Offer]
                  </button>
                ) : (
                  <span className="flex-1 py-2.5 rounded-xl bg-slate-800/40 text-slate-500 font-bold text-xs text-center">
                    Accepted / Claimed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {availableListings.length === 0 && (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Liquidation Offers</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cold chains are operating normally. When temperature anomalies or transit delays exceed degradation thresholds, dynamic liquidation listings appear here automatically.
          </p>
        </div>
      )}

      {/* View Deal Details Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-800">
                  {selectedDeal.produce_icon}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Liquidation Lot: {selectedDeal.produce_name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Consignment {selectedDeal.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block mb-0.5">Quantity</span>
                  <span className="text-base font-bold text-white">{selectedDeal.quantity} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block mb-0.5">Estimated Remaining Life</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedDeal.remaining_shelf_life_hours} hours
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Unit Discounted Price</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-500">₹{selectedDeal.original_price}/kg</span>
                    <span className="text-lg font-black text-emerald-400">₹{selectedDeal.price}/kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Total Lot Cost</span>
                  <span className="text-base font-bold text-white">
                    ₹{(selectedDeal.quantity * selectedDeal.price).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="font-bold text-amber-400 block mb-1">
                  Why is this consignment discounted?
                </span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{selectedDeal.discount_reason}"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const sId = selectedDeal.shipment_id;
                  setSelectedDeal(null);
                  onOpenShipmentDetails(sId);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Inspect Telemetry Graphs
              </button>
              {selectedDeal.status === 'AVAILABLE' && (
                <button
                  disabled={loading}
                  onClick={() => handleAcceptOffer(selectedDeal)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Accept Liquidation Offer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
