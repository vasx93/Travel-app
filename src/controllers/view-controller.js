const Booking = require('../mongodb/models/booking-model');
const Tour = require('../mongodb/models/tour-model');
const User = require('../mongodb/models/user-model');
const Review = require('../mongodb/models/review-model');

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

	async signup(req, res) {
		try {
			res.status(200).render('signup', {
				title: 'Sign up for your account',
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
			// Get access to tour IDs from all bookings, map it > query by it
			// const userBookings = await Booking.find({ user: req.user._id });
			// const tourIDsArray = userBookings.map(el => el.tour);

			const tourIDsArray = req.user.userTours.map(el => el);

			const tours = await Tour.find({ _id: { $in: tourIDsArray } });

			if (!tours || !tourIDsArray) {
				return res.status(400).render('error', {
					title: 'Something went wrong!',
					msg: e.message,
				});
			}

			res.status(200).render('overview', {
				title: 'My tours',
				tours,
				user: req.user,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	async myReviews(req, res) {
		try {
			const userReviewsArray = req.user.userReviews.map(el => el);

			const reviews = await Review.find({ _id: { $in: userReviewsArray } });

			if (!reviews || !userReviewsArray) {
				return res.status(400).render('error', {
					title: 'Something went wrong!',
					msg: e.message,
				});
			}

			res.status(200).render('reviews', {
				title: 'My reviews',
				reviews,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},

	//*   ~~~   ADMIN PANEL  ~~~

	async adminTours(req, res) {
		try {
			const tour = await Tour.findById(req.params.id);

			if (!tour) {
				return res.status(404).render('error', {
					title: 'Something went wrong!',
					msg: '',
				});
			}

			res.status(200).render('admin-panel_tours', {
				title: 'Edit or Delete Tours',
				tour,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},
	async adminUsers(req, res) {
		try {
			const users = await User.find();

			if (!users) {
				return res.status(404).render('error', {
					title: 'No users for now!',
					msg: '',
				});
			}
			// res.status(200).send(users);

			res.status(200).render('admin-panel-users', {
				title: 'Edit or Delete Users',
				users,
			});
		} catch (e) {
			res.status(400).render('error', {
				title: 'Something went wrong!',
				msg: e.message,
			});
		}
	},
};
