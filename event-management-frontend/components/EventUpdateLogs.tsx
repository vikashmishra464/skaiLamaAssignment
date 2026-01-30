'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatEventTime } from '@/lib/timezone-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { eventApi, userApi, EventLog } from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface EventUpdateLogsProps {
  eventId: string;
  currentUserTimezone: string;
}

export function EventUpdateLogs({ eventId, currentUserTimezone }: EventUpdateLogsProps) {
  const { currentUserId } = useStore();
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Load logs when component mounts, eventId changes, or currentUserId changes
  useEffect(() => {
    // Reset state first to avoid showing stale data
    setLogs([]);
    setCurrentUserName('');
    setIsLoading(false);
    
    if (currentUserId) {
      loadEventLogs();
    }
  }, [eventId, currentUserId]);

  // Listen for event update events to refresh logs
  useEffect(() => {
    const handleEventUpdated = () => {
      if (currentUserId) {
        loadEventLogs();
      }
    };

    window.addEventListener('eventUpdated', handleEventUpdated);
    
    return () => {
      window.removeEventListener('eventUpdated', handleEventUpdated);
    };
  }, [currentUserId]);

  const loadEventLogs = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const response = await eventApi.getLogs(eventId, currentUserId);
      if (response.success && response.data) {
        setLogs(response.data);
      }
      
      // Also get current user name for display
      const usersResponse = await userApi.getAll();
      if (usersResponse.success && usersResponse.data) {
        const currentUser = usersResponse.data.find(u => u._id === currentUserId);
        setCurrentUserName(currentUser?.profile_name || 'Unknown User');
      }
    } catch (error) {
      console.error('Failed to load event logs:', error);
      toast.error('Failed to load update history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadEventLogs();
  };

  if (!currentUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Update History</CardTitle>
          <CardDescription>Please select a user profile to view update history</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (logs.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Update History</CardTitle>
            <CardDescription>No updates yet</CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const formatValue = (field: string, value: any) => {
    if (typeof value === 'string' && field.includes('DateTime')) {
      return formatEventTime(value, currentUserTimezone);
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} profiles` : 'No profiles';
    }
    return String(value);
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'assignedProfiles':
        return 'Assigned Profiles';
      case 'eventTimezone':
        return 'Event Timezone';
      case 'startDateTime':
        return 'Start Date & Time';
      case 'endDateTime':
        return 'End Date & Time';
      default:
        return field;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Update History</CardTitle>
          <CardDescription>
            All changes made to this event ({logs.length} updates)
            {currentUserName && (
              <span className="block text-xs mt-1">
                Viewing as: {currentUserName}
              </span>
            )}
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading update history...</p>
        ) : (
          logs.map((log: EventLog) => (
            <div
              key={log._id}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Update</Badge>
                  <span className="text-xs text-muted-foreground">
                    by {log.changedBy.profile_name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatEventTime(log.timestamp, currentUserTimezone)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {Object.keys(log.previousValues).map((field) => {
                  const oldValue = log.previousValues[field];
                  const newValue = log.updatedValues[field];
                  
                  // Skip if values are the same
                  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
                    return null;
                  }
                  
                  return (
                    <div key={field} className="space-y-1">
                      <p className="font-medium">{getFieldLabel(field)}:</p>
                      <p className="ml-2">
                        <span className="text-red-600">- {formatValue(field, oldValue)}</span>
                      </p>
                      <p className="ml-2">
                        <span className="text-green-600">+ {formatValue(field, newValue)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
