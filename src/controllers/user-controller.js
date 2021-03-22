const User = require('../mongodb/models/user-model');
const {
	welcomeEmail,
	cancelAccountEmail,
	resetPasswordEmail,
	reactivateAccountEmail,
} = require('../emails/email');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const { permittedCrossDomainPolicies } = require('helmet');

//* COOKIES JWT

let cookieOptions = {
	expires: new Date(
		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60_000
	),
	secure: true,
	
};
if (process.env.NODE_ENV === 'development') {
	cookieOptions.secure = false
	cookieOptions.httpOnly: true,
}

//*     FILE UPLOAD
const upload = multer({
	limits: {
		fileSize: 2_000_000,
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

	async uploadPhoto(req, res, next) {
		if (!req.file) {
			return next();
		}
		req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

		await sharp(req.file.buffer)
			.resize(500, 500)
			.jpeg()
			.toFile(`public/img/users/${req.file.filename}`);

		next();
	},

	async createUser(req, res) {
		try {
			const user = await User.create({
				role: req.body.role,
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				photo: req.body.photo,
			});

			if (!user) {
				return res.status(400).send();
			}

			res.status(201).send({ message: 'User created successfully!', user });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async getUser(req, res) {
		try {
			const user = await User.findById(req.params.id);

			if (!user) {
				return res.status(404).send({ message: 'No user found!' });
			}

			res.status(200).send(user);
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async getAllUsers(req, res) {
		try {
			const users = await User.find();

			res.status(200).send({ results: users.length, users });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async readProfile(req, res) {
		try {
			res.status(200).send(req.user);
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async updateUser(req, res) {
		try {
			// handling request object
			const updates = Object.keys(req.body);
			const allowedUpdates = ['name', 'email', 'photo'];
			let validUpdates = {};

			// filtering updates
			updates.forEach(el => {
				if (allowedUpdates.includes(el)) {
					validUpdates[el] = req.body[el];
				}
				return validUpdates;
			});

			// saving photos
			if (req.file) {
				validUpdates.photo = req.file.filename;
			}

			const user = await User.findByIdAndUpdate(req.user._id, validUpdates, {
				new: true,
				runValidators: true,
			});

			if (!user) {
				return res.status(404).send();
			}

			res.status(200).send({ message: 'user updated!', user });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async updatePassword(req, res) {
		try {
			const user = await User.findById(req.user._id).select('+password');

			// returns true or false
			const isValid = await user.comparePassword(
				req.body.password,
				user.password
			);

			if (!isValid) {
				return res.status(401).send('Passwords do not match!');
			}

			user.password = req.body.newPassword;
			await user.save();

			res.status(200).send({ message: 'Updates successful!', user: req.user });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async deleteProfile(req, res) {
		try {
			req.user.deactivatedAt = Date.now();
			req.user.active = false;
			req.user.token = undefined;
			req.token = undefined;
			req.user.reactivateAccountToken = undefined;
			req.user.reactivateAccountExpires = undefined;

			cancelAccountEmail(user, process.env.LOCAL_URL);

			await req.user.save();

			res.status(204).send({ message: 'User deleted' });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async deleteUser(req, res) {
		try {
			const user = await User.findByIdAndDelete(req.params.id);

			if (!user) {
				return res.status(404).send({ message: 'No user found!' });
			}

			res.status(204).send();
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async requestForReactivate(req, res) {
		try {
			const user = await User.findOne({ email: req.body.email });

			if (!user) {
				return res.status(404).send();
			}
			const reactivateToken = await user.createReactivateAccountToken();

			//save hashed token in db
			await user.save({ validateBeforeSave: false });

			// turn off validation & send url with token
			const resetURL = `${req.protocol}://${req.get(
				'host'
			)}/api/users/account/activate/${reactivateToken}`;

			reactivateAccountEmail(user, resetURL);

			res.status(200).send({ message: 'Token sent to email' });
		} catch (err) {
			user.reactivateAccountToken = undefined;
			user.reactivateAccountExpires = undefined;
			await user.save({ validateBeforeSave: false });

			res.status(404).send({ message: 'Wrong credentials!' });
		}
	},

	async reactivateProfile(req, res) {
		try {
			//hash the token in url
			const hashedToken = crypto
				.createHash('sha256')
				.update(req.params.reactivateToken)
				.digest('hex');

			// find user by hashed token
			const user = await User.findOne({
				reactivateAccountToken: hashedToken,
				reactivateAccountExpires: { $gt: Date.now() },
			});

			if (!user) {
				return res.status(404).send({ message: 'No user found!' });
			}

			// reactivate user & reset token
			user.active = true;
			user.reactivatedAt = Date.Now();
			user.reactivateAccountToken = undefined;
			user.reactivateAccountExpires = undefined;

			await user.save();

			// login user via JWT
			const token = await user.generateToken();

			res
				.status(200)
				.send({ message: 'Reactivated account successfully!', token });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async adminReactivateProfile(req, res) {
		try {
			const user = await User.findOne({ email: req.body.email, active: false });

			if (!user) {
				return res.status(404).send({ message: 'No account to reactivate' });
			}

			user.active = true;
			user.reactivatedAt = Date.now();
			user.reactivateAccountToken = undefined;
			user.reactivateAccountExpires = undefined;
			await user.save();

			res
				.status(200)
				.send({ message: 'Profile reactivated successfully!', user });
		} catch (err) {
			res.status(400).send({ message: 'Something went wrong' });
		}
	},

	//*     ~~~~~     USER ACCOUNTS     ~~~~~

	async signUp(req, res) {
		try {
			// Create and save user to DB
			const userObj = { ...req.body };
			const user = await User.create(userObj);

			if (!user) {
				return res.status(400).send();
			}

			// Log user in and send jwt
			const token = await user.generateToken(user._id);
			res.cookie('jwt', token, cookieOptions);

			// Send a welcome email to a new user
			const url = `${req.protocol}://${req.get('host')}/me`;
			welcomeEmail(user, url);

			res
				.status(201)
				.send({ message: 'User created successfully!', user, token });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async loginUser(req, res) {
		const { email, password } = req.body;

		try {
			const user = await User.loginUser(email, password);

			if (!user) {
				return res.status(401).send();
			}
			const token = await user.generateToken();
			res.cookie('jwt', token, cookieOptions);

			res.status(200).send({ message: 'Login successful', user, token });
		} catch (err) {
			res.status(401).send(err);
		}
	},

	async logoutUser(req, res) {
		try {
			// client part logout = fake jwt
			res.cookie('jwt', 'nothing', {
				expires: new Date(Date.now() + 10_000),
				httpOnly: true,
			});

			// api and db logout
			req.token = undefined;
			req.user.token = undefined;

			await req.user.save();

			res.status(200).send({ message: 'Logout successful!' });
		} catch (err) {
			res.status(400).send({ error: err.message });
		}
	},

	async forgotPassword(req, res) {
		try {
			const user = await User.findOne({ email: req.body.email });

			if (!user) {
				throw new Error();
			}

			const resetToken = await user.createPasswordResetToken();

			await user.save({ validateBeforeSave: false });

			const resetURL = `${req.protocol}://${req.get(
				'host'
			)}/api/users/account/resetPassword/${resetToken}`;

			resetPasswordEmail(user, resetURL);

			res.status(200).send({ message: 'Token sent to email' });
		} catch (err) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
			await user.save({ validateBeforeSave: false });

			res.status(404).send({ message: 'Wrong credentials!' });
		}
	},

	async resetPassword(req, res) {
		try {
			// hash the token in url
			const hashedToken = crypto
				.createHash('sha256')
				.update(req.params.token)
				.digest('hex');

			// find user by hashed token & compare expiry
			const user = await User.findOne({
				resetPasswordToken: hashedToken,
				resetPasswordExpires: { $gte: Date.now() },
			});

			if (!user) {
				return res.status(404).send({ message: 'No user found!' });
			}
			//updating password and reset tokens
			user.password = req.body.password;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			// saving user document
			await user.save();

			// login user via JWT stored in cookies
			const token = await user.generateToken();
			res.cookie('jwt', token, cookieOptions);

			// sending response object to user
			res
				.status(200)
				.send({ message: 'Password updated successfully!', token });
		} catch (err) {
			res.status(400).send({ message: 'Something went wrong' });
		}
	},
};
