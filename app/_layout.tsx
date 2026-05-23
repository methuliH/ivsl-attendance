import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Employee } from '../types/api';

SplashScreen.preventAutoHideAsync();

interface AuthContextType {
  token: string | null;
  employee: Employee | null;
  login: (token: string, employee: Employee) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  employee: null,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await SecureStore.getItemAsync('app_token');
        const savedEmployee = await SecureStore.getItemAsync('employee');
        if (savedToken && savedEmployee) {
          setToken(savedToken);
          setEmployee(JSON.parse(savedEmployee));
        }
      } catch {
        // Corrupted storage — stay on login
      } finally {
        setAuthReady(true);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authReady]);

  const login = useCallback(async (newToken: string, newEmployee: Employee) => {
    await SecureStore.setItemAsync('app_token', newToken);
    await SecureStore.setItemAsync('employee', JSON.stringify(newEmployee));
    setToken(newToken);
    setEmployee(newEmployee);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('app_token');
    await SecureStore.deleteItemAsync('employee');
    setToken(null);
    setEmployee(null);
  }, []);

  // Always render the Stack — never return null.
  // SplashScreen keeps the UI hidden while fonts and session load.
  return (
    <AuthContext.Provider value={{ token, employee, login, logout }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContext.Provider>
  );
}
