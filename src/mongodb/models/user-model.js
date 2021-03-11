const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			minlength: 2,
			maxlength: 99,
		},

		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
			validate(value) {
				if (!isEmail(value)) {
					throw new Error('Invalid email format!');
				}
			},
		},

		password: {
			type: String,
			trim: true,
			required: true,
			minlength: 6,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error('Password cannot contain -password-');
				}
			},
		},

		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,

		photo: {
			type: String,
			default: 'default.jpg',
		},

		userReviews: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Review',
			},
		],

		userTours: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Tour',
			},
		],

		token: {
			type: String,
		},

		role: {
			type: String,
			enum: ['user', 'guide', 'admin'],
			default: 'user',
		},

		active: {
			type: Boolean,
			default: true,
		},

		deactivatedAt: Date,
		reactivatedAt: Date,

		reactivateAccountToken: String,
		reactivateAccountExpires: Date,
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//!  password for all admins/my users is >>  babaroga
//!  password for all test users is >>  pass1234

//*Hide private data methods
userSchema.methods.toJSON = function () {
	const user = this.toObject();

	if (user.role === 'user') {
		delete user.password;
		delete user.passwordChangedAt;
		delete user.resetPasswordToken;
		delete user.resetPasswordExpires;
		delete user.reactivateAccountToken;
		delete user.reactivateAccountExpires;
		delete user.deactivatedAt;
		delete user.reactivatedAt;
		delete user.createdAt;
		delete user.updatedAt;
		delete user.active;
		delete user.token;
		delete user.__v;
		delete user.id;
	}

	return user;
};

//*statics are class methods used on Model
userSchema.statics.loginUser = async (email, password) => {
	//prototype error so we can have custom msg
	function myError(msg) {
		this.msg = msg;
	}
	myError.prototype = new Error();

	const user = await User.findOne({ email });

	if (!user || user.active === false) {
		throw new myError('Account not active');
	}

	const match = await user.comparePassword(password, user.password);

	if (!match) {
		throw new myError('Wrong credentials');
	}

	return user;
};

//* statics are used on Model
userSchema.statics.validateToken = async function (token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const user = await User.findOne({ _id: decoded._id });
	if (!user) {
		throw new Error();
	}

	return user;
};

//*  methods are used on documents
userSchema.methods.generateToken = async function () {
	const user = this;

	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	user.token = token;
	await user.save();

	return token;
};

userSchema.methods.comparePassword = async function (plainPw, userPw) {
	return await bcrypt.compare(plainPw, userPw);
};

userSchema.methods.createPasswordResetToken = async function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	//hashing the reset token
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpires = Date.now() + 15 * 60 * 60;

	return resetToken;
};

userSchema.methods.createReactivateAccountToken = async function () {
	//create random string token to send to user via email
	const token = crypto.randomBytes(32).toString('hex');

	this.reactivateAccountToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');

	this.reactivateAccountExpires = Date.now() + 15 * 60 * 60;

	return token;
};

//* pre-save HASH hook --> works on create-save-update
userSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('password' || user.isNew)) {
		user.password = await bcrypt.hash(user.password, 6);
		user.passwordChangedAt = Date.now() - 1000;
	}
	next();
});

//* QUERY MIDDLEWARE --> all queries starting with find
// userSchema.pre(/^find/, function (next) {
// 	this.fetchTime = Date.now();
// 	next();
// });
// userSchema.post(/^find/, function (docs, next) {
// 	console.log(`~~ USER query time is ${Date.now() - this.fetchTime}ms`);
// 	next();
// });

const User = new mongoose.model('User', userSchema);
module.exports = User;
