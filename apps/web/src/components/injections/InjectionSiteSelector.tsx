'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { InjectionLocation } from '@/types/database';

interface InjectionSiteSelectorProps {
  value: {
    location: InjectionLocation;
    subLocation?: string;
    side: 'left' | 'right' | 'center';
    notes?: string;
  };
  onChange: (siteData: {
    location: InjectionLocation;
    subLocation?: string;
    side: 'left' | 'right' | 'center';
    notes?: string;
  }) => void;
  error?: string;
}

interface LocationOption {
  value: InjectionLocation;
  label: string;
  description: string;
  icon: string;
  sides: Array<'left' | 'right' | 'center'>;
  subLocations: string[];
}

const locationOptions: LocationOption[] = [
  {
    value: 'abdomen',
    label: 'Abdomen',
    description: 'Common for subcutaneous injections',
    icon: '🟡',
    sides: ['left', 'right', 'center'],
    subLocations: ['upper', 'lower', 'navel area', 'love handle'],
  },
  {
    value: 'thigh',
    label: 'Thigh',
    description: 'Large muscle area, easy self-injection',
    icon: '🦵',
    sides: ['left', 'right'],
    subLocations: ['upper outer', 'mid outer', 'upper inner', 'mid inner'],
  },
  {
    value: 'arm',
    label: 'Arm',
    description: 'Upper arm or forearm injection',
    icon: '💪',
    sides: ['left', 'right'],
    subLocations: ['upper arm', 'forearm', 'shoulder area', 'tricep'],
  },
  {
    value: 'glute',
    label: 'Glute',
    description: 'Large muscle, suitable for larger volumes',
    icon: '🍑',
    sides: ['left', 'right'],
    subLocations: ['upper outer', 'upper inner', 'lower outer'],
  },
  {
    value: 'shoulder',
    label: 'Shoulder',
    description: 'Deltoid muscle injection',
    icon: '🫲',
    sides: ['left', 'right'],
    subLocations: ['anterior', 'posterior', 'lateral'],
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Specify custom location',
    icon: '📍',
    sides: ['left', 'right', 'center'],
    subLocations: [],
  },
];

export function InjectionSiteSelector({ value, onChange, error }: InjectionSiteSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(
    locationOptions.find(opt => opt.value === value.location) || locationOptions[0]
  );

  const handleLocationChange = (location: LocationOption) => {
    setSelectedLocation(location);

    // Reset side and subLocation when changing location
    const newSide = location.sides.includes(value.side) ? value.side : location.sides[0];

    onChange({
      location: location.value,
      side: newSide,
      subLocation: '',
      notes: value.notes,
    });
  };

  const handleSideChange = (side: 'left' | 'right' | 'center') => {
    onChange({
      ...value,
      side,
    });
  };

  const handleSubLocationChange = (subLocation: string) => {
    onChange({
      ...value,
      subLocation,
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange({
      ...value,
      notes,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Injection Site *
        </label>

        {/* Location Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {locationOptions.map((location) => (
            <button
              key={location.value}
              type="button"
              onClick={() => handleLocationChange(location)}
              className={`p-3 rounded-button border-2 transition-all ${
                selectedLocation.value === location.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray/30 bg-dark hover:border-gray/50 text-white'
              }`}
            >
              <div className="text-center">
                <div className="text-xl mb-1">{location.icon}</div>
                <div className="font-medium text-sm">{location.label}</div>
                <div className="text-xs text-gray/70 mt-1">{location.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Side Selection */}
        <div className="mb-4">
          <label className="block text-gray text-small mb-2">Side</label>
          <div className="flex gap-2">
            {selectedLocation.sides.map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => handleSideChange(side)}
                className={`px-3 py-1 rounded-button text-sm font-medium transition-colors ${
                  value.side === side
                    ? 'bg-primary text-dark'
                    : 'bg-dark border border-gray/30 text-white hover:border-gray/50'
                }`}
              >
                {side.charAt(0).toUpperCase() + side.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-location Selection */}
        {selectedLocation.subLocations.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray text-small mb-2">Specific Area</label>
            <select
              value={value.subLocation || ''}
              onChange={(e) => handleSubLocationChange(e.target.value)}
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white focus:outline-none focus:border-primary"
            >
              <option value="">Select area (optional)</option>
              {selectedLocation.subLocations.map((subLocation) => (
                <option key={subLocation} value={subLocation}>
                  {subLocation}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom location input for "other" */}
        {selectedLocation.value === 'other' && (
          <div className="mb-4">
            <label className="block text-gray text-small mb-2">Custom Location</label>
            <input
              type="text"
              value={value.subLocation || ''}
              onChange={(e) => handleSubLocationChange(e.target.value)}
              placeholder="Specify injection location"
              className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Site-specific Notes */}
        <div>
          <label className="block text-gray text-small mb-2">Site Notes (Optional)</label>
          <input
            type="text"
            value={value.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Rotation notes, reactions, etc."
            className="w-full px-3 py-2 bg-dark border border-gray/30 rounded-button text-white placeholder:text-gray/50 focus:outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="text-red-400 text-small mt-1">{error}</p>
        )}
      </div>

      {/* Injection Site Rotation Reminder */}
      <div className="bg-dark2/50 p-3 rounded-card border border-gray/20">
        <div className="text-warning text-small font-medium mb-1">💡 Site Rotation Tip</div>
        <div className="text-gray text-xs">
          Rotate injection sites to prevent tissue damage and maintain absorption efficiency.
          Avoid using the same exact spot within 2 weeks.
        </div>
      </div>
    </div>
  );
}