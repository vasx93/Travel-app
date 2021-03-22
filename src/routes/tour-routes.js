const express = require('express');
const { checkToken, isAvailableFor } = require('../middleware/helpers');
const {
	getAllTours,
	getTour,
	createTour,
	updateTour,
	deleteTour,
	getMonthlyPlan,
	getTourStats,
	topFiveTours,
	longestFiveTours,
	tourBookings,
	upload,
	uploadImg,
} = require('../controllers/tour-controller');
const reviewRouter = require('../routes/review-routes');
const bookingRouter = require('../routes/booking-routes');

const router = express.Router();

// nested and merged routes
router.use('/:id/reviews', reviewRouter);
router.use('/:id/bookings', bookingRouter);

// popular
router.route('/top-5-tours').post(topFiveTours, getAllTours);
router.route('/longest-5-tours').post(longestFiveTours, getAllTours);

// stats
router.route('/stats').get(checkToken, isAvailableFor('admin'), getTourStats);
router
	.route('/stats/:year')
	.get(checkToken, isAvailableFor('admin'), getMonthlyPlan);

//* GENERAL Routes

router
	.route('/')
	.get(getAllTours)
	.post(checkToken, isAvailableFor('admin'), createTour);

router
	.route('/:id')
	.get(getTour)
	.patch(
		checkToken,
		isAvailableFor('admin'),
		upload.fields([
			{ name: 'imageCover', maxCount: 1 },
			{ name: 'images', maxCount: 3 },
		]),
		uploadImg,
		updateTour
	)
	.delete(checkToken, isAvailableFor('admin'), deleteTour);

module.exports = router;
