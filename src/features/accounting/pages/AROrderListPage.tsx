import { type FC } from 'react';
import { SalesOrderListPage } from '../../sales/pages/SalesOrderListPage';

// AR Orders reuses the Sales Order list with accounting context breadcrumbs
// The old system uses the same orderList.ftl page
export const AROrderListPage: FC = () => <SalesOrderListPage />;
