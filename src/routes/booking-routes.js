const express = require('express');
const { checkToken, isAvailableFor } = require('../middleware/helpers');

const {
	getCheckoutSession,
	getAllBookings,
} = require('../controllers/booking-controller');

const router = express.Router();

router.get('/checkout-session/:tourId', checkToken, getCheckoutSession);

router.get(
	'/all',
	checkToken,
	isAvailableFor('guide', 'admin'),
	getAllBookings
);

module.exports = router;
