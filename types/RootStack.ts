export type RootStackParamList = {
  Login: undefined;
  Register: { userType: 'tenant' | 'agent' };
  UserType: undefined;
  AgentHome: undefined;
  TenantHome: undefined;
  AddProperty: { listingId?: string };
  MyListings: undefined;
  Inquiries: undefined;
  Search: undefined;
  Preview: undefined;
  PropertyDetails: { propertyId: string };
}; 