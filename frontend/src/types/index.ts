export type SpoilageRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'transporter' | 'retailer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Produce {
  id: number;
  name: string;
  category: string;
  initial_shelf_life_hours: number;
  base_price: number;
  ideal_temp_min: number;
  ideal_temp_max: number;
  ideal_humidity_min: number;
  ideal_humidity_max: number;
  icon: string;
}

export interface Telemetry {
  id: number;
  shipment_id: number;
  temperature: number;
  humidity: number;
  transit_hours: number;
  transit_delay: number;
  timestamp: string;
}

export interface Prediction {
  id: number;
  shipment_id: number;
  remaining_shelf_life_hours: number;
  spoilage_risk: SpoilageRisk;
  degradation_score: number;
  confidence_score: number;
  explanation: string;
  created_at: string;
  factors?: string[];
}

export interface PriceRecommendation {
  id: number;
  shipment_id: number;
  original_price: number;
  discount_percentage: number;
  recommended_price: number;
  reason: string;
  status: string;
  created_at: string;
}

export interface Alert {
  id: number;
  shipment_id: number;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface MarketplaceListing {
  id: number;
  shipment_id: number;
  tracking_number: string;
  produce_name: string;
  produce_category: string;
  produce_icon: string;
  quantity: number;
  price: number;
  original_price: number;
  discount_percentage: number;
  status: 'AVAILABLE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';
  listed_at: string;
  origin: string;
  destination: string;
  current_location: string;
  remaining_shelf_life_hours: number;
  spoilage_risk: SpoilageRisk;
  discount_reason: string;
  buyer_id?: number | null;
  purchased_at?: string | null;
}

export interface Shipment {
  id: number;
  tracking_number: string;
  produce_id: number;
  transporter_id: number;
  origin: string;
  destination: string;
  quantity: number;
  original_price: number;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'LIQUIDATED' | 'SPOILED';
  start_time: string;
  expected_arrival?: string | null;
  created_at: string;
  produce?: Produce;
  latest_telemetry?: Telemetry;
  latest_prediction?: Prediction;
  latest_price_recommendation?: PriceRecommendation;
  marketplace_listing?: MarketplaceListing;
  telemetry_history?: Telemetry[];
  prediction_history?: Prediction[];
  alerts?: Alert[];
}

export interface AnalyticsOverview {
  time_range: string;
  total_shipments: number;
  successful_deliveries: number;
  at_risk_shipments: number;
  spoilage_incidents: number;
  products_saved_kg: number;
  average_discount_pct: number;
  total_inventory_value: number;
  potential_loss: number;
  liquidation_revenue: number;
  estimated_loss_avoided: number;
  loss_avoided_label: string;
  produce_distribution: Array<{ name: string; count: number; saved_kg: number; status: string }>;
  risk_breakdown: Array<{ risk: string; count: number; color: string }>;
}
