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
  errorBoundary: undefined; // Add this line for error boundary
  Home: undefined; // Add this line for home screen if needed
  Filter: undefined; // Add this line for filter screen if needed

}; 