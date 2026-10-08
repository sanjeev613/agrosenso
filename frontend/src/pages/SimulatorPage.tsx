import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  Droplets,
  Clock,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  Sun,
  Flame,
  MapPin,
  Compass,
  CloudSun,
  RefreshCw,
  TrendingDown,
  Layers,
  ShieldAlert,
  Sliders,
  Gauge
} from 'lucide-react';
import { Shipment } from '../types';
import { api } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';

interface SimulatorPageProps {
  shipments: Shipment[];
  selectedShipmentId?: number | null;
  onSimulationApplied: () => void;
}

interface AgriHub {
  name: string;
  lat: number;
  lon: number;
  primary_crop: string;
}

interface MicroClimateData {
  gps: { latitude: number; longitude: number };
  location_name: string;
  current_temperature: number;
  relative_humidity: number;
  max_forecast_today: number;
  is_heatwave: boolean;
  heatwave_status: string;
  warning_message: string;
  source: string;
  timestamp: string;
}

interface HeatwaveImpactResult {
  scenario: string;
  shipment: {
    id: number;
    tracking_number: string;
    produce_name: string;
    quantity_kg: number;
  };
  micro_climate: {
    location: string;
    heatwave_temperature: number;
    humidity: number;
  };
  shelf_life_reduction: {
    baseline_shelf_life_hours: number;
    penalty_percentage: number;
    reduced_shelf_life_hours: number;
    hours_lost: number;
  };
  pricing_strategy: {
    original_price: number;
    before_discount_pct: number;
    steeper_discount_pct: number;
    new_liquidation_price: number;
    reason: string;
  };
  action_taken: string;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  shipments,
  selectedShipmentId,
  onSimulationApplied,
}) => {
  const [activeShipmentId, setActiveShipmentId] = useState<number>(
    selectedShipmentId || (shipments.length > 0 ? shipments[0].id : 1)
  );

  // Sliders state (0°C -> 45°C for heatwave testing)
  const [temperature, setTemperature] = useState<number>(4.0);
  const [humidity, setHumidity] = useState<number>(75.0);
  const [transitDelay, setTransitDelay] = useState<number>(0.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Weather & GPS State
  const [agriHubs, setAgriHubs] = useState<AgriHub[]>([]);
  const [latitude, setLatitude] = useState<number>(19.9975);
  const [longitude, setLongitude] = useState<number>(73.7898);
  const [locationName, setLocationName] = useState<string>('Nashik Agri-Zone (Maharashtra)');
  const [weatherData, setWeatherData] = useState<MicroClimateData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [heatwaveImpact, setHeatwaveImpact] = useState<HeatwaveImpactResult | null>(null);

  // Fetch hubs on mount
  useEffect(() => {
    api.getAgriculturalHubs()
      .then((res) => {
        if (res && res.hubs) {
          setAgriHubs(res.hubs);
        }
      })
      .catch((err) => console.error('Failed to load agri hubs', err));
  }, []);

  // Fetch weather when GPS/hub changes
  const fetchLocalWeather = async (lat: number, lon: number, locName: string) => {
    try {
      setWeatherLoading(true);
      const data = await api.getCurrentMicroClimate(lat, lon, locName);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch micro-climate', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalWeather(latitude, longitude, locationName);
  }, [latitude, longitude]);

  // Sync selected shipment prop when user arrives from other pages
  useEffect(() => {
    if (selectedShipmentId) {
      setActiveShipmentId(selectedShipmentId);
    }
  }, [selectedShipmentId]);

  // Sync sliders when active shipment changes
  useEffect(() => {
    const current = shipments.find((s) => s.id === activeShipmentId);
    if (current && current.latest_telemetry) {
      setTemperature(current.latest_telemetry.temperature);
      setHumidity(current.latest_telemetry.humidity);
      setTransitDelay(current.latest_telemetry.transit_delay || 0);
    }
  }, [activeShipmentId, shipments]);

  const currentShipment = shipments.find((s) => s.id === activeShipmentId) || shipments[0];

  // Geolocation trigger
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setLocationName(`Farmer Local GPS (${lat}°N, ${lon}°E)`);
        setGpsDetecting(false);
        fetchLocalWeather(lat, lon, `Farmer GPS (${lat}, ${lon})`);
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err);
        setGpsDetecting(false);
        alert('Could not access GPS location. Falling back to agricultural hub coordinates.');
      },
      { timeout: 8000 }
    );
  };

  // Sync sliders with real-time weather
  const handleSyncWithWeather = () => {
    if (!weatherData) return;
    setTemperature(weatherData.current_temperature);
    setHumidity(weatherData.relative_humidity);
    setSuccessBanner(
      `Synchronized sliders with live micro-climate from ${weatherData.location_name}: ${weatherData.current_temperature}°C, ${weatherData.relative_humidity}% RH.`
    );
  };

  // Button 1: [Apply Telemetry]
  const handleApplyCustom = async () => {
    try {
      setLoading(true);
      setSuccessBanner(null);
      setHeatwaveImpact(null);
      await api.simulateCustom(activeShipmentId, temperature, humidity, transitDelay);
      setSuccessBanner(`Telemetry data (${temperature}°C, ${humidity}%, +${transitDelay}h) successfully recorded in database & AI models updated.`);
      onSimulationApplied();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Button 2: [Simulate Temperature Spike] (Target 18°C)
  const handleSimulateSpike = async () => {
    try {
      setLoading(true);
      setSuccessBanner(null);
      setHeatwaveImpact(null);
      setTemperature(18.0);
      setHumidity(75.0);
      setTransitDelay(0.0);
      await api.simulateTemperatureSpike(activeShipmentId, 18.0, 75.0);
      setSuccessBanner(`Temperature Spike (18.0°C) persisted to database. AI pipeline recalculated remaining shelf life (~18h), triggered alerts, and updated liquidation discounts.`);
      onSimulationApplied();
    } catch (err: any) {
      alert(`Spike simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Button 3: [Simulate Heatwave & 30% Shelf-Life Reduction + Steeper Price Discount]
  const handleSimulateHeatwave = async (customTemp: number = 39.5) => {
    try {
      setLoading(true);
      setSuccessBanner(null);
      setTemperature(customTemp);
      setHumidity(28.0);

      const result = await api.simulateHeatwave({
        shipment_id: activeShipmentId,
        latitude,
        longitude,
        heatwave_temp: customTemp,
        humidity: 28.0,
        location_name: locationName,
      });

      setHeatwaveImpact(result);
      setSuccessBanner(
        `🔥 HEATWAVE SIMULATION COMPLETE: ${customTemp}°C recorded at ${locationName}. Vegetable shelf life automatically reduced by 30% (${result.shelf_life_reduction.baseline_shelf_life_hours}h → ${result.shelf_life_reduction.reduced_shelf_life_hours}h). Steeper liquidation discount of ${result.pricing_strategy.steeper_discount_pct}% activated to clear inventory before spoilage!`
      );
      onSimulationApplied();
    } catch (err: any) {
      alert(`Heatwave simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Button 4: [Simulate Transit Delay] (+8h delay)
  const handleSimulateDelay = async () => {
    try {
      setLoading(true);
      setSuccessBanner(null);
      setHeatwaveImpact(null);
      const newDelay = transitDelay + 8.0;
      setTransitDelay(newDelay);
      await api.simulateTransitDelay(activeShipmentId, newDelay);
      setSuccessBanner(`Transit Delay (+${newDelay}h) recorded to database. Cumulative delay degradation updated in shelf-life prediction.`);
      onSimulationApplied();
    } catch (err: any) {
      alert(`Delay simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Button 5: [Reset Normal Conditions]
  const handleResetNormal = async () => {
    try {
      setLoading(true);
      setSuccessBanner(null);
      setHeatwaveImpact(null);
      await api.simulateReset(activeShipmentId);
      const produce = currentShipment?.produce;
      const normalT = produce ? (produce.ideal_temp_min + produce.ideal_temp_max) / 2 : 4.0;
      const normalH = produce ? (produce.ideal_humidity_min + produce.ideal_humidity_max) / 2 : 75.0;
      setTemperature(normalT);
      setHumidity(normalH);
      setTransitDelay(0.0);
      setSuccessBanner(`Shipment reset to standard baseline cold-chain conditions (${normalT}°C, ${normalH}%). Liquidation offer reset.`);
      onSimulationApplied();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const latestPred = currentShipment?.latest_prediction;
  const latestPrice = currentShipment?.latest_price_recommendation;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-400" />
            Telemetry Simulator & Weather Stress Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate ambient weather swings and highway delays. Fetch real-time local micro-climate conditions via Open-Meteo GPS API.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>Live DB Persisted</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <CloudSun className="w-3.5 h-3.5" />
            <span>Open-Meteo GPS</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-in shadow-xl backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold block text-emerald-200">Database Updated & Pipeline Recalculated:</span>
            {successBanner}
          </div>
        </div>
      )}

      {/* SECTION 1: Micro-Climate Weather & Farmer GPS Card */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Local Micro-Climate Weather Station
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Farmer GPS Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live ambient temperature and humidity fetched via Open-Meteo High-Resolution Weather API
              </p>
            </div>
          </div>

          {/* GPS Detection Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectGps}
              disabled={gpsDetecting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Detect GPS coordinates using browser location"
            >
              <Compass className={`w-3.5 h-3.5 text-blue-400 ${gpsDetecting ? 'animate-spin' : ''}`} />
              {gpsDetecting ? 'Detecting GPS...' : 'Use My GPS'}
            </button>
            <button
              onClick={() => fetchLocalWeather(latitude, longitude, locationName)}
              disabled={weatherLoading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${weatherLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Agricultural Hub & Coordinates Row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Agricultural Production Corridor / Hub
            </label>
            <select
              value={locationName}
              onChange={(e) => {
                const found = agriHubs.find((h) => h.name === e.target.value);
                if (found) {
                  setLocationName(found.name);
                  setLatitude(found.lat);
                  setLongitude(found.lon);
                } else {
                  setLocationName(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              {agriHubs.map((hub) => (
                <option key={hub.name} value={hub.name}>
                  {hub.name} — ({hub.primary_crop})
                </option>
              ))}
              <option value="Custom GPS Location">Custom GPS Coordinates</option>
            </select>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Lat (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Lon (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Weather Metrics Display */}
          <div className="md:col-span-4 flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Live Open-Meteo Weather
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-amber-400">
                  {weatherData ? `${weatherData.current_temperature}°C` : '--'}
                </span>
                <span className="text-xs text-blue-400 font-bold">
                  {weatherData ? `${weatherData.relative_humidity}% RH` : '--'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncWithWeather}
              disabled={!weatherData}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/30 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              Sync to Sliders
            </button>
          </div>
        </div>

        {/* Heatwave Warning Banner if applicable */}
        {weatherData && (weatherData.is_heatwave || temperature >= 35.0) && (
          <div className="mt-4 p-4 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-200 flex flex-wrap items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <span className="font-black text-xs block text-red-200 uppercase tracking-wider">
                  HEATWAVE PREDICTED IN THIS AGRICULTURAL MICRO-CLIMATE
                </span>
                <span className="text-xs text-red-300">
                  Peak ambient temperature reaches {weatherData.max_forecast_today}°C. Perishable produce requires urgent inventory clearance.
                </span>
              </div>
            </div>
            <button
              onClick={() => handleSimulateHeatwave(39.5)}
              className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-900/50 cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" />
              Trigger Heatwave Protocol (-30% Shelf Life)
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Heatwave Impact Breakdown Card */}
      {heatwaveImpact && (
        <div className="rounded-3xl border-2 border-red-500 bg-gradient-to-r from-red-950/80 via-slate-900/95 to-orange-950/80 p-6 shadow-2xl animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-red-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Micro-Climate Heatwave Protocol Executed
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black">
                    -30% SHELF LIFE CUT
                  </span>
                </h3>
                <p className="text-xs text-red-200/80">
                  {heatwaveImpact.action_taken}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black">
              {heatwaveImpact.micro_climate.heatwave_temperature}°C Thermal Stress
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shelf-Life Impact */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/30">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Vegetable Shelf-Life Compression</span>
                <span className="text-red-400 font-extrabold">-30.0% Automatic Penalty</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-xs text-slate-500 block">Baseline Shelf Life</span>
                  <span className="text-xl font-bold text-slate-300 line-through">
                    {heatwaveImpact.shelf_life_reduction.baseline_shelf_life_hours}h
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-red-400" />
                <div className="text-right">
                  <span className="text-xs text-red-400 block font-bold">Post-Heatwave Shelf Life</span>
                  <span className="text-2xl font-black text-red-400">
                    {heatwaveImpact.shelf_life_reduction.reduced_shelf_life_hours}h
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    (~{(heatwaveImpact.shelf_life_reduction.reduced_shelf_life_hours / 24).toFixed(1)} days remaining)
                  </span>
                </div>
              </div>
            </div>

            {/* Steeper Faster Price Discount Strategy */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-orange-500/30">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Accelerated Clearance Pricing</span>
                <span className="text-orange-400 font-extrabold">Steeper Liquidation Strategy</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-xs text-slate-500 block">Baseline Price</span>
                  <span className="text-xl font-bold text-slate-300 line-through">
                    ₹{heatwaveImpact.pricing_strategy.original_price}/kg
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {heatwaveImpact.pricing_strategy.before_discount_pct}% standard discount
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-400" />
                <div className="text-right">
                  <span className="text-xs text-orange-400 block font-bold">New Liquidation Price</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{heatwaveImpact.pricing_strategy.new_liquidation_price}/kg
                  </span>
                  <span className="text-xs text-orange-400 font-black block">
                    {heatwaveImpact.pricing_strategy.steeper_discount_pct}% Clearance Markdown
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-red-900/20 border border-red-500/20 text-xs text-slate-300 italic">
            "{heatwaveImpact.pricing_strategy.reason}"
          </div>
        </div>
      )}

      {/* SECTION 3: Main Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls Panel */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Target Shipment Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Select Produce Consignment to Simulate
            </label>
            <select
              value={activeShipmentId}
              onChange={(e) => setActiveShipmentId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tracking_number} — {s.produce?.name} ({s.quantity} kg, {s.origin} → {s.destination})
                  {s.tracking_number === 'AGRO102' ? ' [OFFICIAL DEMO BATCH]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Temperature (0°C -> 45°C) */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-red-400" />
                Temperature Slider (0°C → 45°C)
              </span>
              <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                temperature >= 35.0
                  ? 'bg-red-600 text-white animate-pulse'
                  : temperature > 10
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {temperature.toFixed(1)}°C
                {temperature >= 35.0 ? ' 🔥' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>0°C (Deep Chill)</span>
              <span className="text-emerald-400 font-bold">4°C (Target)</span>
              <span className="text-amber-400 font-bold">18°C (Spike Demo)</span>
              <span className="text-red-400 font-black">35°C+ (Heatwave Zone)</span>
              <span>45°C</span>
            </div>
          </div>

          {/* Slider 2: Humidity (20% -> 100%) */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" />
                Humidity Slider (20% → 100%)
              </span>
              <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-400">
                {humidity.toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(parseFloat(e.target.value))}
              className="w-full accent-blue-slider"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>20% (Arid)</span>
              <span className="text-amber-400 font-bold">40%</span>
              <span className="text-blue-400 font-bold">75% (Target)</span>
              <span className="text-cyan-400 font-bold">90%</span>
              <span>100% (Mould Condensation)</span>
            </div>
          </div>

          {/* Slider 3: Transit Delay (0 -> 48 hours) */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Transit Delay Slider (0 → 48 hours)
              </span>
              <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                transitDelay > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'
              }`}>
                +{transitDelay.toFixed(0)} hours
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              step="1"
              value={transitDelay}
              onChange={(e) => setTransitDelay(parseFloat(e.target.value))}
              className="w-full accent-purple-slider"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>0h (On Schedule)</span>
              <span>12h Delay</span>
              <span>24h Delay</span>
              <span className="text-red-400 font-bold">48h Highway Delay</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleApplyCustom}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                [Apply Telemetry Sliders]
              </button>

              <button
                onClick={handleSimulateSpike}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-orange-900/40 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                [Simulate Spike (18°C)]
              </button>
            </div>

            {/* Micro-Climate Heatwave Emergency Trigger */}
            <button
              onClick={() => handleSimulateHeatwave(39.5)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition cursor-pointer shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 border border-red-400/30"
            >
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Simulate Heatwave (39.5°C) & Auto-Reduce Shelf Life by 30%</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleSimulateDelay}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                [Simulate Transit Delay (+8h)]
              </button>

              <button
                onClick={handleResetNormal}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                [Reset 4°C Cold Chain]
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Predictive Impact Preview */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                Live AI Pipeline Output State
              </span>
              <RiskBadge risk={latestPred?.spoilage_risk || 'LOW'} size="md" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                {currentShipment?.produce?.icon || '🍅'}
              </span>
              <div>
                <h4 className="font-extrabold text-lg text-white">
                  {currentShipment?.tracking_number} ({currentShipment?.produce?.name})
                </h4>
                <p className="text-xs text-slate-400">
                  {currentShipment?.origin} → {currentShipment?.destination} ({currentShipment?.quantity} kg)
                </p>
              </div>
            </div>

            {/* Live Predicted Cards */}
            <div className="mt-6 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Remaining Shelf Life:</span>
                <span className="text-xl font-black text-emerald-400">
                  {latestPred?.remaining_shelf_life_hours ?? 120} hours
                  <span className="text-xs text-slate-400 ml-1 font-normal">
                    (~{((latestPred?.remaining_shelf_life_hours ?? 120) / 24).toFixed(1)} days)
                  </span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Degradation Score:</span>
                <span className="text-xl font-black text-amber-400">
                  {latestPred?.degradation_score ?? 12}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Recommended Liquidation Price:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400">
                    ₹{latestPrice?.recommended_price ?? currentShipment?.original_price}/kg
                  </span>
                  {latestPrice && latestPrice.discount_percentage > 0 && (
                    <span className="text-xs text-amber-400 block font-extrabold">
                      -{latestPrice.discount_percentage}% Liquidation Discount
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Biological kinetics reason */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Explainable Biological Kinetics Reason:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{latestPred?.explanation || 'Cold chain parameters operating within safe microbiological thresholds.'}"
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>All telemetry simulations write directly to the database <code>telemetry</code> table.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
