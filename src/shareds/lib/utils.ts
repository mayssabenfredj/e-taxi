import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Vérifie si l'utilisateur possède une permission donnée via ses rôles.
 * @param user UserDetail (depuis AuthContext)
 * @param permissionAction string (ex: 'users:read')
 * @returns boolean
 */
export function hasPermission(user: any, permissionAction: string): boolean {
  if (!user || !user.roles) return false;
  // Agréger toutes les permissions de tous les rôles
  const allPermissions = user.roles
    .map((ur: any) => ur.role?.permissions || [])
    .flat();
 
  return allPermissions.includes(permissionAction);
}
