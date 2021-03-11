require('dotenv').config();
require('./mongodb/mongoose');
const path = require('path');
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const reviewRouter = require('./routes/review-routes');
const viewRouter = require('./routes/view-routes');
const bookingRouter = require('./routes/booking-routes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//*     ~~~~~     MIDDLEWARE     ~~~~~

app.use(express.static(path.join(__dirname, '../public')));

const limiter = rateLimit({
	windowMs: 60 * 60_000,
	max: 10000,
	message: 'Too many requests from this IP, please try again later',
});

app.use(helmet());
app.use(limiter);
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// prevent NoSQL query injection - cross site scripting - parameter polution
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['duration', 'difficulty'] }));

//* CORS POLICY
app.use((req, res, next) => {
	res.setHeader('Content-Security-Policy', 'script-src * ');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

//*     ~~~~~     ROUTE HANDLERS     ~~~~~

app.use('/api/users', userRouter);
app.use('/api/tours', tourRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/bookings', bookingRouter);
app.use('/', viewRouter);

//! requests that pass the route handlers --> not caught

app.all('*', (req, res, next) => {
	const err = new Error(`No route found at ${req.originalUrl}`);
	if (!err.statusCode) err.statusCode = 404;
	next(err);
});

//* GLOBAL ERROR MIDDLEWARE
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	res.status(err.statusCode).send({ message: err.message });
});

const port = process.env.PORT;
app.listen(port, () => {
	console.log(
		`--- Server running in ${process.env.NODE_ENV} enviroment, port ${port}`
	);
});
