import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Truck, Package, IndianRupee, MapPin } from 'lucide-react';
import { Produce } from '../types';
import { api } from '../api/client';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentCreated: () => void;
}

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({
  isOpen,
  onClose,
  onShipmentCreated,
}) => {
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [selectedProduceId, setSelectedProduceId] = useState<number>(1);
  const [origin, setOrigin] = useState('Nashik');
  const [destination, setDestination] = useState('Mumbai');
  const [quantity, setQuantity] = useState<number>(600);
  const [originalPrice, setOriginalPrice] = useState<number>(85);
  const [expectedArrivalHours, setExpectedArrivalHours] = useState<number>(16);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getProduceList()
        .then((data) => {
          setProduceList(data);
          if (data.length > 0) {
            setSelectedProduceId(data[0].id);
            setOriginalPrice(data[0].base_price);
          }
        })
        .catch((err) => console.error('Failed to load produce list:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProduceChange = (id: number) => {
    setSelectedProduceId(id);
    const found = produceList.find((p) => p.id === id);
    if (found) {
      setOriginalPrice(found.base_price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.createShipment({
        produce_id: selectedProduceId,
        origin,
        destination,
        quantity,
        original_price: originalPrice,
        expected_arrival_hours: expectedArrivalHours,
      });
      onShipmentCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create New Perishable Shipment</h3>
              <p className="text-xs text-slate-400">Initialize live IoT simulation tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Produce Type
            </label>
            <select
              value={selectedProduceId}
              onChange={(e) => handleProduceChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {produceList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} ({p.category} — Baseline: {p.initial_shelf_life_hours}h life)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Origin Hub
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Nashik"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Destination City
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Total Quantity (kg)
              </label>
              <input
                type="number"
                min="10"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Original Price (₹/kg)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Expected Transit Window (hours)
            </label>
            <input
              type="number"
              min="2"
              max="96"
              value={expectedArrivalHours}
              onChange={(e) => setExpectedArrivalHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              {loading ? 'Creating...' : 'Initialize Shipment & Sensors'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
