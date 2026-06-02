export type UserRole = 'DG' | 'COMPTABLE' | 'COMMERCIAL' | 'RH';

export const ROLE_LABELS: Record<UserRole, string> = {
  DG:         'Dirigeant (DG)',
  COMPTABLE:  'Comptable',
  COMMERCIAL: 'Commercial',
  RH:         'Responsable RH',
};

type ModuleKey = 'crm' | 'finance' | 'hr' | 'projects' | 'documents' | 'admin';

const ROLE_MODULES: Record<UserRole, ModuleKey[]> = {
  DG:         ['crm', 'finance', 'hr', 'projects', 'documents', 'admin'],
  COMPTABLE:  ['crm', 'finance', 'hr', 'projects', 'documents'],
  COMMERCIAL: ['crm', 'projects', 'documents'],
  RH:         ['hr', 'projects', 'documents'],
};

/** Vérifie si un rôle peut accéder à un module */
export function canAccess(role: UserRole, module: ModuleKey): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}

/** Modules en lecture seule par rôle */
const ROLE_READONLY: Partial<Record<UserRole, ModuleKey[]>> = {
  COMPTABLE: ['crm'],
};

/** Vérifie si un rôle peut écrire (créer/modifier/supprimer) dans un module */
export function canWrite(role: UserRole, module: ModuleKey): boolean {
  if (!canAccess(role, module)) return false;
  return !ROLE_READONLY[role]?.includes(module);
}

/** Vérifie si un rôle peut supprimer définitivement dans le CRM */
export function canDeleteCRM(role: UserRole): boolean {
  return role === 'DG' || role === 'COMPTABLE';
}

/** Vérifie si un rôle est autorisé — pour les layouts serveur */
export function hasAccess(role: UserRole | undefined, module: ModuleKey): boolean {
  if (!role) return false;
  return canAccess(role, module);
}
