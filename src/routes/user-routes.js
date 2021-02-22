const express = require('express');
const { checkToken, isAvailableFor } = require('../middleware/helpers');
const {
	createUser,
	readProfile,
	getUser,
	getAllUsers,
	updateUser,
	deleteUser,
	deleteProfile,
	signUp,
	loginUser,
	logoutUser,
	forgotPassword,
	resetPassword,
	requestForReactivate,
	reactivateProfile,
	adminReactivateProfile,
	updatePassword,
	uploadPhoto,
	upload,
} = require('../controllers/user-controller');

const router = express.Router();

//* login routes
router.post('/signup', signUp);
router.post('/login', loginUser);
router.get(
	'/logout',
	checkToken,
	isAvailableFor('user', 'guide', 'admin'),
	logoutUser
);

//* reset pw
router.post('/account/forgotPassword', forgotPassword);
router.patch('/account/resetPassword/:token', resetPassword);

//* reactivate old profile
router.post('/account/reactivate', requestForReactivate);
router.get('/account/activate/:reactivateToken', reactivateProfile);

router.patch(
	'/admin/reactivate',
	checkToken,
	isAvailableFor('admin'),
	adminReactivateProfile
);

//* PROTECTED ROUTES
router.use(checkToken);

// router.patch('/me/photo', upload.single('photo'), uploadPhoto);
router.patch('/me/password', updatePassword);

router
	.route('/me')
	.get(isAvailableFor('user', 'admin'), readProfile)
	.patch(
		isAvailableFor('user', 'admin'),
		upload.single('photo'),
		uploadPhoto,
		updateUser
	)
	.delete(isAvailableFor('user', 'admin'), deleteProfile);

//* ADMIN ROUTES
router.use(isAvailableFor('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
