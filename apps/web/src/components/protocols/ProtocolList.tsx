'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Edit, Trash2, Play, Pause, Target, Calendar, Clock } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import type { Protocol, Peptide } from '@/types/database';

interface ProtocolListProps {
  onCreateNew?: () => void;
  onEdit?: (protocol: Protocol) => void;
}

interface ProtocolWithPeptide extends Protocol {
  peptide: Peptide;
}

export function ProtocolList({ onCreateNew, onEdit }: ProtocolListProps) {
  const { user } = useUser();
  const [protocols, setProtocols] = useState<ProtocolWithPeptide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadProtocols = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const protocolsData = await DatabaseService.getProtocols(user.id, {
        includeInactive: filter !== 'active'
      });

      // Get peptides for each protocol
      const protocolsWithPeptides = await Promise.all(
        protocolsData.map(async (protocol) => {
          const peptide = await DatabaseService.getPeptide(protocol.peptideId);
          return peptide ? { ...protocol, peptide } : null;
        })
      );

      setProtocols(protocolsWithPeptides.filter((p): p is ProtocolWithPeptide => p !== null));
    } catch (error) {
      console.error('Error loading protocols:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProtocols();
  }, [user, filter]);

  const handleToggleActive = async (protocol: Protocol) => {
    try {
      await DatabaseService.updateProtocol(protocol.id, {
        isActive: !protocol.isActive
      });
      loadProtocols();
    } catch (error) {
      console.error('Error toggling protocol status:', error);
      alert('Failed to update protocol status');
    }
  };

  const handleDelete = async (protocol: Protocol) => {
    if (!confirm(`Are you sure you want to delete "${protocol.name}"?`)) {
      return;
    }

    try {
      await DatabaseService.deleteProtocol(protocol.id);
      loadProtocols();
    } catch (error) {
      console.error('Error deleting protocol:', error);
      alert('Failed to delete protocol');
    }
  };

  const formatSchedule = (protocol: Protocol) => {
    switch (protocol.scheduleType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'every_other_day':
        return 'Every other day';
      case 'custom':
        if (protocol.scheduleConfig.days) {
          const days = protocol.scheduleConfig.days.map(day =>
            day.charAt(0).toUpperCase() + day.slice(1, 3)
          ).join(', ');
          return `Custom: ${days}`;
        }
        return 'Custom schedule';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (protocol: Protocol) => {
    const isActive = protocol.isActive;
    const isExpired = protocol.endDate && new Date(protocol.endDate) < new Date();

    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Inactive</span>;
    }

    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Expired</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Active</span>;
  };

  const filteredProtocols = protocols.filter(protocol => {
    if (filter === 'active') return protocol.isActive;
    if (filter === 'inactive') return !protocol.isActive;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protocols</h1>
          <p className="text-gray-600">Manage your dose target protocols</p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Protocol
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Protocols' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Protocols List */}
      {filteredProtocols.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No protocols found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? 'Get started by creating your first protocol.'
              : `No ${filter} protocols found.`
            }
          </p>
          {onCreateNew && filter === 'all' && (
            <div className="mt-6">
              <button
                onClick={onCreateNew}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Protocol
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map(protocol => (
            <div
              key={protocol.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {protocol.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {protocol.peptide.name}
                  </p>
                </div>
                {getStatusBadge(protocol)}
              </div>

              {/* Dose Targets */}
              <div className="space-y-2 mb-4">
                {protocol.weeklyTarget && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    Weekly: {protocol.weeklyTarget} {protocol.peptide.typicalDoseRange.unit}
                  </div>
                )}
                {protocol.dailyTarget && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    Daily: {protocol.dailyTarget} {protocol.peptide.typicalDoseRange.unit}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatSchedule(protocol)}
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(protocol.startDate).toLocaleDateString()}
                {protocol.endDate && (
                  <> - {new Date(protocol.endDate).toLocaleDateString()}</>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleActive(protocol)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                    protocol.isActive
                      ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  {protocol.isActive ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Activate
                    </>
                  )}
                </button>

                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(protocol)}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                      title="Edit protocol"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(protocol)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Delete protocol"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}