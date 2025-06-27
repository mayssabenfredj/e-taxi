import { Employee as BaseEmployee, AddressDto } from "@/types/employee";
import { Subsidiary } from "./subsidiary";

export enum TransportType {
  IMMEDIATE = "IMMEDIATE",
  SCHEDULED = "SCHEDULED",
  RECURRING = "RECURRING",
}

export enum RequestPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TransportStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DISPATCHED = "DISPATCHED",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}
export enum TransportDirection {
  HOMETOOFFICE = "HOMETOOFFICE",
  OFFICETOHOME = "OFFICETOHOME",
}

export enum AddressType {
  HOME = "HOME",
  OFFICE = "OFFICE",
  CUSTOM = "CUSTOM",
}

export interface EmployeeTransportDto {
  employeeId: string;
  note?: string;
  startTime: string;
  estimatedArrival?: string;
  departureId?: string;
  arrivalId?: string;
  departureAddress?: AddressDto;
  arrivalAddress?: AddressDto;
  employee?: any;
  departure?: any;
  arrival?: any;
}

export interface CreateTransportRequestDto {
  reference?: string;
  type?: TransportType;
  priority?: RequestPriority;
  note?: string;
  scheduledDate?: string;
  Direction?: string;
  requestedById?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  employeeTransports: EmployeeTransportDto[];
}

export interface GetTransportRequestsQueryDto {
  page?: number;
  limit?: number;
  status?: TransportStatus;
  type?: TransportType;
  priority?: RequestPriority;
  enterpriseId?: string;
  subsidiaryId?: string;
}

export interface EnterpriseDto {
  id: string;
  name: string;
  phone?: string;
  address?: AddressDto;
}

export interface RequestedByDto {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface TransportRequestResponse {
  id: string;
  reference?: string;
  type?: TransportType;
  priority?: RequestPriority;
  status?: TransportStatus;
  note?: string;
  direction?: TransportDirection;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  requestedById?: string;
  requestedBy?: RequestedByDto;
  enterpriseId?: string;
  enterprise?: EnterpriseDto;
  subsidiary?: Subsidiary;
  subsidiaryId?: string;
  employeeTransports: EmployeeTransportDto[];
  passengerCount?: number;
  departureLocation?: string;
  arrivalLocation?: string;
}

// Types specific to the frontend UI
export interface TransportRequest {
  id: string;
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  note?: string;
}

export interface TransportHistory {
  id: string;
  requestId: string;
  reference: string;
  type: "group" | "individual";
  requestedBy: string;
  passengerCount: number;
  departureLocation: string;
  arrivalLocation: string;
  scheduledDate: string;
  completedDate: string;
  status: "completed" | "cancelled";
  taxiCount: number;
  courses: {
    id: string;
    taxiNumber: string;
    driver: {
      name: string;
      rating: number;
      vehicle: string;
    };
    passengers: string[];
    cost: number;
    duration: string;
    distance: string;
  }[];
  totalCost: number;
  note?: string;
}

export interface DuplicateSchedule {
  date: Date;
  time: string;
}

export interface Employee extends BaseEmployee {
  subsidiaryName?: string; // Derived from subsidiary.name
}

export interface SelectedPassenger extends Employee {
  departureAddress?: string;
  arrivalAddress?: string;
  departureAddressId?: string; // ID of the departure address from UserAddressDto
  arrivalAddressId?: string;
  isHomeToWork: boolean;
  note?: string;
  customAddresses?: AddressDto[];
}

export interface RecurringDateTime {
  date: Date;
  time: string;
}

export interface RouteEstimation {
  distance: string;
  duration: string;
  price: number;
  departureAddress?: string;
  arrivalAddress?: string;
}

export interface GroupRoute {
  totalDistance: string; // en km
  totalDuration: string; // en format "Xh Ymin"
  points: string[]; // Liste des points dans l'ordre (départ, intermédiaires, arrivée)
  origin: string; // Point de départ
  destination: string; // Point d'arrivée
}

export interface DraftData {
  draftId?: string;
  selectedEmployees: string[];
  selectedPassengers: SelectedPassenger[];
  transportType: "public" | "private";
  scheduledDate: string;
  scheduledTime: string;
  isRecurring: boolean;
  recurringDates: RecurringDateTime[];
  note: string;
  isHomeToWorkTrip: boolean;
  lastModified: string;
  isGroupTransport?: boolean;
}

export interface UpdateTransportRequestDto {
  reference?: string;
  Direction?: string;
  type?: string;
  priority?: string;
  note?: string;
  scheduledDate?: string;
  requestedById?: string;
  enterpriseId?: string;
  subsidiaryId?: string;
  employeeTransports?: EmployeeTransportDto[];
}
