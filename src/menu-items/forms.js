// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
    IconClipboardCheck,
    IconPictureInPicture,
    IconForms,
    IconBorderAll,
    IconChartDots,
    IconStairsUp,

} from '@tabler/icons-react';

// constant
const icons = {
    IconClipboardCheck,
    IconPictureInPicture,
    IconForms,
    IconBorderAll,
    IconChartDots,
    IconStairsUp

};

// ==============================|| UI FORMS MENU ITEMS ||============================== //

const forms = {
    id: 'ui-forms',
    title: <FormattedMessage id="Matrix" />,
    icon: icons.IconPictureInPicture,
    type: 'group',
    children: [
        {
            id: 'components',
            title: <FormattedMessage id="Add Data" />,
            type: 'collapse',
            icon: icons.IconPictureInPicture,
            children: [
                {
                    id: 'autocomplete',
                    title: <FormattedMessage id="Employee/Courses" />,
                    type: 'item',
                    url: '/components/autocomplete',
                    breadcrumbs: false
                },

                {
                    id: 'date-time',
                    title: <FormattedMessage id="Add Courses" />,
                    type: 'item',
                    url: '/components/date-time',
                    breadcrumbs: false
                },
                {
                    id: 'text-field',
                    title: <FormattedMessage id="Add Skills" />,
                    type: 'item',
                    url: '/components/text-field',
                    breadcrumbs: false
                }
            ]
        },
     
        

        {
            id: 'forms-validation',
            title: <FormattedMessage id="Create New Course" />,
            type: 'item',
            url: '/forms/forms-validation',
            icon: icons.IconClipboardCheck
        },
        {
            id: 'forms-wizard',
            title: <FormattedMessage id="Induction" />,
            type: 'item',
            url: '/forms/forms-wizard',
            icon: icons.IconStairsUp
        }
    ]
};

export default forms;
