export type ListingType = 'For Sale' | 'For Rent';
export type PropertyType = 'Duplex' | 'Apartment' | 'House' | 'Land' | 'Commercial';
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';
export type Furnishing = 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
export type Availability = 'Immediate' | 'Future' | 'Under Construction';
export type PaymentPlan = 'Outright' | 'Installment' | 'Rent to Own';
export type Ownership = 'Freehold' | 'Leasehold';
export type PetPolicy = 'Allowed' | 'Not Allowed' | 'Case by Case';
export type TargetTenant = 'Family' | 'Single' | 'Couple' | 'Students' | 'Corporate';
export type StatusType = 'active' | 'pending' | 'inactive';
export type StatusFilter = 'all' | StatusType;
export type SortOption = 'price-asc' | 'price-desc' | 'views-desc' | 'inquiries-desc';


export interface Coordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  area: string;
  city: string;
  state: string;
  lga: string;
  country: string;
  coordinates: Coordinates;
}

export interface Area {
  value: number;
  unit: 'sqm' | 'sqft';
}

export interface LocationAdvantage {
  name: string;
  type: string;
  distance: string;
}

export interface FinancialDetails {
  maintenanceFee: number;
  agencyFee: string;
  paymentPlan: PaymentPlan[];
}

export interface LegalStatus {
  ownership: Ownership;
  cOfO: boolean;
  governorConsent: boolean;
}

export interface AdditionalInfo {
  petPolicy: PetPolicy;
  targetTenant: TargetTenant;
  proximityToRoad: string;
}

export interface PropertyFeatures {
  interior: string[];
  exterior: string[];
  security: string[];
  amenities: string[];
}

export interface Property {
  id: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  currency: Currency;
  isNegotiable: boolean;
  address: Address;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  area: Area;
  plotSize: Area;
  yearBuilt: number;
  floors: number;
  furnishing: Furnishing;
  flooring: string[];
  availability: Availability;
  videos: string[];
  floorPlan: string;
  features: PropertyFeatures;
  locationAdvantages: LocationAdvantage[];
  financialDetails: FinancialDetails;
  legalStatus: LegalStatus;
  additionalInfo: AdditionalInfo;
  createdAt: string;
  updatedAt: string;
  landlordId: string;
  status: 'active' | 'pending' | 'sold' | 'rented';
  views: number;
  inquiries: number;
  images: string[];
}

export interface PropertyFilters {
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  location?: {
    city?: string;
    area?: string;
    state?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  availability?: Availability;
  features?: {
    interior?: string[];
    exterior?: string[];
    security?: string[];
    amenities?: string[];
  };
  paymentPlan?: PaymentPlan[];
  legalStatus?: {
    ownership?: Ownership;
    cOfO?: boolean;
  };
  additionalInfo?: {
    petPolicy?: PetPolicy;
    targetTenant?: TargetTenant;
  };
}

export interface PropertySort {
  field: 'price' | 'area' | 'bedrooms' | 'createdAt' | 'views' | 'inquiries';
  order: 'asc' | 'desc';
}

export interface PropertyMatch {
  propertyId: string;
  matchScore: number;
  reasons: string[];
} 