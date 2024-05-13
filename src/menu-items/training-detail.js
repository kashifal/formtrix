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

const trainingdetail = {
    id: 'application',
    title: <FormattedMessage id="Training" />,
    icon: icons.IconApps,
    type: 'group',
    children: [
        
        {
            id: 'companies',
            title: <FormattedMessage id="Companies" />,
            type: 'item',
            icon: icons.IconUserCheck,
            url: '/apps/chat'
        },
       
      
    ]
};

export default trainingdetail;
