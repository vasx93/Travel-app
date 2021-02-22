const Booking = require('../mongodb/models/booking-model');
const Tour = require('../mongodb/models/tour-model');
const User = require('../mongodb/models/user-model');

module.exports = {
	async showOverview(req, res) {
		try {
			const tours = await Tour.find();

			if (!tours) {
				return res.status(404).render('error', {
					title: 'Something went wrong!',
					msg: 'No tours for now, come back later!',
				});
			}

			res.status(200).render('overview', {
				title: 'All Tours',
				tours,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	async showTour(req, res) {
		try {
			const tour = await Tour.findOne({ slug: req.params.slug }).populate({
				path: 'reviews',
				fields: 'review rating user',
			});

			if (!tour) {
				return res.status(404).render('error', {
					title: 'Something went wrong!',
					msg: 'No tour with that name!',
				});
			}

			res.status(200).render('tour', {
				title: tour.name,
				tour,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	async login(req, res) {
		try {
			res.status(200).render('login', {
				title: 'Log into your account',
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	async userProfile(req, res) {
		try {
			if (!req.user) {
				return res.status(404).render('error', {
					title: 'Something went wrong!',
					msg: 'No user found',
				});
			}

			res.status(200).render('account', {
				title: 'Your account',
				user: req.user,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	async myTours(req, res) {
		try {
			// Get access to tour IDs from all bookings
			const bookings = await Booking.find({ user: req.user._id });

			// save all tourIDs to an array -> query them
			const tourIDs = bookings.map(el => el.tour);

			const tours = await Tour.find({ _id: { $in: tourIDs } });

			if (!bookings || !tours) {
				return res.status(400).render('error', {
					title: 'Something went wrong!',
					msg: e.message,
				});
			}

			res.status(200).render('overview', {
				title: 'My tours',
				tours,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},
};
