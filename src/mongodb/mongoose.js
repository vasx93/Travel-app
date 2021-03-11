const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'development') {
	mongoose
		.connect(process.env.DB_LOCAL, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})
		.then(() => console.log('MONGODB connection successful'))
		.catch(err => console.log(err));
} else if (process.env.NODE_ENV === 'production') {
	mongoose
		.connect(process.env.DB_ATLAS, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})
		.then(() => console.log('MONGODB connection successful'))
		.catch(err => console.log(err));
}
