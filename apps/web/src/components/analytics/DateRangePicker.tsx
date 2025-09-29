'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(
    startDate ? startDate.toISOString().split('T')[0] : ''
  );
  const [tempEndDate, setTempEndDate] = useState(
    endDate ? endDate.toISOString().split('T')[0] : ''
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      end.setHours(23, 59, 59, 999); // End of day

      if (start <= end) {
        onDateRangeChange(start, end);
        setIsOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return 'Custom Range';
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-dark2 text-white px-4 py-2 rounded-lg border border-gray/20 hover:bg-gray/10 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{formatDateRange()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-dark2 border border-gray/20 rounded-lg shadow-lg z-50 p-4 w-80">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray mb-1">Start Date</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                max={getMaxDate()}
                className="w-full bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray mb-1">End Date</label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                max={getMaxDate()}
                min={tempStartDate}
                className="w-full bg-gray/20 border border-gray/30 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate}
                className="flex-1 bg-primary text-dark px-4 py-2 rounded-lg text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div className="border-t border-gray/20 mt-4 pt-4">
            <div className="text-xs text-gray mb-2">Quick Select:</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Last 7d', days: 7 },
                { label: 'Last 30d', days: 30 },
                { label: 'Last 90d', days: 90 }
              ].map(({ label, days }) => (
                <button
                  key={days}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(end.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray/20 text-gray hover:bg-primary/20 hover:text-primary rounded transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}