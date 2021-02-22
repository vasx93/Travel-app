const Tour = require('../mongodb/models/tour-model');
const User = require('../mongodb/models/user-model');
const Booking = require('../mongodb/models/booking-model');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
	async getCheckoutSession(req, res) {
		// Find the booked tour
		const tour = await Tour.findById(req.params.tourId);

		if (!tour) {
			return res.status(404).send();
		}

		// Create checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			success_url: `${req.protocol}://${req.get('host')}/?tour=${
				req.params.tourId
			}&user=${req.user._id}&price=${tour.price}`,
			cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
			customer_email: req.user.email,
			client_reference_id: req.params.tourId,
			line_items: [
				{
					name: `${tour.name} Tour`,
					description: `${tour.summary}`,
					images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
					amount: tour.price * 100,
					currency: 'eur',
					quantity: 1,
				},
			],
		});

		if (!session) {
			return res.status(400).send();
		}

		// Create new booking

		// Send the session
		res.status(200).send({ message: 'Payment successful!', session });
	},

	//* This middleware is activated on payment success => success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}` => https://mysite.com/?tour=ludilo&user=ja&price=999

	async createBookingCheckoutMiddleware(req, res, next) {
		const { tour, user, price } = req.query;

		if (!tour && !user && !price) {
			return next();
		}
		await Booking.create({ tour, user, price });

		//* Clear query string from url => req.originalUrl
		res.redirect(req.originalUrl.split('?')[0]);
	},

	async getAllBookings(req, res) {
		try {
			const bookings = await Booking.find();

			if (!bookings) {
				return res.status(404).send();
			}

			res.status(200).send({
				results: bookings.length,
				bookings,
			});
		} catch (err) {
			return res.status(400).send(err.message);
		}
	},
};
