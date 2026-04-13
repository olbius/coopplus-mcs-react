import axios from 'axios';
import { apiClient } from './client';
import { env } from '../config/env';
import type { LoginRequest, LoginResponse, BackendTokenResponse, JWTPayload } from '../types/auth.types';

const decodeJWT = (token: string): JWTPayload => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

// Frontend permission sets per module — matches navigation.ts feature permissions
const SALES_PERMS = [
  'SALES_VIEW', 'SALES_ORDERS_VIEW', 'SALES_RETURNS_VIEW',
  'SALES_PRODUCT_VIEW', 'SALES_EMPLOYEE_VIEW',
  'SALES_PARTNER_VIEW', 'SALES_REPORTS_VIEW',
];

const LOGISTICS_PERMS = [
  'LOGISTICS_VIEW', 'LOGISTICS_FACILITIES_VIEW', 'LOGISTICS_INVENTORY_VIEW',
  'LOGISTICS_STOCKOUT_VIEW', 'LOGISTICS_STOCKIN_VIEW', 'LOGISTICS_RETURNS_VIEW',
  'LOGISTICS_TRANSFER_VIEW', 'LOGISTICS_REQUIREMENT_VIEW', 'LOGISTICS_REPORTS_VIEW',
];

const HR_PERMS = [
  'HR_VIEW', 'HR_PROFILE_VIEW', 'HR_DIRECTORY_VIEW',
];

const CRM_PERMS = [
  'CRM_VIEW', 'CRM_CALLCENTER_VIEW', 'CRM_TASK_VIEW', 'CRM_HISTORY_VIEW',
  'CRM_CONTACTS_VIEW', 'CRM_CUSTOMERS_VIEW', 'CRM_CAMPAIGNS_VIEW',
  'CRM_REPORTS_VIEW', 'CRM_IMPORT_VIEW', 'CRM_SETTINGS_VIEW',
];

const PO_PERMS = [
  'PO_VIEW', 'PO_PLANNING_VIEW', 'PO_MANAGE_VIEW', 'PO_PRODUCTS_VIEW',
  'PO_SUPPLIERS_VIEW', 'PO_CONFIG_VIEW',
];

const ACC_PERMS = [
  'ACCOUNTING_VIEW', 'ACC_APPROVEMENT_VIEW', 'ACC_AR_VIEW', 'ACC_AP_VIEW',
  'ACC_RETURN_POS_VIEW', 'ACC_WALLET_VIEW', 'ACC_TRANSACTION_VIEW',
  'ACC_REPORTS_VIEW',
];

/**
 * Maps OFBiz SecurityGroup IDs (from DB) to frontend permission strings.
 * SecurityGroup names match those in McscmSecurityGroupSeedData.xml.
 * Permissions match those used in navigation.ts feature definitions.
 */
const mapSecurityGroups = (groups: string[]): string[] => {
  const permissionMap: Record<string, string[]> = {
    // Admin — gets everything
    SUPER:                  ['ADMIN'],
    FULLADMIN:              ['ADMIN'],
    SYSTEM_ADMINISTRATION:  ['ADMIN'],

    // Sales
    SALES_EMPLOYEE:         SALES_PERMS,
    SALES_MANAGER:          [...SALES_PERMS, 'SALES_SETTINGS_VIEW'],

    // Logistics
    LOG_ADMIN:              LOGISTICS_PERMS,
    LOG_SPECIALIST:         LOGISTICS_PERMS,
    LOG_STOREKEEPER:        LOGISTICS_PERMS,
    LOG_EMPLOYEE:           ['LOGISTICS_VIEW'],
    LOG_DELIVERER:          ['LOGISTICS_VIEW'],
    LOG_DRIVER:             ['LOGISTICS_VIEW'],

    // HR (only profile + directory active in thuho)
    EMPLOYEE:               HR_PERMS,
    HRMADMIN:               HR_PERMS,
    HEADOFDEPT:             HR_PERMS,
    HEADOFOFFICEDEPT:       HR_PERMS,
    HRRECSPC:               HR_PERMS,
    HRSALSPEC:              HR_PERMS,

    // CRM / Call Center
    CALLCENTER:             CRM_PERMS,
    CALLCENTER_MANAGER:     CRM_PERMS,

    // Purchase Orders — PO_MANAGER has MODULE_PURCHASEORDER, MODULE_PRODUCTPO,
    // MODULE_SUPPLIER, MODULE_CONFIGPO, MODULE_REPORTPO but NOT MODULE_PLANPO
    PO_MANAGER:             ['PO_VIEW', 'PO_MANAGE_VIEW', 'PO_PRODUCTS_VIEW', 'PO_SUPPLIERS_VIEW', 'PO_CONFIG_VIEW'],
    PO_EMPLOYEE:            ['PO_VIEW', 'PO_MANAGE_VIEW', 'PO_PRODUCTS_VIEW', 'PO_SUPPLIERS_VIEW'],

    // Accounting
    ACCOUNTANTS_MANAGER:    ACC_PERMS,
    ACCOUNTANTS_GENERAL:    ACC_PERMS,
    ACCOUNTANTS_LIABILITY:  ['ACCOUNTING_VIEW', 'ACC_AP_VIEW', 'ACC_REPORTS_VIEW'],
    ACCOUNTANTS_PAYMENT:    ['ACCOUNTING_VIEW', 'ACC_AR_VIEW', 'ACC_AP_VIEW', 'ACC_REPORTS_VIEW'],

    // POS — POS employees also see sales orders
    POS_EMPLOYEE:           ['DASHBOARD_VIEW', 'SALES_VIEW', 'SALES_ORDERS_VIEW'],

    // System
    SYS_EMPLOYEE:           ['DASHBOARD_VIEW'],
    SYSTEM_EMPLOYEE:        ['DASHBOARD_VIEW'],

    // Reports
    REGION_REPORT:          ['ACCOUNTING_VIEW', 'ACC_REPORTS_VIEW'],
    BOARD_DIRECTOR:         ['DASHBOARD_VIEW'],
  };

  const permissions = new Set<string>(['DASHBOARD_VIEW']);
  for (const group of groups) {
    const mapped = permissionMap[group];
    if (mapped) mapped.forEach((p) => permissions.add(p));
    if (group === 'SUPER' || group === 'FULLADMIN' || group === 'SYSTEM_ADMINISTRATION') {
      Object.values(permissionMap).flat().forEach((p) => permissions.add(p));
      permissions.add('ADMIN');
    }
  }
  return Array.from(permissions);
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);

    const tokenResponse = await axios.post<BackendTokenResponse>(
      `${env.API_BASE_URL}/auth/token`,
      {},
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data.data;
    const jwtPayload = decodeJWT(access_token);

    let firstName = jwtPayload.userLoginId;
    let lastName = '';
    let email = '';
    let securityGroups: string[] = [];

    try {
      const profileResponse = await axios.post(
        `${env.API_BASE_URL}/services/getUserProfile`,
        { _dummy: '1' },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const profile = profileResponse.data?.data ?? profileResponse.data ?? {};
      const userInfo = profile.userInfo ?? profile;
      // Vietnamese name: lastName middleName firstName (e.g. Nguyễn Văn Đạt)
      const parts = [userInfo.lastName, userInfo.middleName, userInfo.firstName].filter(Boolean);
      firstName = parts.length > 0 ? parts.join(' ') : jwtPayload.userLoginId;
      lastName  = '';
      email     = userInfo.emailAddress || userInfo.email || '';

      if (Array.isArray(profile.securityGroups)) {
        securityGroups = profile.securityGroups;
      } else if (profile.securityGroupId) {
        securityGroups = [profile.securityGroupId];
      }
    } catch {
      // Profile fetch failed — continue with JWT data only
    }

    const user = {
      userId:    jwtPayload.userLoginId,
      username:  credentials.username,
      firstName,
      lastName,
      email,
      roles: securityGroups.length ? securityGroups : ['USER'],
    };

    const permissions = securityGroups.length
      ? mapSecurityGroups(securityGroups)
      : ['DASHBOARD_VIEW'];

    return { token: access_token, refreshToken: refresh_token, user, permissions };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Client-side logout still proceeds
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await axios.post<BackendTokenResponse>(
      `${env.API_BASE_URL}/auth/refresh-token`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return {
      token:        response.data.data.access_token,
      refreshToken: response.data.data.refresh_token,
    };
  },
};
