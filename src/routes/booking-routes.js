const express = require('express');
const { checkToken, isAvailableFor } = require('../middleware/helpers');

const {
	getCheckoutSession,
	getAllBookings,
	getOneBooking,
	updateBooking,
	deleteBooking,
} = require('../controllers/booking-controller');

const router = express.Router({ mergeParams: true });

router.use(checkToken);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.route('/').get(isAvailableFor('guide', 'admin'), getAllBookings);

router
	.route('/:id')
	.get(isAvailableFor('user', 'guide', 'admin'), getOneBooking)
	.patch(isAvailableFor('guide', 'admin'), updateBooking)
	.delete(isAvailableFor('admin'), deleteBooking);

module.exports = router;
