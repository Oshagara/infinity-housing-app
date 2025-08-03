const API_URL = 'https://infinity-housing.onrender.com';

interface LoginResponse {
  user: any;
  role: 'tenant' | 'landlord';
  token: string;
  data: any;
}

export const register = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'tenant' | 'landlord';
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

// Enhanced login function with better role detection
export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    console.log('🔍 Starting login process...');
    
    // Step 1: Initial login request
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log('🔍 Login response status:', response.status);
    console.log('🔍 Raw login data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Step 2: Extract basic user data and token
    const user = data.user || data.landlord || data.tenant || data;
    const token = data.access_token || data.token;

    if (!user || !token) {
      throw new Error('Invalid login response - missing user data or token');
    }

    console.log('🔍 Extracted user data:', JSON.stringify(user, null, 2));
    console.log('🔍 User ID:', user?.id || user?.userId || user?._id);
    console.log('🔍 User email:', user?.email);
    console.log('🔍 User name:', user?.name || user?.fullName);

    // Step 3: Comprehensive role verification
    let verifiedRole: 'tenant' | 'landlord';
    
    // First, check if role is directly available in login response
    const loginRole = user?.role || data?.role;
    if (loginRole === 'landlord' || loginRole === 'tenant') {
      console.log('✅ Role found in login response:', loginRole);
      verifiedRole = loginRole;
    } else {
      // Use comprehensive verification
      verifiedRole = await verifyUserRole(token);
    }

    console.log('🔍 Final verified role:', verifiedRole);

    return {
      user,
      role: verifiedRole,
      token,
      data
    };
  } catch (error) {
    // console.error('❌ Login error:', error);
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

// Enhanced role verification with multiple fallback strategies
export const verifyUserRole = async (token: string): Promise<'tenant' | 'landlord'> => {
  try {
    console.log('🔍 Starting comprehensive user role verification...');
    
    // Strategy 1: Check user profile endpoint
    try {
      console.log('🔍 Strategy 1: Checking user profile...');
      const profileResponse = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('🔍 Profile data:', JSON.stringify(profileData, null, 2));
        
        const role = profileData?.role;
        if (role === 'landlord' || role === 'tenant') {
          console.log('✅ Role verified from profile:', role);
          return role;
        }
      }
    } catch (error) {
      console.log('⚠️ Profile verification failed:', error);
    }

    // Strategy 2: Check landlord-specific endpoint
    try {
      console.log('🔍 Strategy 2: Testing landlord access...');
      const landlordResponse = await fetch(`${API_URL}/landlord/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (landlordResponse.ok) {
        console.log('✅ User has landlord access - verified as landlord');
        return 'landlord';
      }
    } catch (error) {
      console.log('⚠️ Landlord endpoint test failed:', error);
    }

    // Strategy 3: Check tenant-specific endpoint
    try {
      console.log('🔍 Strategy 3: Testing tenant access...');
      const tenantResponse = await fetch(`${API_URL}/tenant/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (tenantResponse.ok) {
        console.log('✅ User has tenant access - verified as tenant');
        return 'tenant';
      }
    } catch (error) {
      console.log('⚠️ Tenant endpoint test failed:', error);
    }

    // Strategy 4: Check user properties endpoint
    try {
      console.log('🔍 Strategy 4: Checking user properties...');
      const propertiesResponse = await fetch(`${API_URL}/landlord/properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (propertiesResponse.ok) {
        console.log('✅ User has landlord properties - verified as landlord');
        return 'landlord';
      }
    } catch (error) {
      console.log('⚠️ Properties endpoint test failed:', error);
    }

    // Strategy 5: Check user data structure from login response
    console.log('🔍 Strategy 5: Analyzing user data structure...');
    // This will be handled in the login function by checking the user object

    // Final fallback
    console.log('⚠️ All verification strategies failed - defaulting to tenant');
    return 'tenant';
    
  } catch (error) {
    console.error('❌ Critical error in role verification:', error);
    return 'tenant'; // Safe fallback
  }
};
