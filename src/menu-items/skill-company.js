// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconUserCheck, IconBrandChrome, IconStairsUp } from '@tabler/icons-react';

// constant
const icons = {
    IconUserCheck,
    IconBrandChrome,
    IconStairsUp
};


const SkillCompany = {
    id: 'skill-company',
    title: <FormattedMessage id="Skills Status" />,
    icon: icons.IconBrandChrome,
    type: 'group',
    children: [
        {
            id: 'skill-company',
            title: <FormattedMessage id="Skills by Company" />,
            icon: icons.IconBrandChrome,
            type: 'item',
            url: '/skill-company',
        },
        {
            id: 'sample-page',
            title: <FormattedMessage id="Skills Report" />,
            icon: icons.IconBrandChrome,
            type: 'item',
            url: '/sample-page',
        },
        {
            id: 'full-report-monks',
            title: <FormattedMessage id="Full Report MTS" />,
            icon: icons.IconBrandChrome,
            type: 'item',
            url: '/full-report-monks',
        },
        {
            id: 'employee',
            title: <FormattedMessage id="Employee" />,
            icon: icons.IconUserCheck,
            type: 'item',
            url: '/employee',
        },
        {
            id: 'induction',
            title: <FormattedMessage id="Induction Progress" />,
            icon: icons.IconStairsUp,
            type: 'item',
            url: '/forms/forms-wizard',
        }


    ]   
};



export default SkillCompany;
