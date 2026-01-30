'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatEventTime, formatEventDate } from '@/lib/timezone-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TIMEZONES } from '@/lib/timezone-utils';
import { Edit2, RefreshCw } from 'lucide-react';
import { eventApi, userApi, Event as ApiEvent, User } from '@/lib/api';
import { useUsers } from '@/hooks/use-users';
import { toast } from 'sonner';

interface EventListProps {
  onEditEvent: (eventId: string) => void;
}

export function EventList({ onEditEvent }: EventListProps) {
  const {
    currentUserId,
    setCurrentUserId,
    currentUserTimezone,
    setCurrentUserTimezone,
  } = useStore();

  const { users, isLoading: usersLoading, loadUsers } = useUsers();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set first user as current user if none selected and load events when user changes
  useEffect(() => {
    if (!currentUserId && users.length > 0) {
      setCurrentUserId(users[0]._id);
    }
  }, [users, currentUserId, setCurrentUserId]);

  // Load events when current user changes
  useEffect(() => {
    if (currentUserId) {
      loadUserEvents();
    }
  }, [currentUserId]);

  // Listen for event creation/update events
  useEffect(() => {
    const handleEventCreated = () => {
      if (currentUserId) {
        loadUserEvents();
      }
    };

    const handleEventUpdated = () => {
      if (currentUserId) {
        loadUserEvents();
      }
    };

    window.addEventListener('eventCreated', handleEventCreated);
    window.addEventListener('eventUpdated', handleEventUpdated);
    
    return () => {
      window.removeEventListener('eventCreated', handleEventCreated);
      window.removeEventListener('eventUpdated', handleEventUpdated);
    };
  }, [currentUserId]);

  const loadUserEvents = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const response = await eventApi.getByUser(currentUserId);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUserEvents();
  };

  if (!currentUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No profiles available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Events
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>View events in your selected timezone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-select">Select current profile</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading || usersLoading}
            >
              <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Select
            value={currentUserId || ''}
            onValueChange={(value) => setCurrentUserId(value)}
          >
            <SelectTrigger id="profile-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.profile_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone-select">Your timezone</Label>
          <Select value={currentUserTimezone} onValueChange={setCurrentUserTimezone}>
            <SelectTrigger id="timezone-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events found</p>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="rounded-lg border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Event</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatEventDate(event.startDateTime, currentUserTimezone)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditEvent(event._id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1 text-xs">
                  <p>
                    <span className="font-medium">Start:</span>{' '}
                    {formatEventTime(event.startDateTime, currentUserTimezone)}
                  </p>
                  <p>
                    <span className="font-medium">End:</span>{' '}
                    {formatEventTime(event.endDateTime, currentUserTimezone)}
                  </p>
                  <p>
                    <span className="font-medium">Event Timezone:</span> {event.eventTimezone}
                  </p>
                  <p>
                    <span className="font-medium">Assigned to:</span>{' '}
                    {event.assignedProfiles.map(p => p.profile_name).join(', ')}
                  </p>
                  <p>
                    <span className="font-medium">Created by:</span> {event.createdBy.profile_name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
