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

const application = {
    id: 'application',
    title: <FormattedMessage id="Training Detail" />,
    icon: icons.IconApps,
    type: 'group',
    children: [
        
        {
            id: 'chat',
            title: <FormattedMessage id="Company" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/chat'
        },
        {
            id: 'kanban',
            title: 'Courses',
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/kanban/board'
        },
        {
            id: 'mail',
            title: <FormattedMessage id="Skills" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/mail'
        },
        {
            id: 'calendar',
            title: <FormattedMessage id="Calendar" />,
            type: 'item',
            url: '/apps/calendar',
            icon: icons.IconUserCheck,
            breadcrumbs: false
        },
      
    ]
};

export default application;
