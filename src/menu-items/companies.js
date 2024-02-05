// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconClipboardCheck, IconDeviceAnalytics } from '@tabler/icons-react';

const icons = {
    IconClipboardCheck,
    IconDeviceAnalytics
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const companies = {
    id: 'companies',
    title: <FormattedMessage id="companies" />,
    icon: icons.IconClipboardCheck,
    type: 'group',
    children: [
        {
            id: 'tipworx',
            title: <FormattedMessage id="tipworx" />,
            type: 'item',
            url: '/dashboard/tipworx',
            icon: icons.IconClipboardCheck,
            breadcrumbs: false
        },
        {
            id: 'monks',
            title: <FormattedMessage id="monks" />,
            type: 'item',
            url: '/dashboard/monks',
            icon: icons.IconClipboardCheck,
            breadcrumbs: false
        }
    ]
};

export default companies;
