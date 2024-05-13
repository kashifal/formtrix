// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconApps, IconUserCheck, IconBasket, IconMessages, IconLayoutKanban, IconMail, IconCalendar, IconNfc } from '@tabler/icons-react';

// constant
const icons = {
    IconApps,
    IconUserCheck,
    IconBasket,
    IconMessages,
    IconLayoutKanban,
    IconMail,
    IconCalendar,
    IconNfc
};

// ==============================|| APPLICATION MENU ITEMS ||============================== //

const upload = {
    id: 'upload',
    title: <FormattedMessage id="Add Data" />,
    icon: icons.IconApps,
    type: 'group',
    children: [
        
/*         {
            id: 'Company',
            title: <FormattedMessage id="Add Company" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/chat'
        }, */
        {
            id: 'certificates',
            title: 'Add Certificates',
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/kanban/board'
        },
        {
            id: 'mail',
            title: <FormattedMessage id="Bulk Upload" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/mail'
        },
/*         {
            id: 'staff',
            title: <FormattedMessage id="Upload Courses" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/add-staff'
        }, */
        {
            id: 'courses',
            title: <FormattedMessage id="Add Courses" />,
            type: 'item',
            url: '/components/autocomplete',
            icon: icons.IconUserCheck,
            breadcrumbs: false
        },
        {
            id: 'util-grid',
            title: <FormattedMessage id="Manage Induction" />,
            type: 'item',
            url: '/utils/util-grid',
            icon: icons.IconLayoutKanban,
            breadcrumbs: false
        }
      
    ]
};

export default upload;
