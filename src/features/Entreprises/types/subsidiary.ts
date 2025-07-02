import { Address } from "@/shareds/types/addresse";


export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}
export interface SubsidiaryQueryParams {
  enterpriseId?: string;
  subsidiaryId?: string;
  name?: string;
  status?: EntityStatus;
  include?: boolean;
  skip?: number;
  take?: number;
}
export interface Admin {
  id: string;
  email?: string;
  fullName? :string
  firstName?: string;
  lastName?: string;

}

export interface Subsidiary {
  id: string;
  name: string;
  enterpriseId: string;
  address?: Address | null;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: EntityStatus;
  createdAt: string;
  updatedAt?: string; // Made optional to avoid type errors
  deletedAt?: string | null;
  employeeCount?: number; // Made optional and kept both for compatibility
  employeesCount?: number; // Made optional
  adminIds?: string[];
  admins?: Admin[]; // Added to match API response
  managerIds?: string[]; // Added as optional for component compatibility
  managerNames?: string[]; // Added as optional for component compatibility
}

// For creating a subsidiary, only include fields that match CreateSubsidiaryDto
export interface CreateSubsidiary {
  name: string;
  enterpriseId: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: EntityStatus;
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
  adminIds?: string[];
}

// For updating a subsidiary, only include fields that match UpdateSubsidiaryDto
export interface UpdateSubsidiary {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: EntityStatus;
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
  adminIds?: string[];
}

export interface UpdateStatus {
  status: EntityStatus;
}

export interface Manager {
  id: string;
  name: string;
}

export interface FormData {
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  selectedManagerIds: string[];
  address: Address | null;
  enterpriseId: string;
}