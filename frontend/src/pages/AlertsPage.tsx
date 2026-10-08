import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info,
  Clock,
  CheckCheck,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Alert } from '../types';
import { api } from '../api/client';

interface AlertsPageProps {
  alerts: Alert[];
  onAlertsUpdated: () => void;
  onOpenShipmentDetails: (shipmentId: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAlertsUpdated,
  onOpenShipmentDetails,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesUnread = !unreadOnly || !a.read_status;
    return matchesSeverity && matchesUnread;
  });

  const handleMarkRead = async (id: number) => {
    try {
      await api.markAlertRead(id);
      onAlertsUpdated();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      onAlertsUpdated();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold animate-pulse">
            🔴 CRITICAL
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold">
            🟠 HIGH RISK
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
            🟡 WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
            🔵 INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-400" />
            Cold Chain Spoilage Alerts & Real-Time Feed
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated notifications stored in database for temperature spikes, transit delays, and critical liquidation windows.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          Mark All As Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Severity:</span>
          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
            {['ALL', 'CRITICAL', 'HIGH_RISK', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
          />
          Show Unread Only
        </label>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
              !alert.read_status
                ? 'bg-slate-900/90 border-slate-700/80 shadow-md ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-0.5">{getSeverityBadge(alert.severity)}</div>

              <div>
                <p className="text-sm font-semibold text-white leading-snug">
                  {alert.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="font-mono text-emerald-400">
                    Shipment ID #{alert.shipment_id}
                  </span>
                  <span>•</span>
                  <span>{new Date(alert.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="capitalize">{alert.alert_type.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenShipmentDetails(alert.shipment_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                View Shipment
              </button>

              {!alert.read_status && (
                <button
                  onClick={() => handleMarkRead(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-500 text-xs">
            No alerts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
