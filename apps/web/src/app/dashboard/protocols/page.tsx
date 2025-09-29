'use client';

import { useState } from 'react';
import { ProtocolList } from '@/components/protocols/ProtocolList';
import { ProtocolForm } from '@/components/protocols/ProtocolForm';
import type { Protocol } from '@/types/database';

export default function ProtocolsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

  const handleCreateNew = () => {
    setEditingProtocol(null);
    setShowForm(true);
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProtocol(null);
  };

  if (showForm) {
    return (
      <ProtocolForm
        mode={editingProtocol ? 'edit' : 'create'}
        protocol={editingProtocol || undefined}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <ProtocolList
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
    />
  );
}