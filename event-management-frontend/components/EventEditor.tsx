'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TIMEZONES, validateDateRange } from '@/lib/timezone-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventApi, userApi, User, Event as ApiEvent } from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface EventEditorProps {
  eventId: string;
  onClose: () => void;
  onEventUpdated?: () => void;
}

export function EventEditor({ eventId, onClose, onEventUpdated }: EventEditorProps) {
  const { currentUserId, currentUserTimezone } = useStore();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [eventTimezone, setEventTimezone] = useState('America/New_York');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Load event data and users
  useEffect(() => {
    loadEventData();
    loadUsers();
  }, [eventId, currentUserId]); // Added currentUserId dependency

  const loadEventData = async () => {
    try {
      // Get all events and find the one we need
      const response = await eventApi.getAll();
      if (response.success && response.data) {
        const foundEvent = response.data.find(e => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          setSelectedProfiles(foundEvent.assignedProfiles.map(p => p._id));
          setEventTimezone(foundEvent.eventTimezone);
          
          // Check if current user has permission to edit this event
          const isAssigned = foundEvent.assignedProfiles.some(p => p._id === currentUserId);
          const isCreator = foundEvent.createdBy && foundEvent.createdBy._id === currentUserId;
          const isLegacyEvent = !foundEvent.createdBy && foundEvent.assignedProfiles.length === 0;
          
          setHasPermission(isAssigned || isCreator || isLegacyEvent);
          
          // Convert UTC times to local timezone for editing
          const startDateTime = dayjs(foundEvent.startDateTime).tz(currentUserTimezone);
          const endDateTime = dayjs(foundEvent.endDateTime).tz(currentUserTimezone);
          
          setStartDate(startDateTime.format('YYYY-MM-DD'));
          setStartTime(startDateTime.format('HH:mm'));
          setEndDate(endDateTime.format('YYYY-MM-DD'));
          setEndTime(endDateTime.format('HH:mm'));
        }
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      toast.error('Failed to load event data');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
        
        // Set current user name for display
        const currentUser = response.data.find(u => u._id === currentUserId);
        setCurrentUserName(currentUser?.profile_name || 'Unknown User');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSave = async () => {
    setError('');

    if (!currentUserId) {
      setError('Please select a user profile first');
      return;
    }

    if (selectedProfiles.length === 0) {
      setError('At least one profile must be assigned');
      return;
    }

    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    if (!validateDateRange(new Date(startDateTime).toISOString(), new Date(endDateTime).toISOString())) {
      setError('End date/time must be after start date/time');
      return;
    }

    setIsLoading(true);
    try {
      const response = await eventApi.update(eventId, {
        assignedProfiles: selectedProfiles,
        eventTimezone,
        startDateTime,
        endDateTime,
        updatedBy: currentUserId,
      });

      if (response.success) {
        toast.success('Event updated successfully');
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('eventUpdated', { 
          detail: response.data 
        }));
        
        onEventUpdated?.(); // Trigger refresh
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to update event:', error);
      setError(error.message || 'Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading event...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Edit Event</CardTitle>
            <CardDescription>Permission denied</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to edit this event. Only assigned users or the creator can make changes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update event details
            {currentUserName && (
              <span className="block text-xs mt-1">
                Editing as: {currentUserName}
              </span>
            )}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Assigned Profiles</Label>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => handleProfileToggle(user._id)}
                disabled={isLoading}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  selectedProfiles.includes(user._id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {user.profile_name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-timezone">Event Timezone</Label>
          <Select value={eventTimezone} onValueChange={setEventTimezone} disabled={isLoading}>
            <SelectTrigger id="edit-timezone">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start Date & Time</Label>
            <input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-end-date">End Date & Time</Label>
            <input
              id="edit-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
