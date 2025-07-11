import { AddressDto } from "@/shareds/types/addresse";

export enum UserStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export interface UserAddressDto {
  id?: string;
  address: AddressDto;
  isDefault?: boolean;
  label?: string;
}

export interface Employee {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string;
  alternativePhone?: string | null;
  enterpriseId?: string;
  subsidiaryId?: string | null;
  managerId?: string | null;
  roles?: string[];
  roleIds?: string[];
  addresses?: UserAddressDto[];
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  accountVerified?: boolean;
  enabled?: boolean;
  subsidiary: any;
  entreprise : any
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  deletedAt?: string | null;
}

export interface CreateEmployee {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  alternativePhone?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  managerId?: string;
  roleIds: string[];
  addressId?: string;
  addresses?: UserAddressDto[];
}
export interface Transport {
  id: string;
  date: string;
  time: string;
  status: string;
  departureAddress: AddressDto;
  arrivalAddress: AddressDto;
  requestId: string;
}

export interface Claim {
  id: string;
  type: "complaint" | "suggestion" | "technical";
  subject: string;
  description: string;
  status: "pending" | "resolved" | "closed";
  createdAt: string;
  response?: string;
}

export interface UpdateEmployee {
  firstName?: string;
  lastName?: string;
  phone?: string; // Changed from phoneNumber to match CreateUserDto
  enterpriseId?: string;
  subsidiaryId?: string;
  roleIds?: string[]; // Changed from roles to roleIds to match CreateUserDto
}

export interface GetEmployeesQuery {
  searchTerm?: string;
  enterprise?: string;
  subsidiary?: string;
  role?: string;
  status?: boolean;
}

export interface GetEmployeesPagination {
  skip?: number;
  take?: number;
  enterpriseId?: string;
  subsidiaryId?: string;
  roleName?: string;
  includeAllData?: boolean;
}

export interface CreateMultipleUsersDto {
  users: CreateEmployee[];
  continueOnError: boolean;
}
