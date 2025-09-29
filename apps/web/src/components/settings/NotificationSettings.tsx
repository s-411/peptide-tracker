'use client';

import { useState, useEffect } from 'react';
import { Bell, Save, Settings, Mail, Smartphone } from 'lucide-react';
import { NotificationPreferences, NotificationMethod } from '@/types/database';

interface NotificationSettingsProps {
  userId: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  doseLimit: {
    enabled: true,
    threshold: 90,
    deliveryMethods: ['in_app']
  },
  missedDose: {
    enabled: true,
    gracePeriodHours: 6,
    deliveryMethods: ['in_app']
  },
  siteRotation: {
    enabled: true,
    maxConsecutiveUses: 3,
    deliveryMethods: ['in_app']
  },
  protocolMilestones: {
    enabled: true,
    milestones: [25, 50, 75, 100],
    deliveryMethods: ['in_app']
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  emailNotifications: false,
  pushNotifications: false
};

const DELIVERY_METHOD_OPTIONS: { value: NotificationMethod; label: string; icon: any }[] = [
  { value: 'in_app', label: 'In-App', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Push', icon: Smartphone }
];

export function NotificationSettings({ }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/notification-preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      const data = await response.json();
      setPreferences(data.preferences || DEFAULT_PREFERENCES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (path: string, value: unknown) => {
    setPreferences(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = updated as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] as Record<string, unknown> };
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const toggleDeliveryMethod = (alertType: string, method: NotificationMethod) => {
    const preference = preferences[alertType as keyof NotificationPreferences];
    const currentMethods = (preference && typeof preference === 'object' && 'deliveryMethods' in preference)
      ? preference.deliveryMethods || []
      : [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];

    updatePreference(`${alertType}.deliveryMethods`, newMethods);
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-white">Notification Settings</h2>
        </div>
        <div className="text-gray">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-h4 font-heading text-white">Notification Settings</h2>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-dark px-4 py-2 rounded-button font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg mb-4">
          Notification preferences saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Dose Limit Alerts */}
        <div className="space-y-4">
          <h3 className="text-h5 font-heading text-white">Dose Limit Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray">Enable dose limit warnings</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.doseLimit?.enabled || false}
                  onChange={(e) => updatePreference('doseLimit.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {preferences.doseLimit?.enabled && (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-gray min-w-fit">Warning threshold:</span>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={preferences.doseLimit?.threshold || 90}
                    onChange={(e) => updatePreference('doseLimit.threshold', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white min-w-fit font-medium">
                    {preferences.doseLimit?.threshold || 90}%
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-gray text-sm">Delivery methods:</span>
                  <div className="flex gap-2">
                    {DELIVERY_METHOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => toggleDeliveryMethod('doseLimit', value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          preferences.doseLimit?.deliveryMethods?.includes(value)
                            ? 'bg-primary text-dark'
                            : 'bg-gray/20 text-gray hover:bg-gray/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Missed Dose Alerts */}
        <div className="space-y-4">
          <h3 className="text-h5 font-heading text-white">Missed Dose Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray">Enable missed dose reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.missedDose?.enabled || false}
                  onChange={(e) => updatePreference('missedDose.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {preferences.missedDose?.enabled && (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-gray min-w-fit">Grace period:</span>
                  <select
                    value={preferences.missedDose?.gracePeriodHours || 6}
                    onChange={(e) => updatePreference('missedDose.gracePeriodHours', parseInt(e.target.value))}
                    className="flex-1 bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={2}>2 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-gray text-sm">Delivery methods:</span>
                  <div className="flex gap-2">
                    {DELIVERY_METHOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => toggleDeliveryMethod('missedDose', value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          preferences.missedDose?.deliveryMethods?.includes(value)
                            ? 'bg-primary text-dark'
                            : 'bg-gray/20 text-gray hover:bg-gray/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Site Rotation Reminders */}
        <div className="space-y-4">
          <h3 className="text-h5 font-heading text-white">Site Rotation Reminders</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray">Enable site rotation reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.siteRotation?.enabled || false}
                  onChange={(e) => updatePreference('siteRotation.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {preferences.siteRotation?.enabled && (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-gray min-w-fit">Max consecutive uses:</span>
                  <select
                    value={preferences.siteRotation?.maxConsecutiveUses || 3}
                    onChange={(e) => updatePreference('siteRotation.maxConsecutiveUses', parseInt(e.target.value))}
                    className="flex-1 bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={2}>2 times</option>
                    <option value={3}>3 times</option>
                    <option value={4}>4 times</option>
                    <option value={5}>5 times</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-gray text-sm">Delivery methods:</span>
                  <div className="flex gap-2">
                    {DELIVERY_METHOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => toggleDeliveryMethod('siteRotation', value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          preferences.siteRotation?.deliveryMethods?.includes(value)
                            ? 'bg-primary text-dark'
                            : 'bg-gray/20 text-gray hover:bg-gray/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Protocol Milestones */}
        <div className="space-y-4">
          <h3 className="text-h5 font-heading text-white">Protocol Milestones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray">Enable milestone notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.protocolMilestones?.enabled || false}
                  onChange={(e) => updatePreference('protocolMilestones.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {preferences.protocolMilestones?.enabled && (
              <div className="space-y-2">
                <span className="text-gray text-sm">Delivery methods:</span>
                <div className="flex gap-2">
                  {DELIVERY_METHOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => toggleDeliveryMethod('protocolMilestones', value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        preferences.protocolMilestones?.deliveryMethods?.includes(value)
                          ? 'bg-primary text-dark'
                          : 'bg-gray/20 text-gray hover:bg-gray/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="text-h5 font-heading text-white">Quiet Hours</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray">Enable quiet hours</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quietHours?.enabled || false}
                  onChange={(e) => updatePreference('quietHours.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {preferences.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray text-sm">Start time:</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.startTime || '22:00'}
                    onChange={(e) => updatePreference('quietHours.startTime', e.target.value)}
                    className="w-full bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray text-sm">End time:</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.endTime || '08:00'}
                    onChange={(e) => updatePreference('quietHours.endTime', e.target.value)}
                    className="w-full bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Settings */}
        <div className="space-y-4 border-t border-gray/20 pt-6">
          <h3 className="text-h5 font-heading text-white">Global Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray" />
                <span className="text-gray">Email notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications || false}
                  onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray" />
                <span className="text-gray">Push notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications || false}
                  onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}