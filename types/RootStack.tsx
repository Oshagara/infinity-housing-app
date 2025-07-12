export type RootStackParamList = {
  Preview: undefined;
  UserType: undefined;
  Register: { userType: 'tenant' | 'agent' };
  Login: undefined;
  Home: undefined;
  AddProperty: { listingId?: string; additionalData?: { id: string } };
  EditProfile: undefined; // or specify params if any
  notifications: undefined; // Add this line if not present
  // ... other screens
}; 