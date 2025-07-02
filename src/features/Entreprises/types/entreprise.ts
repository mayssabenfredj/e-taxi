import { Address, AddressDto, AddressType } from "@/shareds/types/addresse";

// Types derived from CreateEnterpriseDto and EntityStatus
export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}

export interface CreateEnterpriseDto {
  titre: string;
  mobile?: string;
  phone?: string;
  email: string;
  secteurActivite?: string;
  matriculeFiscal?: string;
  status?: EntityStatus;
  logoUrl?: string;
  address?: AddressDto;
  website?: string;
}
export interface SignUpEntrepriseDto {
  titre: string;
  phone?: string;
  email: string;
}

// Assuming UpdateEnterpriseDto has similar fields but all optional
export interface UpdateEnterpriseDto {
  titre?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  secteurActivite?: string;
  matriculeFiscal?: string;
  status?: EntityStatus;
  logoUrl?: string;
  address?: AddressDto;
  website?: string;
}

export interface EnterpriseResponse {
  success: boolean;
  data?: any;
  meta?: any;
  error?: string;
  code?: string;
}

export interface Enterprise {
  id: string;
  name: string;
  legalName?: string | null;
  logoUrl?: string | null;
  addressId?: string | null;
  mobile?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  industry: string;
  taxId: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  adminId: string;
  subsidiaries?: any[];
  address?: Address | null;
  admin: {
    id: string;
    email: string;
    passwordHash: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    accountVerified: boolean;
    enabled: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: string;
    updatedAt: string;
    passwordUpdatedAt: string;
    lastLoginAt?: string | null;
    lastLogoutAt?: string | null;
    failedLoginAttempts: number;
    lockedUntil?: string | null;
    deletedAt?: string | null;
    phone: string;
    alternativePhone?: string | null;
    otpCode: string;
    otpExpires?: string | null;
    otpAttempts: number;
    language?: string | null;
    timezone?: string | null;
    profileImageUrl?: string | null;
    addressId?: string | null;
    enterpriseId?: string | null;
    subsidiaryId?: string | null;
    managerId?: string | null;
    structureId?: string | null;
  };
}
