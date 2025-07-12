export type RootStackParamList = {
  Login: undefined;
  Register: { userType: 'tenant' | 'agent' };
  UserType: undefined;
  AgentHome: undefined;
  TenantHome: undefined;
  MyListings: undefined;
  Inquiries: undefined;
  Search: undefined;
  Preview: undefined;
  PropertyDetails: { propertyId: string };
  AddProperty: { listingId?: string; additionalData?: { id: string } }; 
  EditProfile: undefined; // or specify params if any
  ChangePassword: undefined;
  Notifications: undefined; // Add this line if not present
}; 