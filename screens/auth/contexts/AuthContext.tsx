import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthContextType = {
  isVerified: boolean;
  email: string | null;
  token: string | null;
  logout: () => void;
  setAuthState: (state: {
    isVerified: boolean;
    token: string | null;
    email: string | null;
  }) => void;
};

// 💡 Initial default context
export const AuthContext = createContext<AuthContextType>({
  isVerified: false,
  email: null,
  token: null,
  logout: () => {},
  setAuthState: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // 🧠 Load from AsyncStorage on first mount
  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedEmail = await AsyncStorage.getItem('authEmail');
      const verified = await AsyncStorage.getItem('isVerified');

      setIsVerified(verified === 'true');
      setToken(storedToken);
      setEmail(storedEmail);
    };

    loadAuth();
  }, []);

  // ✅ Set Auth State and persist
  const setAuthState = async ({
    isVerified,
    token,
    email,
  }: {
    isVerified: boolean;
    token: string | null;
    email: string | null;
  }) => {
    setIsVerified(isVerified);
    setToken(token);
    setEmail(email);

    await AsyncStorage.setItem('isVerified', isVerified ? 'true' : 'false');
    if (token) await AsyncStorage.setItem('authToken', token);
    if (email) await AsyncStorage.setItem('authEmail', email);
  };

  // 🚪 Logout
  const logout = async () => {
    setIsVerified(false);
    setToken(null);
    setEmail(null);

    await AsyncStorage.multiRemove(['authToken', 'isVerified', 'authEmail']);
  };

  return (
    <AuthContext.Provider
      value={{
        isVerified,
        email,
        token,
        logout,
        setAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};