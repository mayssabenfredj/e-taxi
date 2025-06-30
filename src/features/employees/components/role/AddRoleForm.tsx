import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shareds/components/ui/card';
import { Badge } from '@/shareds/components/ui/badge';
import { Button } from '@/shareds/components/ui/button';
import { Checkbox } from '@/shareds/components/ui/checkbox';
import { Input } from '@/shareds/components/ui/input';
import { Label } from '@/shareds/components/ui/label';
import { ScrollArea } from '@/shareds/components/ui/scroll-area';
import { ShieldCheck, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '../../services/permission.service';
import { Permission } from '../../types/permission';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RoleFormProps {
  selectedRole?: Role | null;
  onClose: () => void;
  onSave: (role: any) => void;
  isNewRole?: boolean;
}

export function RoleForm({
  selectedRole,
  onClose,
  onSave,
  isNewRole = false,
}: RoleFormProps) {
  const [role, setRole] = useState<Role>({
    id: '',
    name: '',
    description: '',
    permissions: [],
  });

  // Charger dynamiquement les permissions
  const { data: permissions = [], isLoading: isPermissionsLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions(),
    staleTime: 5 * 60 * 1000,
  });

  const permissionMap = useMemo(() => {
    return permissions.reduce((map, perm) => {
      map[perm.id] = perm;
      return map;
    }, {} as Record<string, Permission>);
  }, [permissions]);

  useEffect(() => {
    if (selectedRole && !isNewRole) {
      setRole(selectedRole);
    } else if (isNewRole) {
      setRole({
        id: '',
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [selectedRole, isNewRole]);

  const permissionGroups = useMemo(() => ({
    Utilisateurs: permissions.filter((p) => p.action.startsWith('users:')),
    Rôles: permissions.filter((p) => p.action.startsWith('roles:')),
    Entreprises: permissions.filter((p) => p.action.startsWith('enterprises:')),
    Filiales: permissions.filter((p) => p.action.startsWith('subsidiaries:')),
    Transports: permissions.filter((p) => p.action.startsWith('transports:')),
    Chauffeurs: permissions.filter((p) => p.action.startsWith('drivers:')),
    Véhicules: permissions.filter((p) => p.action.startsWith('vehicles:')),
    Rapports: permissions.filter((p) => p.action.startsWith('reports:')),
    Structures: permissions.filter((p) => p.action.startsWith('structures:')),
    Zones: permissions.filter((p) => p.action.startsWith('zones:')),
    Système: permissions.filter((p) => p.action.startsWith('system:')),
  }), [permissions]);

  // Sélectionner/désélectionner tout un groupe
  const handleSelectAllGroup = (group: string, checked: boolean) => {
    const groupPermissions = permissionGroups[group] || [];
    setRole((prev) => {
      let updatedPermissions: Permission[] = checked
        ? [
            ...prev.permissions,
            ...groupPermissions.filter(
              (p) => !prev.permissions.some((existing) => existing.id === p.id)
            ),
          ]
        : prev.permissions.filter((p) => !groupPermissions.some((gp) => gp.id === p.id));
      return { ...prev, permissions: updatedPermissions };
    });
  };

  // Sélection individuelle avec ajout auto de la permission read
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setRole((prev) => {
      let updatedPermissions = checked
        ? [...prev.permissions, permissionMap[permissionId]!]
        : prev.permissions.filter((p) => p.id !== permissionId);

      if (checked) {
        const selectedPermission = permissions.find((p) => p.id === permissionId);
        if (selectedPermission) {
          const groupKey = Object.keys(permissionGroups).find((key) =>
            permissionGroups[key].some((p) => p.id === permissionId)
          );
          if (groupKey) {
            const readPermission = permissionGroups[groupKey].find((p) =>
              p.action.endsWith(':read')
            );
            if (
              readPermission &&
              !updatedPermissions.some((p) => p.id === readPermission.id)
            ) {
              updatedPermissions = [...updatedPermissions, readPermission];
            }
          }
        }
      }

      return {
        ...prev,
        permissions: [...new Set(updatedPermissions)],
      };
    });
  };

  const formatPermissionName = (action: string) => {
    const [resource, operation] = action.split(':');
    const operationMap: Record<string, string> = {
      create: 'Créer',
      read: 'Voir',
      update: 'Modifier',
      delete: 'Supprimer',
      export: 'Exporter',
      admin: 'Administrer',
      config: 'Configurer',
    };
    return `${operationMap[operation] || operation}`;
  };

  const getGroupName = (groupName: string) => {
    return groupName;
  };

  const DISABLED_GROUPS = ['Structures', 'Système'];

  const handleSave = () => {
    if (!role.name.trim()) {
      toast.error('Le nom du rôle est requis');
      return;
    }
    if (role.permissions.length === 0) {
      toast.error('Sélectionnez au moins une permission');
      return;
    }

    const roleData = {
      name: role.name,
      description: role.description || '',
      permissions: role.permissions.map((p) => p.id),
    };

    onSave(roleData);
  };

  return (
    <div className="w-full flex justify-center items-start">
      <Card className="w-full max-w-4xl flex flex-col">
        <CardHeader className="p-2 ">
          <CardTitle className="flex items-center text-sm">
            <ShieldCheck className="mr-1 h-3 w-3" />
            {isNewRole ? 'Nouveau rôle' : 'Modifier le rôle'}
          </CardTitle>
          <CardDescription className="text-[10px]">
            {isNewRole ? 'Définir un nouveau rôle et ses permissions' : 'Modifier les permissions du rôle'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 flex flex-col gap-2">
          <div className="space-y-1">
            <div className="flex flex-col gap-1">
              <Label htmlFor="roleName" className="text-[10px]">
                Nom
              </Label>
              <Input
                id="roleName"
                value={role.name}
                onChange={(e) => {
                  setRole({ ...role, name: e.target.value });
                }}
                className="h-7 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="roleDescription" className="text-[10px]">
                Description
              </Label>
              <Input
                id="roleDescription"
                value={role.description || ''}
                onChange={(e) => {
                  setRole({ ...role, description: e.target.value });
                }}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-1 text-xs font-medium">Permissions</h3>
            {isPermissionsLoading ? (
              <div className="text-xs text-muted-foreground">Chargement des permissions...</div>
            ) : error ? (
              <div className="text-xs text-red-500">Erreur lors du chargement des permissions</div>
            ) : (
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {Object.entries(permissionGroups)
                    .filter(([_, perms]) => perms.length > 0)
                    .map(([groupName, perms]) => (
                      <div key={groupName} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-medium text-muted-foreground">
                            {getGroupName(groupName)}
                          </h4>
                          <div className="flex items-center">
                            <Checkbox
                              id={`select-all-${groupName}`}
                              checked={perms.every((p) =>
                                role.permissions.some((rp) => rp.id === p.id)
                              )}
                              onCheckedChange={(checked) =>
                                handleSelectAllGroup(groupName, !!checked)
                              }
                              className="h-3 w-3"
                              disabled={DISABLED_GROUPS.includes(groupName)}
                            />
                            <Label
                              htmlFor={`select-all-${groupName}`}
                              className="ml-1 text-[10px] text-muted-foreground"
                            >
                              Tout sélectionner
                            </Label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center space-x-1 min-w-[120px]"
                            >
                              <Checkbox
                                id={perm.id}
                                checked={role.permissions.some((p) => p.id === perm.id)}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(perm.id, !!checked)
                                }
                                className="h-3 w-3"
                                disabled={DISABLED_GROUPS.includes(groupName)}
                              />
                              <Label htmlFor={perm.id} className="text-[10px] font-normal">
                                {formatPermissionName(perm.action)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
          {role.permissions.length > 0 && (
            <div>
              <p className="text-[10px] mb-1">Sélectionnées:</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions
                  .slice(0, 3)
                  .map((perm) => (
                    <Badge
                      key={perm.id}
                      variant="outline"
                      className="text-[10px] bg-etaxi-yellow/10 text-etaxi-yellow"
                    >
                      {formatPermissionName(perm.action)}
                    </Badge>
                  ))}
                {role.permissions.length > 3 && (
                  <Badge variant="outline" className="text-[10px]">
                    {`+${role.permissions.length - 3}`}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-2  flex justify-end gap-1">
          <Button variant="outline" size="sm" onClick={onClose} className="h-7 text-[10px] px-2">
            <X className="mr-1 h-2 w-2" />
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-7 text-[10px] px-2 bg-etaxi-yellow hover:bg-etaxi-yellow/90 text-black"
          >
            <Save className="mr-1 h-2 w-2" />
            Sauvegarder
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}