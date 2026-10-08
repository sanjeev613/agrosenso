import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HackathonDemoBanner } from './components/HackathonDemoBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { FifoLogisticsPage } from './pages/FifoLogisticsPage';
import { MarketChannelsPage } from './pages/MarketChannelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShipmentDetailsModal } from './components/ShipmentDetailsModal';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { NewShipmentModal } from './components/NewShipmentModal';
import { Shipment, Alert, MarketplaceListing, AnalyticsOverview, UserRole } from './types';
import { api, getStoredRole, setStoredRole } from './api/client';
import { Sparkles, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRoleState] = useState<UserRole>(getStoredRole());

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals & Navigation state
  const [detailsModalShipmentId, setDetailsModalShipmentId] = useState<number | null>(null);
  const [explainModalShipment, setExplainModalShipment] = useState<Shipment | null>(null);
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState<boolean>(false);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);
  const [selectedSimulatorShipmentId, setSelectedSimulatorShipmentId] = useState<number | null>(null);
  const [selectedChannelShipmentId, setSelectedChannelShipmentId] = useState<number | null>(null);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setStoredRole(role);
  };

  // Dedicated direct navigation to Simulator
  const handleOpenSimulator = (shipmentId: number) => {
    setSelectedSimulatorShipmentId(shipmentId);
    setDetailsModalShipmentId(null);
    setCurrentTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated direct navigation to Market Channels Comparison
  const handleOpenMarketChannels = (shipmentId: number) => {
    setSelectedChannelShipmentId(shipmentId);
    setDetailsModalShipmentId(null);
    setCurrentTab('channels');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Main data loader
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [shipmentsData, alertsData, marketData, analyticsData] = await Promise.all([
        api.getShipments(),
        api.getAlerts(),
        api.getMarketplaceListings(),
        api.getAnalytics('30d'),
      ]);

      setShipments(shipmentsData);
      setAlerts(alertsData);
      setMarketplaceListings(marketData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Periodic light polling every 12s for fresh simulation state
    const timer = setInterval(() => {
      loadData(true);
    }, 12000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Handle Demo Mode button click
  const handleActivateDemoMode = () => {
    setShowDemoBanner(true);
    setCurrentTab('dashboard');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Emergency liquidation action from shipment list
  const handleEmergencyLiquidation = async (shipmentId: number) => {
    try {
      await api.simulateTemperatureSpike(shipmentId, 18.0, 75.0);
      await loadData(true);
      setCurrentTab('marketplace');
    } catch (err) {
      console.error('Failed emergency liquidation:', err);
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read_status).length;
  const availableDealsCount = marketplaceListings.filter((l) => l.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#090e14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        unreadAlertsCount={unreadAlertsCount}
        availableDealsCount={availableDealsCount}
        onActivateDemoMode={handleActivateDemoMode}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Hackathon Demo Banner (Visible on Dashboard or when toggled) */}
        {showDemoBanner && (
          <HackathonDemoBanner
            onScenarioExecuted={() => loadData(true)}
            onNavigateToTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDismiss={() => setShowDemoBanner(false)}
          />
        )}

        {/* Tab Routing */}
        {currentTab === 'dashboard' && (
          <DashboardPage
            shipments={shipments}
            analytics={analytics}
            loading={loading}
            currentRole={currentRole}
            onSelectShipment={(id) => setDetailsModalShipmentId(id)}
            onOpenNewShipment={() => setIsNewShipmentOpen(true)}
            onOpenSimulator={handleOpenSimulator}
            onOpenExplainability={(s) => setExplainModalShipment(s)}
            onOpenMarketChannels={handleOpenMarketChannels}
          />
        )}

        {currentTab === 'shipments' && (
          <ShipmentsPage
            shipments={shipments}
            currentRole={currentRole}
            onSelectShipment={(id) => setDetailsModalShipmentId(id)}
            onOpenNewShipment={() => setIsNewShipmentOpen(true)}
            onOpenSimulator={handleOpenSimulator}
            onOpenExplainability={(s) => setExplainModalShipment(s)}
            onEmergencyLiquidation={handleEmergencyLiquidation}
            onOpenMarketChannels={handleOpenMarketChannels}
          />
        )}

        {currentTab === 'fifo' && (
          <FifoLogisticsPage
            onOpenShipmentDetails={(id) => setDetailsModalShipmentId(id)}
            onOpenSimulator={handleOpenSimulator}
            onOpenMarketChannels={handleOpenMarketChannels}
            onRefreshData={() => loadData(true)}
          />
        )}

        {currentTab === 'channels' && (
          <MarketChannelsPage
            shipments={shipments}
            initialShipmentId={selectedChannelShipmentId}
            onConsignmentRouted={() => loadData(true)}
            onOpenShipmentDetails={(id) => setDetailsModalShipmentId(id)}
          />
        )}

        {currentTab === 'simulator' && (
          <SimulatorPage
            shipments={shipments}
            selectedShipmentId={selectedSimulatorShipmentId}
            onSimulationApplied={() => loadData(true)}
          />
        )}

        {currentTab === 'predictions' && <ExplainabilityPage />}

        {currentTab === 'marketplace' && (
          <MarketplacePage
            listings={marketplaceListings}
            onListingUpdated={() => loadData(true)}
            onOpenShipmentDetails={(id) => setDetailsModalShipmentId(id)}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            onAlertsUpdated={() => loadData(true)}
            onOpenShipmentDetails={(id) => setDetailsModalShipmentId(id)}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsPage />}

        {currentTab === 'settings' && (
          <SettingsPage
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
          />
        )}
      </main>

      {/* Modals */}
      {detailsModalShipmentId !== null && (
        <ShipmentDetailsModal
          shipmentId={detailsModalShipmentId}
          onClose={() => setDetailsModalShipmentId(null)}
          onShipmentUpdated={() => loadData(true)}
        />
      )}

      {explainModalShipment !== null && (
        <ExplainabilityModal
          isOpen={explainModalShipment !== null}
          onClose={() => setExplainModalShipment(null)}
          shipment={explainModalShipment}
        />
      )}

      {isNewShipmentOpen && (
        <NewShipmentModal
          isOpen={isNewShipmentOpen}
          onClose={() => setIsNewShipmentOpen(false)}
          onShipmentCreated={() => loadData(true)}
        />
      )}

      {/* Modern AgriTech Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/70 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">🌱 AgroSense Platform</span>
            <span>•</span>
            <span>AI-Powered Perishable Cold Chain Monitoring & Smart Liquidation</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Live DB Synced
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              White-Box Q10 Predictor
            </span>
            <span>FastAPI + React TS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
