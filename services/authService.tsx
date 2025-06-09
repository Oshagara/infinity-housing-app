import axios from 'axios';

const BASE_URL = 'https://infinity-housing.onrender.com';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'agent' | 'tenant';
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<boolean> => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, data);
    return res.status === 200 || res.status === 201;
  } catch (err) {
    console.error('Register error:', (err as any).response?.data || err);
    return false;
  }
};

export const login = async (data: LoginData, isAgent = true): Promise<any | null> => {
  const endpoint = isAgent ? '/auth/login' : '/tenants/login';
  try {
    const res = await axios.post(`${BASE_URL}${endpoint}`, data);
    return res.data;
  } catch (err) {
    console.error('Login error:', (err as any).response?.data || err);
    return null;
  }
};
