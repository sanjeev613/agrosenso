import { Shipment, Produce, Alert, MarketplaceListing, AnalyticsOverview, User, UserRole } from '../types';

const API_BASE = '/api';

// Token handling
export const getStoredToken = (): string | null => localStorage.getItem('agrosense_token');
export const setStoredToken = (token: string) => localStorage.setItem('agrosense_token', token);
export const removeStoredToken = () => localStorage.removeItem('agrosense_token');

export const getStoredRole = (): UserRole => {
  return (localStorage.getItem('agrosense_role') as UserRole) || 'transporter';
};
export const setStoredRole = (role: UserRole) => localStorage.setItem('agrosense_role', role);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const role = getStoredRole();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Role': role,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Shipments
  getShipments: (status?: string): Promise<Shipment[]> => {
    const q = status ? `?status_filter=${encodeURIComponent(status)}` : '';
    return request<Shipment[]>(`/shipments${q}`);
  },

  getShipmentById: (id: number): Promise<Shipment> => {
    return request<Shipment>(`/shipments/${id}`);
  },

  createShipment: (data: {
    produce_id: number;
    origin: string;
    destination: string;
    quantity: number;
    original_price: number;
    expected_arrival_hours?: number;
  }): Promise<Shipment> => {
    return request<Shipment>('/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProduceList: (): Promise<Produce[]> => {
    return request<Produce[]>('/produce');
  },

  // Telemetry
  recordTelemetry: (data: {
    shipment_id: number;
    temperature: number;
    humidity: number;
    transit_hours?: number;
    transit_delay?: number;
  }) => {
    return request('/telemetry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Simulations
  simulateTemperatureSpike: (shipmentId?: number, targetTemp: number = 18.0, humidity: number = 75.0) => {
    return request('/simulate/temperature-spike', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentId,
        target_temperature: targetTemp,
        humidity,
      }),
    });
  },

  simulateTransitDelay: (shipmentId: number, delayHours: number = 8.0) => {
    return request('/simulate/transit-delay', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentId,
        delay_hours: delayHours,
      }),
    });
  },

  simulateCustom: (shipmentId: number, temperature: number, humidity: number, transitDelay: number = 0.0) => {
    return request('/simulate/custom', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentId,
        temperature,
        humidity,
        transit_delay: transitDelay,
      }),
    });
  },

  simulateReset: (shipmentId?: number) => {
    return request('/simulate/reset', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: shipmentId }),
    });
  },

  // Predictions & Explainability
  getPredictionDetails: (shipmentId: number) => {
    return request<any>(`/predictions/${shipmentId}`);
  },

  recalculatePrediction: (shipmentId: number) => {
    return request<any>(`/predict/${shipmentId}`, { method: 'POST' });
  },

  // Marketplace
  getMarketplaceListings: (status?: string): Promise<MarketplaceListing[]> => {
    const q = status ? `?status_filter=${encodeURIComponent(status)}` : '';
    return request<MarketplaceListing[]>(`/marketplace${q}`);
  },

  acceptMarketplaceOffer: (id: number): Promise<{ success: boolean; message: string; listing: MarketplaceListing }> => {
    return request<{ success: boolean; message: string; listing: MarketplaceListing }>(`/marketplace/${id}/accept`, {
      method: 'POST',
    });
  },

  // Alerts
  getAlerts: (unreadOnly: boolean = false): Promise<Alert[]> => {
    return request<Alert[]>(`/alerts?unread_only=${unreadOnly}`);
  },

  markAlertRead: (id: number) => {
    return request(`/alerts/${id}/read`, { method: 'PATCH' });
  },

  markAllAlertsRead: () => {
    return request('/alerts/mark-all-read', { method: 'POST' });
  },

  // Analytics
  getAnalytics: (range: string = '30d'): Promise<AnalyticsOverview> => {
    return request<AnalyticsOverview>(`/analytics/overview?range=${range}`);
  },

  // FIFO Logistics & Virtual Grid
  getInventoryGrid: (layoutType: 'truck' | 'storage' = 'truck') => {
    return request<any>(`/inventory/grid?layout_type=${layoutType}`);
  },

  dispatchNextFifoBatch: (layoutType: 'truck' | 'storage' = 'truck') => {
    return request<any>(`/inventory/dispatch-next?layout_type=${layoutType}`, {
      method: 'POST',
    });
  },

  // Multi-Channel Market Comparison & Price Fluctuations
  getLiveMarketTicker: () => {
    return request<any>('/market-channels/live-feed');
  },

  getMarketChannelComparison: (shipmentId: number) => {
    return request<any>(`/market-channels/compare/${shipmentId}`);
  },

  routeConsignmentToChannel: (data: {
    shipment_id: number;
    channel_id: string;
    channel_name: string;
    negotiated_price: number;
  }) => {
    return request<any>('/market-channels/route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Weather API & Micro-Climate Heatwave Simulation
  getAgriculturalHubs: () => {
    return request<{ hubs: Array<{ name: string; lat: number; lon: number; primary_crop: string }> }>('/weather/hubs');
  },

  getCurrentMicroClimate: (latitude?: number, longitude?: number, locationName?: string) => {
    const params = new URLSearchParams();
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());
    if (locationName) params.append('location_name', locationName);
    return request<any>(`/weather/current?${params.toString()}`);
  },

  simulateHeatwave: (data: {
    shipment_id?: number;
    latitude?: number;
    longitude?: number;
    heatwave_temp?: number;
    humidity?: number;
    location_name?: string;
  }) => {
    return request<any>('/weather/simulate-heatwave', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Auth
  login: (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (name: string, email: string, password: string, role: string): Promise<{ access_token: string; user: User }> => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getMe: (): Promise<User> => {
    return request<User>('/auth/me');
  },
};

