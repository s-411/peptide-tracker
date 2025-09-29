'use client';

import { InjectionSiteAnalytics } from '@/types/database';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface InjectionSiteMapProps {
  data: InjectionSiteAnalytics[];
}

const SITE_DISPLAY_NAMES: Record<string, string> = {
  abdomen: 'Abdomen',
  thigh: 'Thigh',
  arm: 'Upper Arm',
  buttocks: 'Buttocks',
  other: 'Other'
};

export function InjectionSiteMap({ data }: InjectionSiteMapProps) {
  if (data.length === 0) {
    return (
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <h3 className="text-h4 font-heading text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Injection Site Analysis
        </h3>
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray/50 mx-auto mb-2" />
          <p className="text-gray">No injection site data available</p>
        </div>
      </div>
    );
  }

  const totalUsage = data.reduce((sum, site) => sum + site.usageCount, 0);
  const overusedSites = data.filter(site => site.overused);
  const wellRotatedSites = data.filter(site => !site.overused && site.usageCount > 0);

  return (
    <div className="bg-dark2 p-6 rounded-card border border-gray/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Injection Site Analysis
        </h3>
        <div className="text-sm text-gray">
          {data.length} sites used
        </div>
      </div>

      {/* Site Usage Visualization */}
      <div className="space-y-3 mb-6">
        {data.map((site) => {
          const sideLabel = site.side !== 'center' ? ` (${site.side})` : '';
          const displayName = `${SITE_DISPLAY_NAMES[site.location] || site.location}${sideLabel}`;

          return (
            <div key={`${site.location}-${site.side}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{displayName}</span>
                  {site.overused && (
                    <AlertTriangle className="w-4 h-4 text-warning" title="Potentially overused" />
                  )}
                  {site.recommendedRotation && (
                    <CheckCircle className="w-4 h-4 text-success" title="Good rotation site" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{site.usagePercentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray">{site.usageCount} uses</div>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="w-full bg-gray/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    site.overused
                      ? 'bg-warning'
                      : site.usagePercentage > 15
                      ? 'bg-primary'
                      : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(site.usagePercentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray">
                <span>
                  Last used: {site.daysSinceLastUse === 0
                    ? 'Today'
                    : `${site.daysSinceLastUse} day${site.daysSinceLastUse !== 1 ? 's' : ''} ago`
                  }
                </span>
                {site.daysSinceLastUse > 14 && (
                  <span className="text-warning">Consider rotating back</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Site Rotation Status */}
      <div className="border-t border-gray/20 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{wellRotatedSites.length}</div>
            <div className="text-xs text-gray">Well Rotated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{overusedSites.length}</div>
            <div className="text-xs text-gray">Potentially Overused</div>
          </div>
        </div>

        {/* Rotation Recommendations */}
        {overusedSites.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-warning font-medium text-sm">Rotation Recommendation</span>
            </div>
            <p className="text-xs text-gray">
              Consider rotating away from: {overusedSites.map(s =>
                SITE_DISPLAY_NAMES[s.location] || s.location
              ).join(', ')}
            </p>
          </div>
        )}

        {/* Underused Sites */}
        {data.some(site => site.daysSinceLastUse > 14) && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium text-sm">Available Sites</span>
            </div>
            <p className="text-xs text-gray">
              Consider using: {data
                .filter(site => site.daysSinceLastUse > 14)
                .map(s => SITE_DISPLAY_NAMES[s.location] || s.location)
                .join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}