import {
  Dashboard as DashboardIcon,
  ShoppingCart,
  LocalShipping,
  People,
  AccountBalance,
  Handshake,
  Receipt,
  // Sales icons
  Description,         // fa-file-text-o → orders, returns
  Public,              // fa-globe → products
  Person,              // fa-user → customers
  Badge,               // icon-servant → employees
  Groups,              // fa-users → partners
  BarChart,            // fa-bar-chart-o → reports
  FolderOpen,          // fa-files-o → file exported
  Settings,            // fa-cog → settings
  // Logistics icons
  Business,            // fa-building → facilities
  Inventory2,          // fa-archive → inventory
  Upload,              // fa-upload → stock out
  Download,            // fa-download → stock in
  AssignmentReturn,    // fa-history → returns
  SwapHoriz,           // fa-exchange → transfer
  Announcement,        // fa-bullhorn → requirement
  // HR icons
  AccountCircle,       // fa-user → profile
  AccountTree,         // fa-sitemap → directory
  // CRM icons
  Phone,               // fa-phone → callcenter
  ListAlt,             // fa-list-alt → task
  Fax,                 // fa-fax → call history
  MenuBook,            // fa-book → contacts
  Event,               // fa-calendar → campaigns
  CloudUpload,         // fa-cloud-upload → import data
  // PO icons
  CalendarMonth,       // fa-calendar-o → plan
  AddShoppingCart,     // fa-cart-plus → manage PO
  Build,               // icon-cogs → config
  // ACC icons
  CheckCircleOutlined, // fa-check-circle → approvement
  MoveToInbox,         // icon-AR → receivable
  Outbox,              // icon-AP → payable
  Work,                // fa-suitcase → wallet
  CompareArrows,       // fa-exchange → transaction
  Warning,             // fa-exclamation-triangle → failed orders
  // Admin icons
  Construction,        // icon-wrench → webtools
  Security,            // icon-pencil → security
} from '@mui/icons-material';

export interface Module {
  id: string;
  label: string;
  icon: typeof DashboardIcon;
  permission: string;
  path?: string;
}

export interface Feature {
  moduleId: string;
  id: string;
  label: string;
  icon?: typeof DashboardIcon;
  path?: string;
  children?: Omit<Feature, 'moduleId'>[];
  permission?: string;
}

// ─── Modules ──────────────────────────────────────────────────────────────────
// Matches mcscmMenus.xml: SALE, PO, CALLCENTER, HR, ACC, LOG, ADMIN
// ECOMMERCE omitted (not used in thuho deployment)

export const modules: Module[] = [
  { id: 'dashboard',       label: 'Dashboard',        icon: DashboardIcon,  permission: 'DASHBOARD_VIEW', path: '/' },
  { id: 'sales',           label: 'Bán hàng',         icon: ShoppingCart,   permission: 'SALES_VIEW' },
  { id: 'purchase-orders', label: 'Mua sắm',          icon: Receipt,        permission: 'PO_VIEW' },
  { id: 'crm',             label: 'Call center',       icon: Handshake,      permission: 'CRM_VIEW' },
  { id: 'hr',              label: 'Nhân sự',           icon: People,         permission: 'HR_VIEW' },
  { id: 'accounting',      label: 'Kế toán',           icon: AccountBalance, permission: 'ACCOUNTING_VIEW' },
  { id: 'logistics',       label: 'Logistics',         icon: LocalShipping,  permission: 'LOGISTICS_VIEW' },
  { id: 'admin',           label: 'Quản trị',          icon: Construction,   permission: 'ADMIN' },
];

// ─── Features ─────────────────────────────────────────────────────────────────

export const features: Feature[] = [

  // ═══════════════════════════════════════════════════════════════
  // SALES (SALES_EMPLOYEE menu in mcscmMenus.xml, module="SALE")
  // ═══════════════════════════════════════════════════════════════

  // order → basesales/order sub-menu (6 sub-items)
  {
    moduleId: 'sales', id: 'sales-orders', label: 'Đơn hàng bán', icon: Description,
    permission: 'SALES_ORDERS_VIEW',
    children: [
      { id: 'sales-order-list',        label: 'Danh sách',          path: '/sales/orders' },
      { id: 'sales-evn-invoice-list',  label: 'Hóa đơn (từ EVN)',  path: '/sales/evn-invoices' },
    ],
  },

  // returnOrder → basesales/returnOrder sub-menu (2 sub-items)
  {
    moduleId: 'sales', id: 'sales-returns', label: 'Đơn hàng trả', icon: AssignmentReturn,
    permission: 'SALES_RETURNS_VIEW',
    children: [
      { id: 'sales-return-new',    label: 'Thêm mới',  path: '/sales/returns/new' },
      { id: 'sales-return-list',   label: 'Danh sách',  path: '/sales/returns' },
    ],
  },

  // product → basepo/productSub (shared with PO, already built)
  {
    moduleId: 'sales', id: 'sales-products', label: 'Sản phẩm', icon: Public,
    permission: 'SALES_PRODUCT_VIEW',
    children: [
      { id: 'sales-product-list',       label: 'Danh sách SP',     path: '/sales/products' },
      { id: 'sales-product-categories', label: 'Danh mục SP',      path: '/sales/products/categories' },
      { id: 'sales-product-catalog',    label: 'Danh mục catalog', path: '/sales/products/catalog' },
    ],
  },

  // customer → basesales/customerSub (4 sub-items)
  {
    moduleId: 'sales', id: 'sales-customers', label: 'Khách hàng', icon: Person,
    permission: 'SALES_CUSTOMERS_VIEW',
    children: [
      { id: 'sales-customer-family',    label: 'DSKH hộ gia đình',    path: '/sales/customers/family' },
      { id: 'sales-customer-business',  label: 'DSKH doanh nghiệp',   path: '/sales/customers/business' },
      { id: 'sales-customer-school',    label: 'DSKH trường học',      path: '/sales/customers/school' },
      { id: 'sales-customer-loyalty',   label: 'DS khách hàng loyalty', path: '/sales/customers/loyalty' },
    ],
  },

  // employee → mcscm/employeeSub (2 sub-items)
  {
    moduleId: 'sales', id: 'sales-employees', label: 'Nhân viên', icon: Badge,
    permission: 'SALES_EMPLOYEE_VIEW',
    children: [
      { id: 'sales-employee-list',         label: 'Danh sách',              path: '/sales/employees' },
      { id: 'sales-login-history-pos',     label: 'Lịch sử đăng nhập POS', path: '/sales/employees/login-history' },
    ],
  },

  // 6. partner → mcscm/partnerSub (3 active sub-items)
  {
    moduleId: 'sales', id: 'sales-partner', label: 'Đối tác', icon: Groups,
    permission: 'SALES_PARTNER_VIEW',
    children: [
      { id: 'sales-partner-services',  label: 'Dịch vụ',               path: '/sales/partner/services' },
      { id: 'sales-partner-history',   label: 'DS lịch sử giao dịch', path: '/sales/partner/history' },
      { id: 'sales-partner-card-info', label: 'Lấy thông tin thẻ',    path: '/sales/partner/card-info' },
    ],
  },

  // salesReportCommon → link
  { moduleId: 'sales', id: 'sales-reports', label: 'Báo cáo', icon: BarChart, path: '/sales/reports', permission: 'SALES_REPORTS_VIEW' },

  // fileExported → link
  { moduleId: 'sales', id: 'sales-file-exported', label: 'File trích xuất', icon: FolderOpen, path: '/sales/file-exported' },

  // settingSales → basesales/settingSales sub-menu (11 sub-items, key ones active)
  {
    moduleId: 'sales', id: 'sales-settings', label: 'Cấu hình', icon: Settings,
    permission: 'SALES_SETTINGS_VIEW',
    children: [
      { id: 'sales-setting-common',          label: 'Cấu hình chung',             path: '/sales/settings/common' },
      { id: 'sales-setting-stores',          label: 'Cửa hàng',                   path: '/sales/settings/stores' },
      { id: 'sales-setting-create-store',    label: 'Tạo cửa hàng nhanh',        path: '/sales/settings/create-store' },
      { id: 'sales-setting-store-group',     label: 'Nhóm cửa hàng',              path: '/sales/settings/store-group' },
      { id: 'sales-setting-terminal-pos',    label: 'Cấu hình Terminal POS',      path: '/sales/settings/terminal-pos' },
      { id: 'sales-setting-print-pos',       label: 'Cấu hình in đơn POS',        path: '/sales/settings/print-pos' },
      { id: 'sales-setting-customer-group',  label: 'Nhóm khách hàng',            path: '/sales/settings/customer-group' },
      { id: 'sales-setting-party-class',     label: 'Loại phân loại khách hàng',  path: '/sales/settings/party-classification' },
      { id: 'sales-setting-agreement-terms', label: 'Điều khoản hợp đồng',       path: '/sales/settings/agreement-terms' },
      { id: 'sales-setting-wallet',          label: 'Danh sách ví POS',           path: '/sales/settings/wallet' },
      { id: 'sales-setting-quick-menu',      label: 'DS sản phẩm nhanh',          path: '/sales/settings/quick-menu' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PURCHASE ORDERS (PO_EMPLOYEE menu, module="PO")
  // ═══════════════════════════════════════════════════════════════

  // planPO → basepo/planSub
  { moduleId: 'purchase-orders', id: 'po-plan', label: 'Kế hoạch', icon: CalendarMonth, path: '/po/plan', permission: 'PO_PLANNING_VIEW' },

  // managePO → basepo/managePOSub
  { moduleId: 'purchase-orders', id: 'po-manage', label: 'Quản lý đơn mua', icon: AddShoppingCart, path: '/po/orders', permission: 'PO_MANAGE_VIEW' },

  // product → basepo/productSub (5 sub-items)
  {
    moduleId: 'purchase-orders', id: 'po-products', label: 'Sản phẩm', icon: Public,
    permission: 'PO_PRODUCTS_VIEW',
    children: [
      { id: 'po-product-new',        label: 'Tạo mới SP',       path: '/po/products/new' },
      { id: 'po-product-list',       label: 'Danh sách SP',     path: '/po/products' },
      { id: 'po-product-categories', label: 'Danh mục SP',      path: '/po/products/categories' },
      { id: 'po-product-catalog',    label: 'Danh mục catalog', path: '/po/products/catalog' },
      { id: 'po-product-barcode',    label: 'In mã vạch SP',   path: '/po/products/barcode' },
    ],
  },

  // SupplierManager → basepo/supplierManagerSub (2 sub-items)
  {
    moduleId: 'purchase-orders', id: 'po-suppliers', label: 'Nhà cung cấp', icon: Person,
    permission: 'PO_SUPPLIERS_VIEW',
    children: [
      { id: 'po-supplier-list',    label: 'Danh sách NCC',       path: '/po/suppliers' },
      { id: 'po-supplier-products', label: 'Sản phẩm của NCC', path: '/po/suppliers/products' },
    ],
  },

  // configPO → basepo/configPOSub (1 active sub-item)
  {
    moduleId: 'purchase-orders', id: 'po-config', label: 'Cấu hình', icon: Build,
    permission: 'PO_CONFIG_VIEW',
    children: [
      { id: 'po-config-packing', label: 'Quy đổi đơn vị đóng gói', path: '/po/config' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CRM / CALL CENTER (CCR_EMPLOYEE menu, module="CALLCENTER")
  // ═══════════════════════════════════════════════════════════════

  // Callcenter → link
  { moduleId: 'crm', id: 'crm-callcenter', label: 'Call Center', icon: Phone, path: '/crm/callcenter', permission: 'CRM_CALLCENTER_VIEW' },

  // Task → link
  { moduleId: 'crm', id: 'crm-task', label: 'Lịch gọi', icon: ListAlt, path: '/crm/task', permission: 'CRM_TASK_VIEW' },

  // CallHistory → link
  { moduleId: 'crm', id: 'crm-history', label: 'Lịch sử', icon: Fax, path: '/crm/history', permission: 'CRM_HISTORY_VIEW' },

  // contact → basecrm/contactSub
  { moduleId: 'crm', id: 'crm-contacts', label: 'Liên hệ', icon: MenuBook, path: '/crm/contacts', permission: 'CRM_CONTACTS_VIEW' },

  // customer → basecrm/customerSub
  { moduleId: 'crm', id: 'crm-customers', label: 'Khách hàng', icon: Person, path: '/crm/customers', permission: 'CRM_CUSTOMERS_VIEW' },

  // campaign → basecrm/campaignCall
  { moduleId: 'crm', id: 'crm-campaigns', label: 'Chiến dịch', icon: Event, path: '/crm/campaigns', permission: 'CRM_CAMPAIGNS_VIEW' },

  // report → basecrm/reportCallCenter
  { moduleId: 'crm', id: 'crm-reports', label: 'Báo cáo', icon: BarChart, path: '/crm/reports', permission: 'CRM_REPORTS_VIEW' },

  // ImportData → basecrm/ImportData
  { moduleId: 'crm', id: 'crm-import', label: 'Nhập dữ liệu', icon: CloudUpload, path: '/crm/import', permission: 'CRM_IMPORT_VIEW' },

  // settingCallcenter → basecrm/settingCallcenter
  { moduleId: 'crm', id: 'crm-settings', label: 'Cài đặt', icon: Settings, path: '/crm/settings', permission: 'CRM_SETTINGS_VIEW' },

  // ═══════════════════════════════════════════════════════════════
  // HR (EMPLOYEE menu, module="HR")
  // Only profile and directory are active in thuho deployment
  // ═══════════════════════════════════════════════════════════════

  // profile → basehr/ProfileMenus
  { moduleId: 'hr', id: 'hr-profile', label: 'Hồ sơ', icon: AccountCircle, path: '/hr/profile', permission: 'HR_PROFILE_VIEW' },

  // directory → basehr/GeneralMgr
  { moduleId: 'hr', id: 'hr-directory', label: 'Danh bạ', icon: AccountTree, path: '/hr/directory', permission: 'HR_DIRECTORY_VIEW' },

  // ═══════════════════════════════════════════════════════════════
  // ACCOUNTING (ACCOUNTANTS_MANAGER menu, module="ACC")
  // ═══════════════════════════════════════════════════════════════

  // accApprovement → mcscm/subAccApprovement
  {
    moduleId: 'accounting', id: 'acc-approvement', label: 'Phê duyệt', icon: CheckCircleOutlined,
    permission: 'ACC_APPROVEMENT_VIEW',
    children: [
      { id: 'acc-requirement', label: 'Yêu cầu',      path: '/accounting/approvement/requirements' },
      { id: 'acc-transfer',    label: 'Điều chuyển',   path: '/accounting/approvement/transfers' },
    ],
  },

  // AR → mcscm/AR sub-menu
  {
    moduleId: 'accounting', id: 'acc-ar', label: 'Thu', icon: MoveToInbox,
    permission: 'ACC_AR_VIEW',
    children: [
      { id: 'acc-ar-payments',    label: 'Thanh toán',         path: '/accounting/ar/payments' },
      { id: 'acc-ar-orders',      label: 'Đơn hàng',          path: '/accounting/ar/orders' },
      { id: 'acc-ar-workshift',   label: 'Thu tiền nhân viên', path: '/accounting/ar/workshift' },
    ],
  },

  // AP → mcscm/AP sub-menu
  {
    moduleId: 'accounting', id: 'acc-ap', label: 'Chi', icon: Outbox,
    permission: 'ACC_AP_VIEW',
    children: [
      { id: 'acc-ap-invoices', label: 'Hóa đơn',   path: '/accounting/ap/invoices' },
      { id: 'acc-ap-payments', label: 'Thanh toán', path: '/accounting/ap/payments' },
    ],
  },

  // returnOrder → basesales/returnOrder (2 sub-items)
  {
    moduleId: 'accounting', id: 'acc-returns', label: 'Trả hàng', icon: Description,
    permission: 'ACC_RETURN_POS_VIEW',
    children: [
      { id: 'acc-return-new',  label: 'Thêm mới',  path: '/accounting/returns/new' },
      { id: 'acc-return-list', label: 'Danh sách', path: '/accounting/returns' },
    ],
  },

  // posWalletList → link
  { moduleId: 'accounting', id: 'acc-wallet', label: 'Ví POS', icon: Work, path: '/accounting/wallet', permission: 'ACC_WALLET_VIEW' },

  // Transaction → link to ListTrans
  { moduleId: 'accounting', id: 'acc-transactions', label: 'Giao dịch', icon: CompareArrows, path: '/accounting/transactions', permission: 'ACC_TRANSACTION_VIEW' },

  // ViewFailOrderList → link
  { moduleId: 'accounting', id: 'acc-fail-orders', label: 'Đơn lỗi', icon: Warning, path: '/accounting/fail-orders', permission: 'ACC_AR_VIEW' },

  // Report → MCSReportList (single link to report dashboard)
  { moduleId: 'accounting', id: 'acc-reports', label: 'Báo cáo', icon: BarChart, path: '/accounting/reports', permission: 'ACC_REPORTS_VIEW' },

  // fileExported
  { moduleId: 'accounting', id: 'acc-file-exported', label: 'File đã xuất', icon: FolderOpen, path: '/accounting/file-exported' },

  // ═══════════════════════════════════════════════════════════════
  // LOGISTICS (LOGISTICS menu, module="LOG")
  // ═══════════════════════════════════════════════════════════════

  // Facility → baselogistics/facility (4 sub-items)
  {
    moduleId: 'logistics', id: 'log-facilities', label: 'Kho hàng', icon: Business,
    permission: 'LOGISTICS_FACILITIES_VIEW',
    children: [
      { id: 'log-facility-list',    label: 'Danh sách',       path: '/logistics/facilities' },
      { id: 'log-facility-new',     label: 'Thêm mới',        path: '/logistics/facilities/new' },
      { id: 'log-facility-deposit', label: 'DS Kho ký gửi',  path: '/logistics/facilities/deposit' },
      { id: 'log-facility-role',    label: 'Vai trò',         path: '/logistics/facilities/roles' },
    ],
  },

  // Inventory → baselogistics/inventory (2 sub-items)
  {
    moduleId: 'logistics', id: 'log-inventory', label: 'Tồn kho', icon: Inventory2,
    permission: 'LOGISTICS_INVENTORY_VIEW',
    children: [
      { id: 'log-inventory-list',     label: 'DS Tồn kho',  path: '/logistics/inventory' },
      { id: 'log-inventory-physical', label: 'Kiểm kê',     path: '/logistics/inventory/physical' },
    ],
  },

  // StockOut → xuất hàng (3 sub-items: sales orders + export req + vendor return)
  {
    moduleId: 'logistics', id: 'log-stock-out', label: 'Xuất hàng', icon: Upload,
    permission: 'LOGISTICS_STOCKOUT_VIEW',
    children: [
      { id: 'log-sales-orders', label: 'Đơn hàng bán',         path: '/logistics/stock-out/sales-orders' },
      { id: 'log-export-req',   label: 'Xuất theo yêu cầu',    path: '/logistics/stock-out/export-req' },
      { id: 'log-return-po',    label: 'Xuất hàng trả lại',    path: '/logistics/stock-out/return-po' },
    ],
  },

  // StockIn → nhập hàng (3 sub-items: PO + receive req + customer return)
  {
    moduleId: 'logistics', id: 'log-stock-in', label: 'Nhập hàng', icon: Download,
    permission: 'LOGISTICS_STOCKIN_VIEW',
    children: [
      { id: 'log-purchase-orders', label: 'Đơn mua hàng',        path: '/logistics/stock-in/purchase-orders' },
      { id: 'log-receive-req',     label: 'Nhập theo yêu cầu',   path: '/logistics/stock-in/receive-req' },
      { id: 'log-return-so',       label: 'Nhập hàng trả lại',   path: '/logistics/stock-in/return-so' },
    ],
  },

  // Return → trả lại (2 sub-items)
  {
    moduleId: 'logistics', id: 'log-returns', label: 'Trả lại', icon: AssignmentReturn,
    permission: 'LOGISTICS_RETURNS_VIEW',
    children: [
      { id: 'log-return-customer', label: 'Khách hàng trả lại',    path: '/logistics/returns/customer' },
      { id: 'log-return-supplier', label: 'Trả lại nhà cung cấp', path: '/logistics/returns/supplier' },
    ],
  },

  // Transfer → điều chuyển (3 sub-items)
  {
    moduleId: 'logistics', id: 'log-transfers', label: 'Điều chuyển', icon: SwapHoriz,
    permission: 'LOGISTICS_TRANSFER_VIEW',
    children: [
      { id: 'log-transfer-list',      label: 'Danh sách',    path: '/logistics/transfers' },
      { id: 'log-transfer-new',       label: 'Thêm mới',     path: '/logistics/transfers/new' },
      { id: 'log-transfer-shipments', label: 'Chuyến hàng',  path: '/logistics/transfers/shipments' },
    ],
  },

  // LogRequirement → yêu cầu (2 sub-items)
  {
    moduleId: 'logistics', id: 'log-requirements', label: 'Yêu cầu', icon: Announcement,
    permission: 'LOGISTICS_REQUIREMENT_VIEW',
    children: [
      { id: 'log-req-list', label: 'Danh sách', path: '/logistics/requirements' },
      { id: 'log-req-new',  label: 'Thêm mới',  path: '/logistics/requirements/new' },
    ],
  },

  // Report → link to logisticsReports
  { moduleId: 'logistics', id: 'log-reports', label: 'Báo cáo', icon: BarChart, path: '/logistics/reports', permission: 'LOGISTICS_REPORTS_VIEW' },

  // ═══════════════════════════════════════════════════════════════
  // ADMIN (SYSADMINISTRATOR menu, module="ADMIN")
  // ═══════════════════════════════════════════════════════════════

  // Webtools → administration/WebtoolsMenu
  { moduleId: 'admin', id: 'admin-webtools', label: 'Administration', icon: Construction, path: '/admin/webtools', permission: 'ADMIN' },

  // WebtoolsSetting → administration/WebtoolsSetting
  { moduleId: 'admin', id: 'admin-settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings', permission: 'ADMIN' },

  // Security → administration/Security
  { moduleId: 'admin', id: 'admin-security', label: 'Bảo mật', icon: Security, path: '/admin/security', permission: 'ADMIN' },
];

// Helper: get features visible to user for a given module
export const getVisibleFeatures = (moduleId: string, userPermissions: string[]): Feature[] => {
  const isAdmin = userPermissions.includes('ADMIN');
  return features.filter((f) => {
    if (f.moduleId !== moduleId) return false;
    if (isAdmin) return true;
    if (!f.permission) return true;
    return userPermissions.includes(f.permission);
  });
};
