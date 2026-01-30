'use client';

import { useState, useEffect } from 'react';
import { ProfileManager } from '@/components/ProfileManager';
import { EventForm } from '@/components/EventForm';
import { EventList } from '@/components/EventList';
import { EventEditor } from '@/components/EventEditor';
import { EventUpdateLogs } from '@/components/EventUpdateLogs';
import { useStore } from '@/lib/store';

export default function Home() {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentUserTimezone, currentUserId } = useStore();

  const handleEventUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Close edit dialog when user changes
  useEffect(() => {
    if (editingEventId) {
      setEditingEventId(null);
    }
  }, [currentUserId]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Event Management</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Create and manage events across multiple timezones
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Admin Controls */}
          <div className="space-y-8">
            <ProfileManager />
            <EventForm key={refreshTrigger} />
          </div>

          {/* Right Column - User View */}
          <div className="space-y-8">
            <EventList onEditEvent={setEditingEventId} key={refreshTrigger} />
            {editingEventId && (
              <EventEditor
                key={`${editingEventId}-${currentUserId}`}
                eventId={editingEventId}
                onClose={() => setEditingEventId(null)}
                onEventUpdated={handleEventUpdated}
              />
            )}
            {editingEventId && (
              <EventUpdateLogs
                key={`${editingEventId}-${currentUserId}`}
                eventId={editingEventId}
                currentUserTimezone={currentUserTimezone}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
