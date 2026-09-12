export const PERMISSIONS = {
  ANALYTICS: {
    VIEW: 'analytics.view',
    MANAGE: 'analytics.manage',
  },
  PRODUCTS: {
    VIEW: 'products.view',
    MANAGE: 'products.manage',
  },
  QUOTATIONS: {
    VIEW: 'quotations.view',
    MANAGE: 'quotations.manage',
  },
  LEADS: {
    VIEW: 'leads.view',
    MANAGE: 'leads.manage',
  },
  HIRING: {
    VIEW: 'hiring.view',
    MANAGE: 'hiring.manage',
  },
  SUBMISSIONS: {
    VIEW: 'submissions.view',
    MANAGE: 'submissions.manage',
  },
  CONTENT: {
    VIEW: 'content.view',
    MANAGE: 'content.manage',
  },
  LOGS: {
    VIEW: 'logs.view',
  },
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    DELETE: 'users.delete',
    MANAGE_PERMISSIONS: 'users.manage_permissions',
  },
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(group => Object.values(group));
