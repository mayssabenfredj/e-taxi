import { Address } from "./addresse";

export enum UserStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
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
  roles?: string[]; // Changed from Role[] to string[]
  roleIds?: string[];
  address?: Address | null;
  addresses?: Address[]; // Added to match response
  status?: UserStatus; // Still used for frontend consistency
  emailVerified?: boolean;
  phoneVerified?: boolean;
  accountVerified?: boolean;
  enabled?: boolean; // Added to match response
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
  address?: Omit<
    Address,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "city"
    | "region"
    | "country"
  >;
}

export interface UpdateEmployee {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  roles?: string[]; // Maps to role names in UpdateUserDto
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
