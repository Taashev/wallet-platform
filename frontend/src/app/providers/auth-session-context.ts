import { createContext } from 'react';
import type { AuthSessionStore } from '@/entities/auth/model/auth-session-store';

export const AuthSessionContext = createContext<AuthSessionStore | null>(null);
