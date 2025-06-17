import { Address } from "./addresse";
import { Role } from "./role";

export enum UserStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export interface Employee {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  alternativePhone?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  managerId?: string;
  roles?: Role[];
  roleIds?: string[];
  address?: Address | null;
  status?: UserStatus;
  createdAt: string;
  updatedAt?: string;
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
