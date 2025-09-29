'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertType } from '@/types/database';

interface NotificationBellProps {
  userId: string;
}

const ALERT_ICONS: Record<AlertType, React.ComponentType<{className?: string; [key: string]: unknown}>> = {
  dose_limit_warning: AlertTriangle,
  dose_limit_exceeded: AlertTriangle,
  missed_dose: Bell,
  site_rotation_reminder: Info,
  protocol_milestone: CheckCircle,
  protocol_complete: CheckCircle,
  week_summary: Info
};

const SEVERITY_COLORS = {
  info: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error'
};

export function NotificationBell({ }: NotificationBellProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/alerts?unreadOnly=true&activeOnly=true');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
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

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', alertId })
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up periodic refresh for alerts
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = alerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray hover:text-white transition-colors rounded-lg hover:bg-gray/10"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-warning text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark2 border border-gray/20 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray/20">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-white">Notifications</h3>
              <span className="text-sm text-gray">{unreadCount} unread</span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray">
                Loading notifications...
              </div>
            ) : unreadCount === 0 ? (
              <div className="p-8 text-center text-gray">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray/20">
                {alerts.slice(0, 5).map((alert) => {
                  const IconComponent = ALERT_ICONS[alert.alertType];
                  const severityColor = SEVERITY_COLORS[alert.severity];

                  return (
                    <div key={alert.id} className="p-4 hover:bg-gray/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 ${severityColor}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-gray line-clamp-2 mb-2">
                            {alert.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => markAsRead(alert.id)}
                                className="p-1 text-gray hover:text-success transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => dismissAlert(alert.id)}
                                className="p-1 text-gray hover:text-error transition-colors"
                                title="Dismiss"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {unreadCount > 5 && (
                  <div className="p-3 text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-primary hover:text-primary-hover text-sm transition-colors"
                    >
                      View all {unreadCount} notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}