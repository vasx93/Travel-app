const express = require('express');
const {
	isLoggedIn,
	checkToken,
	isAvailableFor,
} = require('../middleware/helpers');
const {
	showOverview,
	showTour,
	signup,
	login,
	userProfile,
	myTours,
	myReviews,
	adminTours,
	adminUsers,
} = require('../controllers/view-controller');
const {
	createBookingCheckoutMiddleware,
} = require('../controllers/booking-controller');

const router = express.Router();

//* IF user is logged in
router.use(isLoggedIn);

router.get('/signup', signup);
router.get('/login', login);

router.get('/', createBookingCheckoutMiddleware, showOverview);
router.get('/tour/:slug', showTour);

// Protected user routes
router.use(checkToken);

router.get('/me', userProfile);
router.get('/my-tours', myTours);
router.get('/my-reviews', myReviews);

//*   ~~~   ADMIN PANEL   ~~~
router.get('/admin-panel/tours/:id', isAvailableFor('admin'), adminTours);
router.get('/admin-panel/users', isAvailableFor('admin'), adminUsers);

module.exports = router;
