import { useSyncExternalStore } from 'react';
import type { CurrentUserProfile } from '@/entities/user/model/user';

type CurrentProfileStoreListener = () => void;

type CurrentProfileStore = {
  getSnapshot: () => CurrentUserProfile | null;
  saveProfile: (profile: CurrentUserProfile) => void;
  clearProfile: () => void;
  subscribe: (listener: CurrentProfileStoreListener) => () => void;
};

function createCurrentProfileStore(): CurrentProfileStore {
  let profile: CurrentUserProfile | null = null;
  const listeners = new Set<CurrentProfileStoreListener>();

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot() {
      return profile;
    },
    saveProfile(nextProfile) {
      profile = nextProfile;
      emitChange();
    },
    clearProfile() {
      if (!profile) {
        return;
      }

      profile = null;
      emitChange();
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const currentProfileStore = createCurrentProfileStore();

export function useCurrentProfile() {
  return useSyncExternalStore(
    currentProfileStore.subscribe,
    currentProfileStore.getSnapshot,
    currentProfileStore.getSnapshot,
  );
}

export function saveCurrentProfile(profile: CurrentUserProfile) {
  currentProfileStore.saveProfile(profile);
}

export function clearCurrentProfile() {
  currentProfileStore.clearProfile();
}
