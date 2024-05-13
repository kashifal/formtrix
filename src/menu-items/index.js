/**
 * This module exports the menu items for the application.
 * @module menuItems
 */

import dashboard from './dashboard';
import skillCompany from './skill-company';
import trainingdetail from './training-detail';
import upload from './upload';
import reports from './reports';

//----- the above is the basic menu

/* import pages from './pages';
import other from './other';
import forms from './forms';
import elements from './elements'; */

// ==============================|| MENU ITEMS ||============================== //

/**
 * The menuItems object contains an array of menu items.
 * @type {Object}
 * @property {Array} items - The array of menu items.
 */
const menuItems = {
    items: [dashboard, skillCompany, trainingdetail, upload, reports]
};

export default menuItems;
