import { useState, useEffect, useCallback } from 'react';
import { userApi, User } from '@/lib/api';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load user profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = useCallback((newUser: User) => {
    setUsers(prev => {
      // Check if user already exists to avoid duplicates
      const exists = prev.some(user => user._id === newUser._id);
      if (!exists) {
        return [...prev, newUser];
      }
      return prev;
    });
  }, []);

  // Load users on hook initialization
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Listen for user creation events
  useEffect(() => {
    const handleUserCreated = (event: CustomEvent) => {
      const newUser = event.detail;
      addUser(newUser);
    };

    window.addEventListener('userCreated', handleUserCreated as EventListener);
    
    return () => {
      window.removeEventListener('userCreated', handleUserCreated as EventListener);
    };
  }, [addUser]);

  return {
    users,
    isLoading,
    loadUsers,
    addUser
  };
}