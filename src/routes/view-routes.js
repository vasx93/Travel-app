const express = require('express');
const { isLoggedIn, checkToken } = require('../middleware/helpers');
const {
	showOverview,
	showTour,
	login,
	userProfile,
	myTours,
} = require('../controllers/view-controller');
const {
	createBookingCheckoutMiddleware,
} = require('../controllers/booking-controller');

const router = express.Router();

router.get('/', isLoggedIn, createBookingCheckoutMiddleware, showOverview);

router.get('/tour/:slug', isLoggedIn, showTour);

router.get('/login', isLoggedIn, login);
router.get('/me', checkToken, userProfile);
router.get('/my-tours', checkToken, myTours);

module.exports = router;
