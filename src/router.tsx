import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { POListPage } from './features/purchasing/pages/POListPage';
import { PODetailPage } from './features/purchasing/pages/PODetailPage';
import { POCreatePage } from './features/purchasing/pages/POCreatePage';
import { POConfigPage } from './features/purchasing/pages/POConfigPage';
import { ProductListPage } from './features/products/pages/ProductListPage';
import { ProductDetailPage } from './features/products/pages/ProductDetailPage';
import { ProductCategoryListPage } from './features/products/pages/ProductCategoryListPage';
import { ProductCatalogListPage } from './features/products/pages/ProductCatalogListPage';
import { ProductBarcodePage } from './features/products/pages/ProductBarcodePage';
import { ProductCreatePage } from './features/products/pages/ProductCreatePage';
import { CategoryDetailPage } from './features/products/pages/CategoryDetailPage';
import { SalesOrderListPage } from './features/sales/pages/SalesOrderListPage';
import { SalesOrderDetailPage } from './features/sales/pages/SalesOrderDetailPage';
import { SalesReturnListPage } from './features/sales/pages/SalesReturnListPage';
import { SalesReturnCreatePage } from './features/sales/pages/SalesReturnCreatePage';
import { SalesReturnDetailPage } from './features/sales/pages/SalesReturnDetailPage';
import { CustomerListPage } from './features/sales/pages/CustomerListPage';
import { LoginHistoryPOSPage } from './features/sales/pages/LoginHistoryPOSPage';
import { EmployeeListPage } from './features/sales/pages/EmployeeListPage';
import { CustomerDetailPage } from './features/sales/pages/CustomerDetailPage';
import { EvnInvoiceListPage } from './features/sales/pages/EvnInvoiceListPage';
import { PartnerServicesPage } from './features/sales/pages/PartnerServicesPage';
import { PartnerHistoryPage } from './features/sales/pages/PartnerHistoryPage';
import { PartnerCardInfoPage } from './features/sales/pages/PartnerCardInfoPage';
import { CommonSettingPage } from './features/sales/pages/settings/CommonSettingPage';
import { StoreGroupPage } from './features/sales/pages/settings/StoreGroupPage';
import { ProductStoreListPage } from './features/sales/pages/settings/ProductStoreListPage';
import { TerminalPOSPage } from './features/sales/pages/settings/TerminalPOSPage';
import { PosWalletListPage } from './features/sales/pages/settings/PosWalletListPage';
import { CustomerGroupPage } from './features/sales/pages/settings/CustomerGroupPage';
import { PartyClassificationPage } from './features/sales/pages/settings/PartyClassificationPage';
import { QuickPickMenuPage } from './features/sales/pages/settings/QuickPickMenuPage';
import { CreateRetailStorePage } from './features/sales/pages/settings/CreateRetailStorePage';
import { AgreementTermsPage } from './features/sales/pages/settings/AgreementTermsPage';
import { ProductFeaturePage } from './features/sales/pages/settings/ProductFeaturePage';
import { ReportsPage } from './features/sales/pages/ReportsPage';
import { SalesRevenueReportPage } from './features/sales/pages/reports/SalesRevenueReportPage';
import { SalesGrowthReportPage } from './features/sales/pages/reports/SalesGrowthReportPage';
import { OrderReportPage } from './features/sales/pages/reports/OrderReportPage';
import { ProductReportPage } from './features/sales/pages/reports/ProductReportPage';
import { CustomerReportPage } from './features/sales/pages/reports/CustomerReportPage';
import { FileExportedPage } from './features/sales/pages/FileExportedPage';
import { PrintOrderPOSPage } from './features/sales/pages/settings/PrintOrderPOSPage';

import { EnumListPage } from './features/sales/pages/settings/EnumListPage';
import { TimePeriodPage } from './features/sales/pages/settings/TimePeriodPage';
import { RoleTypePage } from './features/sales/pages/settings/RoleTypePage';
import { CustomerTypePage } from './features/sales/pages/settings/CustomerTypePage';
import { RequirementListPage } from './features/accounting/pages/RequirementListPage';
import { TransferListPage } from './features/accounting/pages/TransferListPage';
import { PaymentListPage } from './features/accounting/pages/PaymentListPage';
import { AROrderListPage } from './features/accounting/pages/AROrderListPage';
import { WorkShiftListPage } from './features/accounting/pages/WorkShiftListPage';
import { InvoiceListPage } from './features/accounting/pages/InvoiceListPage';
import { TransactionListPage } from './features/accounting/pages/TransactionListPage';
import { FailOrderListPage } from './features/accounting/pages/FailOrderListPage';
import { AccReportsPage } from './features/accounting/pages/AccReportsPage';
import { BehalfAggReportPage } from './features/accounting/pages/reports/BehalfAggReportPage';
import { BehalfCommissionPage } from './features/accounting/pages/reports/BehalfCommissionPage';
import { BehalfBySupplierPage } from './features/accounting/pages/reports/BehalfBySupplierPage';
import { BehalfDetailMCSPage } from './features/accounting/pages/reports/BehalfDetailMCSPage';
import { BehalfDetailSupplierPage } from './features/accounting/pages/reports/BehalfDetailSupplierPage';
import { BehalfByOrderPage } from './features/accounting/pages/reports/BehalfByOrderPage';
import { IncomeStatementPage } from './features/accounting/pages/reports/IncomeStatementPage';
import { IncomeGrowthPage } from './features/accounting/pages/reports/IncomeGrowthPage';
import { ExpenseStatementPage } from './features/accounting/pages/reports/ExpenseStatementPage';
import { FacilityListPage } from './features/logistics/pages/FacilityListPage';
import { InventoryListPage } from './features/logistics/pages/InventoryListPage';
import { ReturnListPage as LogReturnListPage } from './features/logistics/pages/ReturnListPage';
import { LogTransferListPage } from './features/logistics/pages/TransferListPage';
import { LogRequirementListPage } from './features/logistics/pages/RequirementListPage';
import { LogReportsPage } from './features/logistics/pages/LogReportsPage';
import { TransferDetailPage } from './features/logistics/pages/TransferDetailPage';
import { RequirementDetailPage } from './features/logistics/pages/RequirementDetailPage';
import { ShipmentListPage } from './features/logistics/pages/ShipmentListPage';
import { FacilityDetailPage } from './features/logistics/pages/FacilityDetailPage';
import { PhysicalInventoryPage } from './features/logistics/pages/PhysicalInventoryPage';
import { DepositFacilityPage } from './features/logistics/pages/DepositFacilityPage';
import { FacilityRolePage } from './features/logistics/pages/FacilityRolePage';
import { SupplierListPage } from './features/suppliers/pages/SupplierListPage';
import { SupplierDetailPage } from './features/suppliers/pages/SupplierDetailPage';
import { SupplierProductListPage } from './features/suppliers/pages/SupplierProductListPage';

const P = ({ title }: { title: string }) => (
  <div><h2>{title}</h2><p>This page is under construction.</p></div>
);

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },

      // ═══ SALES (Bán hàng) ═══
      { path: 'sales/orders',                    element: <SalesOrderListPage /> },
      { path: 'sales/evn-invoices',              element: <EvnInvoiceListPage /> },
      { path: 'sales/orders/:orderId',           element: <SalesOrderDetailPage /> },
      { path: 'sales/returns',                   element: <SalesReturnListPage /> },
      { path: 'sales/returns/new',               element: <SalesReturnCreatePage /> },
      { path: 'sales/returns/:returnId',         element: <SalesReturnDetailPage /> },
      { path: 'sales/products',                  element: <ProductListPage /> },
      { path: 'sales/products/categories',       element: <ProductCategoryListPage /> },
      { path: 'sales/products/categories/:categoryId', element: <CategoryDetailPage /> },
      { path: 'sales/products/catalog',          element: <ProductCatalogListPage /> },
      { path: 'sales/products/:productId',       element: <ProductDetailPage /> },
      { path: 'sales/customers/family',           element: <CustomerListPage type="family" /> },
      { path: 'sales/customers/business',        element: <CustomerListPage type="business" /> },
      { path: 'sales/customers/school',          element: <CustomerListPage type="school" /> },
      { path: 'sales/customers/loyalty',         element: <CustomerListPage type="loyalty" /> },
      { path: 'sales/customers/:partyId',        element: <CustomerDetailPage /> },
      { path: 'sales/employees',                 element: <EmployeeListPage /> },
      { path: 'sales/employees/login-history',   element: <LoginHistoryPOSPage /> },
      { path: 'sales/partner/services',           element: <PartnerServicesPage /> },
      { path: 'sales/partner/history',            element: <PartnerHistoryPage /> },
      { path: 'sales/partner/card-info',          element: <PartnerCardInfoPage /> },
      { path: 'sales/reports',                   element: <ReportsPage /> },
      { path: 'sales/reports/revenue',           element: <SalesRevenueReportPage /> },
      { path: 'sales/reports/growth',            element: <SalesGrowthReportPage /> },
      { path: 'sales/reports/orders',            element: <OrderReportPage /> },
      { path: 'sales/reports/products',          element: <ProductReportPage /> },
      { path: 'sales/reports/customers',         element: <CustomerReportPage /> },
      { path: 'sales/file-exported',             element: <FileExportedPage /> },
      { path: 'sales/settings/common',              element: <CommonSettingPage /> },
      { path: 'sales/settings/common/time-period', element: <TimePeriodPage /> },
      { path: 'sales/settings/common/channel',     element: <EnumListPage enumTypeId="ORDER_SALES_CHANNEL" title="Channel Type" breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Channel Type' }]} /> },
      { path: 'sales/settings/common/priority',    element: <EnumListPage enumTypeId="ORDER_PRIORITY" title="Priority" breadcrumbs={[{ label: 'Bán hàng' }, { label: 'Cấu hình', path: '/sales/settings/common' }, { label: 'Cấu hình chung', path: '/sales/settings/common' }, { label: 'Priority' }]} /> },
      { path: 'sales/settings/common/role-type',   element: <RoleTypePage /> },
      { path: 'sales/settings/common/product-feature', element: <ProductFeaturePage /> },
      { path: 'sales/settings/common/customer-type', element: <CustomerTypePage /> },
      { path: 'sales/settings/stores',            element: <ProductStoreListPage /> },
      { path: 'sales/settings/create-store',      element: <CreateRetailStorePage /> },
      { path: 'sales/settings/store-group',       element: <StoreGroupPage /> },
      { path: 'sales/settings/terminal-pos',      element: <TerminalPOSPage /> },
      { path: 'sales/settings/print-pos',         element: <PrintOrderPOSPage /> },
      { path: 'sales/settings/customer-group',    element: <CustomerGroupPage /> },
      { path: 'sales/settings/party-classification', element: <PartyClassificationPage /> },
      { path: 'sales/settings/agreement-terms',   element: <AgreementTermsPage /> },
      { path: 'sales/settings/wallet',            element: <PosWalletListPage /> },
      { path: 'sales/settings/quick-menu',        element: <QuickPickMenuPage /> },

      // ═══ PURCHASE ORDERS (Mua sắm) ═══
      { path: 'po/plan',                         element: <P title="Kế hoạch" /> },
      { path: 'po/orders',                       element: <POListPage /> },
      { path: 'po/orders/new',                   element: <POCreatePage /> },
      { path: 'po/orders/:orderId',              element: <PODetailPage /> },
      { path: 'po/products',                     element: <ProductListPage /> },
      { path: 'po/products/new',                 element: <ProductCreatePage /> },
      { path: 'po/products/categories',          element: <ProductCategoryListPage /> },
      { path: 'po/products/categories/:categoryId', element: <CategoryDetailPage /> },
      { path: 'po/products/catalog',             element: <ProductCatalogListPage /> },
      { path: 'po/products/barcode',             element: <ProductBarcodePage /> },
      { path: 'po/products/:productId',          element: <ProductDetailPage /> },
      { path: 'po/suppliers',                    element: <SupplierListPage /> },
      { path: 'po/suppliers/products',           element: <SupplierProductListPage /> },
      { path: 'po/suppliers/:partyId',           element: <SupplierDetailPage /> },
      { path: 'po/config',                       element: <POConfigPage /> },

      // ═══ CRM / CALL CENTER ═══
      { path: 'crm/callcenter',                  element: <P title="Call Center" /> },
      { path: 'crm/task',                        element: <P title="Lịch gọi" /> },
      { path: 'crm/history',                     element: <P title="Lịch sử" /> },
      { path: 'crm/contacts',                    element: <P title="Liên hệ" /> },
      { path: 'crm/customers',                   element: <P title="Khách hàng CRM" /> },
      { path: 'crm/campaigns',                   element: <P title="Chiến dịch" /> },
      { path: 'crm/reports',                     element: <P title="Báo cáo CRM" /> },
      { path: 'crm/import',                      element: <P title="Nhập dữ liệu" /> },
      { path: 'crm/settings',                    element: <P title="Cài đặt CRM" /> },

      // ═══ HR (Nhân sự) ═══
      { path: 'hr/profile',                      element: <P title="Hồ sơ" /> },
      { path: 'hr/directory',                    element: <P title="Danh bạ" /> },

      // ═══ ACCOUNTING (Kế toán) ═══
      // Duyệt
      { path: 'accounting/approvement/requirements', element: <RequirementListPage /> },
      { path: 'accounting/approvement/transfers',    element: <TransferListPage /> },
      // Thu (AR)
      { path: 'accounting/ar/payments',              element: <PaymentListPage paymentType="AR" title="Thu" breadcrumbs={[{ label: 'Kế toán' }, { label: 'Thu' }, { label: 'Thanh toán' }]} /> },
      { path: 'accounting/ar/orders',                element: <AROrderListPage /> },
      { path: 'accounting/ar/workshift',             element: <WorkShiftListPage /> },
      // Chi (AP)
      { path: 'accounting/ap/invoices',              element: <InvoiceListPage /> },
      { path: 'accounting/ap/payments',              element: <PaymentListPage paymentType="AP" title="Chi" breadcrumbs={[{ label: 'Kế toán' }, { label: 'Chi' }, { label: 'Thanh toán' }]} /> },
      // Trả hàng
      { path: 'accounting/returns',                  element: <SalesReturnListPage /> },
      { path: 'accounting/returns/new',              element: <SalesReturnCreatePage /> },
      // Ví POS
      { path: 'accounting/wallet',                   element: <PosWalletListPage /> },
      // Giao dịch
      { path: 'accounting/transactions',             element: <TransactionListPage /> },
      // Đơn lỗi
      { path: 'accounting/fail-orders',              element: <FailOrderListPage /> },
      // Báo cáo
      { path: 'accounting/reports',                  element: <AccReportsPage /> },
      { path: 'accounting/reports/behalf-agg',       element: <BehalfAggReportPage /> },
      { path: 'accounting/reports/behalf-commission', element: <BehalfCommissionPage /> },
      { path: 'accounting/reports/behalf-supplier',  element: <BehalfBySupplierPage /> },
      { path: 'accounting/reports/behalf-detail-mcs', element: <BehalfDetailMCSPage /> },
      { path: 'accounting/reports/behalf-detail-supplier', element: <BehalfDetailSupplierPage /> },
      { path: 'accounting/reports/behalf-order',     element: <BehalfByOrderPage /> },
      { path: 'accounting/reports/income',           element: <IncomeStatementPage /> },
      { path: 'accounting/reports/income-growth',    element: <IncomeGrowthPage /> },
      { path: 'accounting/reports/expense',          element: <ExpenseStatementPage /> },
      // File đã xuất
      { path: 'accounting/file-exported',            element: <FileExportedPage /> },

      // ═══ LOGISTICS ═══
      // Kho hàng
      { path: 'logistics/facilities',                element: <FacilityListPage /> },
      { path: 'logistics/facilities/deposit',        element: <DepositFacilityPage /> },
      { path: 'logistics/facilities/roles',          element: <FacilityRolePage /> },
      { path: 'logistics/facilities/:facilityId',    element: <FacilityDetailPage /> },
      // Tồn kho
      { path: 'logistics/inventory',                 element: <InventoryListPage /> },
      { path: 'logistics/inventory/physical',        element: <PhysicalInventoryPage /> },
      // Xuất hàng
      { path: 'logistics/stock-out/sales-orders',    element: <SalesOrderListPage /> },
      { path: 'logistics/stock-out/export-req',      element: <LogRequirementListPage /> },
      { path: 'logistics/stock-out/return-po',       element: <LogReturnListPage returnType="supplier" /> },
      // Nhập hàng
      { path: 'logistics/stock-in/purchase-orders',  element: <POListPage /> },
      { path: 'logistics/stock-in/receive-req',      element: <LogRequirementListPage /> },
      { path: 'logistics/stock-in/return-so',        element: <LogReturnListPage returnType="customer" /> },
      // Trả lại
      { path: 'logistics/returns/customer',          element: <LogReturnListPage returnType="customer" /> },
      { path: 'logistics/returns/supplier',          element: <LogReturnListPage returnType="supplier" /> },
      // Điều chuyển
      { path: 'logistics/transfers',                 element: <LogTransferListPage /> },
      { path: 'logistics/transfers/shipments',       element: <ShipmentListPage /> },
      { path: 'logistics/transfers/:transferId',     element: <TransferDetailPage /> },
      // Yêu cầu
      { path: 'logistics/requirements',              element: <LogRequirementListPage /> },
      { path: 'logistics/requirements/:requirementId', element: <RequirementDetailPage /> },
      // Báo cáo
      { path: 'logistics/reports',                   element: <LogReportsPage /> },

      // ═══ ADMIN (Quản trị) ═══
      { path: 'admin/webtools',                      element: <P title="Administration" /> },
      { path: 'admin/settings',                      element: <P title="Cài đặt hệ thống" /> },
      { path: 'admin/security',                      element: <P title="Bảo mật" /> },

      // Catch-all
      { path: '*', element: <P title="Không tìm thấy trang" /> },
    ],
  },
]);
