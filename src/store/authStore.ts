import { create } from 'zustand';
import { BskyAgent } from '@atproto/api';
import { sanitizeInput } from '../utils/validation';
import { BlueskyAgentService } from '../services/api/blueskyAgent';
import { ApiError } from '../services/errors/ApiError';

interface AuthState {
  agent: BskyAgent | null;
  isAuthenticated: boolean;
  user: { handle: string; displayName?: string } | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  agent: null,
  isAuthenticated: false,
  user: null,

  // Login function
  login: async (identifier: string, password: string) => {
    const sanitizedIdentifier = sanitizeInput(identifier); // Clean up user input
    const agent = new BskyAgent({ service: 'https://bsky.social' });

    try {
      // Attempt to log in
      await agent.login({ identifier: sanitizedIdentifier, password });
      const profile = await agent.getProfile({ actor: sanitizedIdentifier });

      // Set the agent instance globally for other services
      BlueskyAgentService.setInstance(agent);

      // Update state
      set({
        agent,
        isAuthenticated: true,
        user: {
          handle: profile.data.handle,
          displayName: profile.data.displayName,
        },
      });
    } catch (error) {
      console.error('Login failed:', error);

      // Handle error with cleaner messaging
      if (error instanceof Error) {
        throw new ApiError(
          error.message.includes('Authentication') ? 'Invalid credentials' : error.message,
          401
        );
      }
      throw new ApiError('Login failed', 500);
    }
  },

  // Logout function
  logout: () => {
    BlueskyAgentService.setInstance(null); // Clear agent instance globally
    set({ agent: null, isAuthenticated: false, user: null });
  },
}));
