const Tour = require('../mongodb/models/tour-model');
const multer = require('multer');
const sharp = require('sharp');
const { qsHelper } = require('query-lib-vr');

//* FILE UPLOAD

const upload = multer({
	limits: {
		fileSize: 5_000_000,
	},
	storage: multer.memoryStorage(),
	fileFilter(req, file, cb) {
		if (!file.mimetype.startsWith('image')) {
			cb(
				new Error('Uploads in jpg/jpeg/png format only, with a limit of 1mb!'),
				false
			);
		}
		cb(null, true);
	},
});

module.exports = {
	upload,

	async uploadImg(req, res, next) {
		if (!req.files.imageCover || !req.files.images) {
			return next();
		}
		//* all upload elements need to be on req.body so next middleware can use object.keys(req.body)
		// image Cover
		req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

		await sharp(req.files.imageCover[0].buffer)
			.resize(2000, 1333)
			.jpeg()
			.toFile(`public/img/tours/${req.body.imageCover}`);

		// Images
		req.body.images = [];

		const images = req.files.images.map(async (file, i) => {
			const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

			await sharp(file.buffer)
				.resize(500, 500)
				.jpeg()
				.toFile(`public/img/tours/${filename}`);

			req.body.images.push(filename);
		});
		await Promise.all(images);

		next();
	},

	async topFiveTours(req, res, next) {
		req.query.limit = '5';
		req.query.sort = '-ratingsAverage_price';
		req.query.fields = 'name_price_ratingsAverage_duration_difficulty_summary';
		next();
	},

	async longestFiveTours(req, res, next) {
		req.query.limit = '5';
		req.query.sort = '-duration';
		req.query.fields = 'name_price_ratingsAverage_duration_difficulty_summary';
		next();
	},

	async getAllTours(req, res) {
		try {
			// npm package query-lib-vr
			const tours = await qsHelper(Tour, req, res);

			if (tours.length === 0) {
				return res.status(200).send({ message: 'No results match this query' });
			}
			res.status(200).send({ results: tours.length, tours });
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	async getTour(req, res) {
		try {
			const tour = await Tour.findById(req.params.id).populate({
				path: 'reviews',
				select: '-__v -id',
			});

			if (!tour) {
				return res.status(404).send({ message: 'No tour found' });
			}
			res.status(200).send(tour);
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	async createTour(req, res) {
		try {
			const tour = await Tour.create({
				name: req.body.name,
				maxGroupSize: req.body.maxGroupSize,
				difficulty: req.body.difficulty,
				duration: req.body.duration,
				price: req.body.price,
				discount: req.body.discount,
				summary: req.body.summary,
				description: req.body.description,
				ratingsAverage: req.body.ratingsAverage,
				ratingsQuantity: req.body.ratingsQuantity,
				imageCover: req.body.imageCover,
				images: req.body.images,
				startDates: req.body.startDates,
				startLocation: req.body.startLocation,
				locations: req.body.locations,
				guides: req.body.guides,
			});

			if (!tour) {
				return res.status(400).send();
			}

			res.status(201).send({ message: 'Tour created!', tour });
		} catch (err) {
			res.status(500).send(err.message);
		}
	},

	async updateTour(req, res) {
		try {
			// const reqObj = Object.keys(req.body);
			// const allowedUpdates = [
			// 	'name',
			// 	'duration',
			// 	'maxGroupSize',
			// 	'difficulty',
			// 	'ratingsAverage',
			// 	'ratingsQuantity',
			// 	'price',
			// 	'summary',
			// 	'description',
			// 	'imageCover',
			// 	'images',
			// 	'startDates',
			// 	'startLocation',
			// 	'locations',
			// 	'day',
			// 	'guides',
			// ];
			// const validUpdates = {};

			// // filtering req obj
			// reqObj.forEach(el => {
			// 	if (allowedUpdates.includes(el)) validUpdates[el] = req.body[el];
			// 	return validUpdates;
			// });

			// const tour = await Tour.findByIdAndUpdate(req.params.id, validUpdates, {
			// 	new: true,
			// 	runValidators: true,
			// });

			const locArray = req.body.locations;
			const tour = await Tour.findByIdAndUpdate(
				req.params.id,
				{
					name: req.body.name,
					duration: req.body.duration,
					difficulty: req.body.difficulty,
					price: req.body.price,
					ratingsAverage: req.body.ratingsAverage,
					ratingsQuantity: req.body.ratingsQuantity,
					maxGroupSize: req.body.maxGroupSize,
					startLocation: req.body.startLocation,
					summary: req.body.summary,
					description: req.body.description,
					startDates: req.body.startDates,
					locations: req.body.locations,
				},
				{
					new: true,
					runValidators: true,
				}
			);

			if (!tour) {
				return res.status(404).send({ message: 'Tour not found' });
			}

			res.status(200).send({ message: 'Tour updated!', tour });
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	async deleteTour(req, res) {
		try {
			const tour = await Tour.findByIdAndDelete(req.params.id);

			if (!tour) {
				return res.status(404).send();
			}
			res.status(204).send();
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	//*agreggation pipline -- best for stats
	async getTourStats(req, res) {
		try {
			//we pass stage objects into array pipeline

			const stats = await Tour.aggregate([
				{
					$match: { ratingsAverage: { $gte: 4.7 } },
				},

				{
					$group: {
						_id: '$difficulty',
						numTours: { $sum: 1 },
						numRatings: { $sum: '$ratingsQuantity' },
						avgRating: { $avg: '$ratingsAverage' },
						avgPrice: { $avg: '$price' },
						minPrice: { $min: '$price' },
						maxPrice: { $max: '$price' },
						avgDuration: { $avg: '$duration' },
					},
				},
				{
					$sort: { numTours: -1 },
				},
			]);

			if (!stats) {
				return res.status(404).send();
			}

			res.status(200).send(stats);
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	async getMonthlyPlan(req, res) {
		try {
			const year = req.params.year * 1; // = parseInt()  year 2021

			const plan = await Tour.aggregate([
				{
					$unwind: '$startDates',
				},
				{
					$match: {
						startDates: {
							$gte: new Date(`${year}-01-01`),
							$lte: new Date(`${year}-12-31`),
						},
					},
				},
				{
					$group: {
						_id: { $month: '$startDates' },
						numToursInMonth: { $sum: 1 },
						tours: { $push: '$name' },
					},
				},
				{
					$sort: { numToursInMonth: -1 },
				},
				{
					$addFields: { month: '$_id' },
				},
				{
					$project: { _id: 0 },
				},
			]);

			if (!plan) {
				return res.staus(404).send();
			}
			res.status(200).send(plan);
		} catch (err) {
			res.status(400).send(err.message);
		}
	},

	// nested route
	async tourBookings(req, res) {
		try {
			const tour = await Tour.findById(req.params.id).populate('bookings');

			if (!tour) {
				return res.status(404).send();
			}

			res.status(200).send(tour.bookings);
		} catch (err) {
			res.status(400).send(err.message);
		}
	},
};
