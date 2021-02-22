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
	upload,
	uploadImg,
} = require('../controllers/tour-controller');
const reviewRouter = require('../routes/review-routes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// popular
router.route('/top-5-tours').post(topFiveTours, getAllTours);
router.route('/longest-5-tours').post(longestFiveTours, getAllTours);

// stats
router.route('/stats').get(checkToken, isAvailableFor('admin'), getTourStats);
router
	.route('/stats/:year')
	.get(checkToken, isAvailableFor('admin'), getMonthlyPlan);

//* GENERAL Routes
router.route('/').get(getAllTours).post(createTour);

//* PROTECTED Routes

router
	.route('/:id')
	.get(getTour)
	.patch(
		checkToken,
		isAvailableFor('guide', 'admin'),
		upload.fields([
			{ name: 'imageCover', maxCount: 1 },
			{ name: 'images', maxCount: 3 },
		]),
		uploadImg,
		updateTour
	)
	.delete(checkToken, isAvailableFor('guide', 'admin'), deleteTour);

module.exports = router;
