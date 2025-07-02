import { useState, useEffect, useMemo } from "react";
import { roleService } from "@/features/employees/services/role.service";
import SubsidiaryService from "@/features/Entreprises/services/subsidiarie.service";
import { toast } from "sonner";
import { Address, AddressDto } from "@/shareds/types/addresse";
import { EntityStatus } from "@/features/Entreprises/types/subsidiary";

export interface Role {
  id: string;
  name: string;
}

export interface Subsidiary {
  id: string;
  name: string;
  address: Address | AddressDto;
}

interface UseRolesAndSubsidiariesResult {
  roles: Role[];
  subsidiaries: Subsidiary[];
  subsidiaryAddresses: (Address | AddressDto)[];
  loading: boolean;
  error: string | null;
}

// --- Ajout d'un cache mémoire simple ---
const rolesSubsCache: Record<
  string,
  { roles: Role[]; subsidiaries: Subsidiary[] }
> = {};

export const useRolesAndSubsidiaries = (
  enterpriseId?: string
): UseRolesAndSubsidiariesResult => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extraire les adresses des filiales
  const subsidiaryAddresses = useMemo(
    () => subsidiaries.map((sub) => sub.address),
    [subsidiaries]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles
        const roleData = await roleService.getAllRoles();
        let filteredRoles;
        if (enterpriseId) {
          const allowedRoles = [
            "ADMIN_FILIAL",
            "EMPLOYEE_ENTREPRISE",
            "EMPLOYEE_ENTREPRISE_TRUSTED",
          ];
          filteredRoles = roleData
            .filter((role: any) => allowedRoles.includes(role.name))
            .map((role: any) => ({ id: role.id, name: role.name }));
        } else {
          // Cas ADMIN : retourner tous les rôles
          filteredRoles = roleData.map((role: any) => ({
            id: role.id,
            name: role.name,
          }));
        }
        let mappedSubs = [];
        if (enterpriseId) {
          // Fetch subsidiaries pour une entreprise spécifique
          const subsidiaryData = await SubsidiaryService.getAllSubsidiaries({
            include: true,
            status: EntityStatus.ACTIVE,
            enterpriseId,
          });
          mappedSubs = subsidiaryData.data.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            address: sub.address,
          }));
        } else {
          // Cas ADMIN : charger toutes les filiales actives sans filtre
          const subsidiaryData = await SubsidiaryService.getAllSubsidiaries({
            include: true,
            status: EntityStatus.ACTIVE,
            take: 1000,
          });
          mappedSubs = subsidiaryData.data.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            address: sub.address,
          }));
        }
        setRoles(filteredRoles);
        setSubsidiaries(mappedSubs);
      } catch (err) {
        const errorMessage =
          "Erreur lors du chargement des rôles ou Sous Organisation";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enterpriseId]);

  return { roles, subsidiaries, subsidiaryAddresses, loading, error };
};
