const Review = require('../mongodb/models/review-model');
const User = require('../mongodb/models/user-model');

module.exports = {
	async createReview(req, res) {
		try {
			const tour = req.body.tour ? req.body.tour : req.params.id;
			const user = req.body.user ? req.body.user : req.user;

			// Simple check to see if req.user has booked this tour
			if (!req.user.userTours.includes(tour)) {
				return res.status(401).send();
			}

			// Create review
			const review = await Review.create({
				review: req.body.review,
				rating: req.body.rating,
				tour,
				user,
			});

			if (!review) {
				return res.status(400).send();
			}

			// save to user doc
			req.user.userReviews = review;
			await req.user.save({ runValidators: true, new: true });

			res.status(201).send(review);
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async getAllReviews(req, res) {
		try {
			let filter = {};

			if (req.params.id) {
				filter = { tour: req.params.id };
			}
			const reviews = await Review.find(filter);

			if (!reviews) {
				return res.status(404).send();
			}

			res.status(200).send({
				results: reviews.length,
				reviews,
			});
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async getOneReview(req, res) {
		try {
			const review = await Review.findById(req.params.id);

			if (!review) {
				return res.status(404).send();
			}

			res.status(200).send(review);
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async updateReview(req, res) {
		try {
			const reqObj = Object.keys(req.body);
			const allowedUpdates = ['review', 'rating'];
			const validUpdates = {};

			// filtering updates
			reqObj.forEach(el => {
				if (allowedUpdates.includes(el)) validUpdates[el] = req.body[el];
				return validUpdates;
			});

			// review query and update
			const review = await Review.findByIdAndUpdate(
				req.params.id,
				validUpdates,
				{
					new: true,
					runValidators: true,
				}
			);

			if (!review) {
				return res.status(404).send();
			}

			res.status(200).send({ message: 'Updates successfull!', review });
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async adminUpdateReview(req, res) {
		try {
			const updates = { ...req.body };

			const review = await Review.findByIdAndUpdate(req.params.id, updates, {
				new: true,
			});

			if (!review) {
				return res.status(404).send();
			}
			res.status(200).send({ message: 'Updates successful!', review });
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async deleteReview(req, res) {
		try {
			const review = await Review.findOneAndDelete({
				_id: req.params.id,
				user: req.user,
			});

			if (!review) {
				return res.status(404).send();
			}

			res.status(204).send();
		} catch (e) {
			res.status(400).send(e);
		}
	},

	async adminDeleteReview(req, res) {
		try {
			const rDelete = await Review.findByIdAndDelete(req.params.id);

			if (!rDelete) {
				return res.status(404).send();
			}

			res.status(204).send();
		} catch (e) {
			res.status(400).send(e);
		}
	},
};
