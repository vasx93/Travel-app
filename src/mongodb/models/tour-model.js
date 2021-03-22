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

		startLocation: String,

		locations: [String],

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

tourSchema.virtual('bookings', {
	ref: 'Booking',
	localField: '_id',
	foreignField: 'tour',
});

//*Hide private data methods
tourSchema.methods.toJSON = function () {
	const tour = this.toObject();

	delete tour.slug;
	delete tour.__v;
	delete tour.secretTour;
	delete tour.id;

	return tour;
};

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
