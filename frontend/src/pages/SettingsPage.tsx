import React from 'react';
import {
  Settings,
  Shield,
  Database,
  Lock,
  User,
  CheckCircle2,
  Key,
  Server,
  FileText,
  Truck,
  Store
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsPageProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentRole, setCurrentRole }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-400" />
          System Settings & Platform Architecture
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Role configuration, security compliance audit, and live backend connection parameters.
        </p>
      </div>

      {/* Role Management Card */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          Active User Profile & Role-Based Access Control (RBAC)
        </h3>
        <p className="text-xs text-slate-400">
          AgroSense implements strict RBAC to guarantee that retailers cannot alter transporter sensor logs, and transporters cannot accept buyer contracts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Transporter Option */}
          <div
            onClick={() => setCurrentRole('transporter')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              currentRole === 'transporter'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Transporter / Distributor
              </span>
              {currentRole === 'transporter' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Default user: <strong className="text-slate-300">Apex Cold Chain Logistics</strong> (transporter@agrosense.com). Permissions: Add shipments, simulate climate telemetry, trigger liquidations.
            </p>
          </div>

          {/* Retailer Option */}
          <div
            onClick={() => setCurrentRole('retailer')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              currentRole === 'retailer'
                ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                Retailer / Buyer
              </span>
              {currentRole === 'retailer' && (
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Default user: <strong className="text-slate-300">FreshBazaar Supermarkets</strong> (retailer@agrosense.com). Permissions: Browse discounted liquidation deals, accept emergency lots, view notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Security Compliance Audit Card (Section 18) */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Security & Secret Management Audit (Section 18)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Frontend Secret Exposure: ZERO
            </div>
            <p className="text-slate-400 leading-relaxed">
              All database connection URIs, JWT cryptographic secrets, and internal keys are strictly maintained in backend server environment variables (`.env`). No credentials exist in client bundles.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Cryptographic Password Hashing
            </div>
            <p className="text-slate-400 leading-relaxed">
              User credentials stored using bcrypt salt & hashing algorithm. API authentication secured with Bearer JWT tokens with automated expiry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Live Database Persistence
            </div>
            <p className="text-slate-400 leading-relaxed">
              SQLite / PostgreSQL / Supabase compatible SQLAlchemy ORM. All simulation events, sensor ticks, and liquidation purchases persist directly to tables.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Input Validation & Sanitation
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every API input validated with Pydantic schemas (temperature ranges -10°C to 60°C, humidity 0% to 100%, transit delay boundaries).
            </p>
          </div>
        </div>
      </div>

      {/* API Endpoints Catalog (Section 19) */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          Documented REST API Endpoints Catalog (Section 19)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/auth/register</td>
                <td className="py-2 px-3 font-sans text-slate-400">Register new user (Transporter / Retailer)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/auth/login</td>
                <td className="py-2 px-3 font-sans text-slate-400">Login and receive JWT Bearer token</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-blue-400 font-bold">GET</td>
                <td className="py-2 px-3">/api/shipments</td>
                <td className="py-2 px-3 font-sans text-slate-400">Fetch all consignments and current telemetry</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/shipments</td>
                <td className="py-2 px-3 font-sans text-slate-400">Create new consignment with baseline sensors</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-blue-400 font-bold">GET</td>
                <td className="py-2 px-3">/api/shipments/{'{id}'}</td>
                <td className="py-2 px-3 font-sans text-slate-400">Get shipment telemetry history and predictions</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/telemetry</td>
                <td className="py-2 px-3 font-sans text-slate-400">Record new sensor telemetry & run pipeline</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/simulate/temperature-spike</td>
                <td className="py-2 px-3 font-sans text-slate-400">Simulate temperature spike (18°C) demo scenario</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/simulate/transit-delay</td>
                <td className="py-2 px-3 font-sans text-slate-400">Simulate highway checkpoint transit delay</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-blue-400 font-bold">GET</td>
                <td className="py-2 px-3">/api/marketplace</td>
                <td className="py-2 px-3 font-sans text-slate-400">Fetch liquidation offers for retailers</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-emerald-400 font-bold">POST</td>
                <td className="py-2 px-3">/api/marketplace/{'{id}'}/accept</td>
                <td className="py-2 px-3 font-sans text-slate-400">Accept and claim dynamic liquidation discount</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-blue-400 font-bold">GET</td>
                <td className="py-2 px-3">/api/alerts</td>
                <td className="py-2 px-3 font-sans text-slate-400">Retrieve real-time spoilage & cold chain alerts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
