'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, X, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertType } from '@/types/database';

interface AlertsWidgetProps {
  userId: string;
}

interface AlertWithActions extends Alert {
  isExpanded?: boolean;
}

const ALERT_TYPE_CONFIG: Record<AlertType, {
  icon: React.ComponentType<{className?: string; [key: string]: unknown}>;
  color: string;
  bgColor: string;
  title: string;
}> = {
  dose_limit_warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Dose Limit Warning'
  },
  dose_limit_exceeded: {
    icon: AlertTriangle,
    color: 'text-error',
    bgColor: 'bg-error/10',
    title: 'Dose Limit Exceeded'
  },
  missed_dose: {
    icon: Bell,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    title: 'Missed Dose'
  },
  site_rotation_reminder: {
    icon: Info,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Site Rotation Reminder'
  },
  protocol_milestone: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'Protocol Milestone'
  },
  protocol_complete: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    title: 'Protocol Complete'
  },
  week_summary: {
    icon: Info,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    title: 'Week Summary'
  }
};

const SEVERITY_CONFIG = {
  info: { color: 'text-primary', bgColor: 'bg-primary/10' },
  success: { color: 'text-success', bgColor: 'bg-success/10' },
  warning: { color: 'text-warning', bgColor: 'bg-warning/10' },
  error: { color: 'text-error', bgColor: 'bg-error/10' }
};

export function AlertsWidget({ }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<AlertWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/alerts?unreadOnly=${!showAll}&activeOnly=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', alertId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, isRead: true }
          : alert
      ));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', alertId })
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const toggleExpanded = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, isExpanded: !alert.isExpanded }
        : alert
    ));
  };

  useEffect(() => {
    fetchAlerts();
  }, [showAll]);

  if (loading) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 font-heading text-primary">Alerts & Notifications</h2>
        </div>
        <div className="text-gray">Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 font-heading text-primary">Alerts & Notifications</h2>
        </div>
        <div className="text-error">Error: {error}</div>
      </div>
    );
  }

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const displayAlerts = showAll ? alerts : alerts.filter(alert => !alert.isRead);

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-h4 font-heading text-primary">Alerts & Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-warning text-dark text-xs px-2 py-1 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-gray hover:text-white transition-colors text-sm"
        >
          {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showAll ? 'Hide Read' : 'Show All'}
        </button>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-gray text-center py-8">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{showAll ? 'No alerts available' : 'No unread alerts'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.slice(0, showAll ? undefined : 5).map((alert) => {
            const config = ALERT_TYPE_CONFIG[alert.alertType];
            const severityConfig = SEVERITY_CONFIG[alert.severity];
            const IconComponent = config.icon;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  alert.isRead
                    ? 'bg-gray/5 border-gray/20'
                    : `${severityConfig.bgColor} border-gray/30`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${severityConfig.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${
                          alert.isRead ? 'text-gray' : 'text-white'
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          alert.isRead ? 'text-gray' : 'text-gray'
                        } ${alert.isExpanded ? '' : 'line-clamp-2'}`}>
                          {alert.message}
                        </p>

                        {alert.message.length > 100 && (
                          <button
                            onClick={() => toggleExpanded(alert.id)}
                            className="text-primary hover:text-primary-hover text-xs mt-1"
                          >
                            {alert.isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}

                        {alert.actionText && alert.actionUrl && (
                          <div className="mt-2">
                            <a
                              href={alert.actionUrl}
                              className="inline-flex items-center text-sm bg-primary text-dark px-3 py-1 rounded-button hover:bg-primary-hover transition-colors"
                            >
                              {alert.actionText}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-1 text-gray hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-1 text-gray hover:text-error transition-colors"
                          title="Dismiss alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray">
                      <span>{config.title}</span>
                      <span>•</span>
                      <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      {alert.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires {new Date(alert.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!showAll && alerts.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center py-2 text-primary hover:text-primary-hover transition-colors text-sm"
            >
              Show {alerts.length - 5} more alerts
            </button>
          )}
        </div>
      )}
    </div>
  );
}