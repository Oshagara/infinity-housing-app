const API_URL = 'https://infinity-housing.onrender.com';

export const register = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'tenant' | 'agent';
}) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    // Try both roles
    const [agentResponse, tenantResponse] = await Promise.all([
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...credentials, role: 'agent' }),
      }),
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...credentials, role: 'tenant' }),
      }),
    ]);

    const agentData = await agentResponse.json();
    const tenantData = await tenantResponse.json();

    const availableRoles = [];
    if (agentResponse.ok) availableRoles.push('agent');
    if (tenantResponse.ok) availableRoles.push('tenant');

    if (availableRoles.length === 0) {
      throw new Error('Invalid credentials');
    }

    return {
      availableRoles,
      agentData: agentResponse.ok ? agentData : null,
      tenantData: tenantResponse.ok ? tenantData : null,
    };
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
  token: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passwordData.token}`,
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  token: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${profileData.token}`,
      },
      body: JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Profile update failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}; 