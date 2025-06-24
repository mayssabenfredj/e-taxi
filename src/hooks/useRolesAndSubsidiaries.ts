import { useState, useEffect } from "react";
import { roleService } from "@/services/role.service";
import SubsidiaryService from "@/services/subsidiarie.service";
import { EntityStatus } from "@/types/subsidiary";
import { toast } from "sonner";

export interface Role {
  id: string;
  name: string;
}

export interface Subsidiary {
  id: string;
  name: string;
}

interface UseRolesAndSubsidiariesResult {
  roles: Role[];
  subsidiaries: Subsidiary[];
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

  useEffect(() => {
    const fetchData = async () => {
      if (!enterpriseId) {
        setError("ID de l'entreprise non fourni");
        return;
      }

      // Vérifie le cache
      if (rolesSubsCache[enterpriseId]) {
        setRoles(rolesSubsCache[enterpriseId].roles);
        setSubsidiaries(rolesSubsCache[enterpriseId].subsidiaries);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch roles
        const roleData = await roleService.getAllRoles();
        const allowedRoles = [
          "ADMIN_FILIAL",
          "EMPLOYEE_ENTREPRISE",
          "EMPLOYEE_ENTREPRISE_TRUSTED",
        ];
        const filteredRoles = roleData
          .filter((role: any) => allowedRoles.includes(role.name))
          .map((role: any) => ({ id: role.id, name: role.name }));
        // Fetch subsidiaries
        const subsidiaryData = await SubsidiaryService.getAllSubsidiaries({
          include: true,
          status: EntityStatus.ACTIVE,
          enterpriseId,
        });
        const mappedSubs = subsidiaryData.data.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
        }));
        // Stocke dans le cache
        rolesSubsCache[enterpriseId] = {
          roles: filteredRoles,
          subsidiaries: mappedSubs,
        };
        setRoles(filteredRoles);
        setSubsidiaries(mappedSubs);
      } catch (err) {
        const errorMessage = "Erreur lors du chargement des rôles ou filiales";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enterpriseId]);

  return { roles, subsidiaries, loading, error };
};
