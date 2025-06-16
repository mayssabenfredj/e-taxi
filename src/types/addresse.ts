export enum AddressType {
  HOME = "HOME",
  OFFICE = "OFFICE",
  CUSTOM = "CUSTOM",
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  countryId: string;
}

export interface City {
  id: string;
  name: string;
  postalCode: string;
  regionId: string;
}

export interface Address {
  id: string;
  label?: string | null;
  street?: string | null;
  buildingNumber?: string | null;
  complement?: string | null;
  postalCode?: string | null;
  cityId?: string | null;
  regionId?: string | null;
  countryId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  formattedAddress?: string | null;
  isVerified?: boolean;
  isExact?: boolean;
  manuallyEntered?: boolean;
  addressType?: AddressType;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  city?: City | null;
  region?: Region | null;
  country?: Country | null;
}
