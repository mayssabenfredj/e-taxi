import { Address } from "./addresse";

export interface Subsidiary {
  id: string;
  name: string;
  address?: Address | null;
  employeeCount: number;
  enterpriseId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
