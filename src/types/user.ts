import { Enterprise } from "./entreprise";
import { Role } from "./role";
import { Subsidiary } from "./subsidiary";

export interface LoginResponse {
  success: boolean;
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    lastLoginAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  enterpriseId?: string | null;
  subsidiaryId?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface Address {
  id?: string; // Added for backend-assigned ID
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface UserDetail {
  id: string; // Backend-assigned UUID
  email: string;
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
  roles: Array<{
    id: string;
    userId: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    role: Role;
  }>;
  enterprise?: Enterprise | null;
  subsidiary?: Subsidiary[] | null; // Subsidiary type can be defined if structure is known
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  alternativePhone?: string;
  addressId?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  managerId?: string;
  roleIds: string[];
  address?: Address;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  // Password is optional for updates
  password?: string;
}