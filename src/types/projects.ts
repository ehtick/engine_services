import { Base, ObjectId } from './base';

export type PermissionSubject =
  | 'PROJECT'
  | 'MEMBERS'
  | 'ROLES'
  | 'APP'
  | 'STORAGE'
  | 'EVENTS'
  | 'ALL';

export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'MANAGE';

export interface Permission {
  action: PermissionAction;
  subject?: PermissionSubject;
}

export interface Project extends Base {
  title: string;
  description?: string;
}

export interface ProjectRole extends Base {
  projectId: ObjectId;
  name: string;
  description?: string;
  permissions: Permission[];
  fixed?: boolean;
}

export interface ProjectWithRole {
  project: Project;
  role: ProjectRole | null;
}

// ─── Project Context DTO ──────────────────────────────────────────

/** Stripped-down user info safe for app consumption. */
export interface ProjectContextUser {
  _id: string;
  fullName: string;
  email: string;
}

/** A project member with their role info. */
export interface ProjectContextMember {
  projectUserId: string;
  user: ProjectContextUser;
  role: ProjectRole;
}

/** Minimal file info for the project context. */
export interface ProjectContextFile {
  _id: string;
  name: string;
  fileExtension?: string;
  folderId?: string;
  itemType: string;
  createdAt: string;
}

/** Minimal folder info for the project context. */
export interface ProjectContextFolder {
  _id: string;
  name: string;
  parentId?: string;
}

/** Aggregated project context returned by `getProjectContext()`. */
export interface ProjectContext {
  project: Project;
  currentUser: ProjectContextMember | null;
  users: ProjectContextMember[];
  roles: ProjectRole[];
  files: ProjectContextFile[];
  folders: ProjectContextFolder[];
}
