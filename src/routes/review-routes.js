const express = require('express');
const {
	getAllReviews,
	createReview,
	updateReview,
	deleteReview,
	adminDeleteReview,
	adminUpdateReview,
} = require('../controllers/review-controller');

const { checkToken, isAvailableFor } = require('../middleware/helpers');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(getAllReviews)
	.post(checkToken, isAvailableFor('user', 'admin'), createReview);

//* PROTECTED Routes
router.use(checkToken);

router
	.route('/:id')
	.patch(isAvailableFor('user', 'admin'), updateReview)
	.delete(isAvailableFor('user', 'admin'), deleteReview);

//* ADMIN Routes
router.use(isAvailableFor('admin'));

router.route('/admin/:id').patch(adminUpdateReview).delete(adminDeleteReview);

module.exports = router;
