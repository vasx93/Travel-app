const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			unique: [true, 'A tour with this name already exists'],
			minlength: 8,
			maxlength: 40,
		},

		slug: String,

		maxGroupSize: {
			type: Number,
			min: 2,
			default: 2,
		},

		difficulty: {
			type: String,
			trim: true,
			required: true,
			enum: ['easy', 'medium', 'difficult'],
		},

		duration: {
			type: Number,
			required: true,
		},

		price: {
			type: Number,
			required: true,
			min: 0,
		},

		discount: {
			type: Number,
			validate: {
				//works only for create()
				validator: function (value) {
					return value < this.price;
				},
				message:
					'Discount price ({VALUE}) must be lower than the regular price',
			},
		},

		summary: {
			type: String,
			trim: true,
		},

		description: {
			type: String,
			trim: true,
		},

		ratingsAverage: {
			type: Number,
			min: 1,
			max: 5,
			set: val => Math.round(val * 10) / 10,
		},

		ratingsQuantity: {
			type: Number,
			default: 0,
		},

		imageCover: {
			type: String,
		},

		images: [String],

		startDates: [Date],

		startLocation: {
			//GeoJSON
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: [Number], //expect a number of coordinates
			address: String,
			description: String,
		},

		//* LOCATIONS EMBEDDED - geospatial
		locations: [
			{
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point',
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],

		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

//* Price index --> mongodb scans through indexes vs collection --> MUCH FASTER
tourSchema.index({ ratingsAverage: 1, price: 1 });

tourSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'tour',
});

// tourSchema.virtual('punoKosta').get(function () {
// 	return this.price * 12;
// });

//*Hide private data methods
tourSchema.methods.toJSON = function () {
	const tour = this.toObject();

	delete tour.slug;
	delete tour.__v;
	delete tour.secretTour;
	delete tour.id;

	return tour;
};

//* DOCUMENT MIDDLEWARE PRE-SAVE HOOK -- runs before .save()  .create()
//* embedding
// tourSchema.pre('save', async function (next) {
// 	const guides = this.guides.map(async id => await User.findById(id));

// 	this.guides = await Promise.all(guides);
// 	next();
// });

// changing url
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

//* QUERY MIDDLEWARE --> all queries starting with find

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: 'name email photo role',
	});
	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
