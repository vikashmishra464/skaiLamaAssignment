'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { userApi, User } from '@/lib/api';
import { toast } from 'sonner';

export function ProfileManager() {
  const [newProfileName, setNewProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { profiles, addProfile, setProfiles } = useStore();

  // Load users from API on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
        // Update store with API data
        const apiProfiles = response.data.map(user => ({
          id: user._id,
          name: user.profile_name
        }));
        setProfiles(apiProfiles);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load user profiles');
    }
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;

    setIsLoading(true);
    try {
      const response = await userApi.create({ profile_name: newProfileName.trim() });
      if (response.success && response.data) {
        // Add to local state
        setUsers(prev => [...prev, response.data!]);
        // Add to store
        addProfile(newProfileName.trim());
        setNewProfileName('');
        toast.success('Profile created successfully');
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('userCreated', { 
          detail: response.data 
        }));
      }
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Profiles</CardTitle>
        <CardDescription>Create user profiles for event assignment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter profile name..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddProfile()}
            disabled={isLoading}
          />
          <Button onClick={handleAddProfile} size="icon" disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Existing Profiles ({users.length}):</p>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No profiles created yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-lg bg-secondary px-3 py-2 text-sm"
                >
                  {user.profile_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
