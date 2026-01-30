'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TIMEZONES, validateDateRange } from '@/lib/timezone-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventApi, userApi, User } from '@/lib/api';
import { useUsers } from '@/hooks/use-users';
import { toast } from 'sonner';

export function EventForm() {
  const { profiles, addEvent, currentUserId, setCurrentUserId } = useStore();
  const { users, isLoading: usersLoading, loadUsers } = useUsers();
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [timezone, setTimezone] = useState('America/New_York');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set first user as current user if none selected
  useEffect(() => {
    if (!currentUserId && users.length > 0) {
      setCurrentUserId(users[0]._id);
    }
  }, [users, currentUserId, setCurrentUserId]);

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSubmit = async () => {
    setError('');

    if (selectedProfiles.length === 0) {
      setError('At least one profile must be selected');
      return;
    }

    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    if (!currentUserId) {
      setError('Please select a creator profile');
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
      const response = await eventApi.create({
        assignedProfiles: selectedProfiles,
        eventTimezone: timezone,
        startDateTime,
        endDateTime,
        createdBy: currentUserId,
      });

      if (response.success) {
        toast.success('Event created successfully');
        // Reset form
        setSelectedProfiles([]);
        setTimezone('America/New_York');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('09:00');
        setError('');
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('eventCreated', { 
          detail: response.data 
        }));
      }
    } catch (error: any) {
      console.error('Failed to create event:', error);
      setError(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
        <CardDescription>Create and manage events across multiple timezones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="creator">Creator Profile</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Select value={currentUserId || ''} onValueChange={setCurrentUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select creator profile" />
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
          <div className="flex items-center justify-between">
            <Label>Assigned Profiles</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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
          <Label htmlFor="timezone">Event Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone} disabled={isLoading}>
            <SelectTrigger id="timezone">
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
            <Label htmlFor="start-date">Start Date & Time</Label>
            <input
              id="start-date"
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
            <Label htmlFor="end-date">End Date & Time</Label>
            <input
              id="end-date"
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

        <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Event'}
        </Button>
      </CardContent>
    </Card>
  );
}
