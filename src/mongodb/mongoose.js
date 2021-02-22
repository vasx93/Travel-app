const mongoose = require('mongoose');

mongoose
	.connect(process.env.DB_LOCAL, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log('MONGODB connection successful'))
	.catch(err => console.log(err));
