// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconDashboard, IconChartInfographic, IconDeviceAnalytics } from '@tabler/icons-react';

const icons = {
    IconDashboard,
    IconChartInfographic,
    IconDeviceAnalytics
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const reports = {
    id: 'reports',
    title: <FormattedMessage id="Reports" />,
    icon: icons.IconDashboard,
    type: 'group',
    children: [
/*         {
            id: 'admin',
            title: <FormattedMessage id="Custom Reports" />,
            type: 'item',
            url: '/dashboard/reports',
            icon: icons.IconChartInfographic,
            breadcrumbs: false
        

        }, */
        {
            id: 'grid',
            title: <FormattedMessage id="Table Report" />,
            type: 'item',
            url: '/reports',
            icon: icons.IconDeviceAnalytics,
            breadcrumbs: false
        }
    ]
};

export default reports;
