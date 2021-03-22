import '@babel/polyfill';
import { signup, login, logout, updateBase, updatePw } from './userAccount';
import { updateTourText, deleteTour, deleteUser } from './admin';

import { bookTour } from './stripe';

const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#samoodbrana');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateAccount = document.querySelector('.form-user-data');
const updatePwForm = document.querySelector('.form-user-settings');
const checkoutBtn = document.getElementById('book-tour');
const deleteTourBtn = document.getElementById('delete-tour');

const textFormBtn = document.querySelector('#text-form');
const guideFormBtn = document.querySelector('#guide-form');
const photoFormBtn = document.querySelector('#photo-form');

//* LOGIN EVENTS

if (signupForm) {
	signupForm.addEventListener('submit', e => {
		e.preventDefault();

		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		signup(name, email, password);
	});
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		login(email, password);
	});
}

if (logoutBtn) {
	logoutBtn.addEventListener('click', logout);
}

//* USER ACCOUNT EVENTS

if (updateAccount) {
	updateAccount.addEventListener('submit', e => {
		e.preventDefault();

		//email password and photo form
		const form = new FormData();

		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		if (document.getElementById('photo').files.length !== 0) {
			form.append('photo', document.getElementById('photo').files[0]);
		}

		updateBase(form);
	});
}

if (updatePwForm) {
	updatePwForm.addEventListener('submit', e => {
		e.preventDefault();

		const pw = document.getElementById('password-current').value;
		const newPw = document.getElementById('password').value;
		const cPw = document.getElementById('password-confirm').value;
		updatePw(pw, newPw, cPw);
	});
}

//* BOOKING

if (checkoutBtn) {
	checkoutBtn.addEventListener('click', e => {
		// data from DOM element
		const tour = e.target.dataset.tourId;
		bookTour(tour);
	});
}

//* ~~~ ADMIN PANEL ~~~

if (textFormBtn) {
	textFormBtn.addEventListener('submit', ev => {
		ev.preventDefault();

		const form = new FormData();

		const id = document.getElementById('id').value;
		form.append('name', document.getElementById('name').value);
		form.append('duration', document.getElementById('duration').value);
		form.append('difficulty', document.getElementById('difficulty').value);
		form.append('price', document.getElementById('price').value);
		form.append(
			'ratingsAverage',
			document.getElementById('ratingsAverage').value
		);
		form.append(
			'ratingsQuantity',
			document.getElementById('ratingsQuantity').value
		);
		form.append('maxGroupSize', document.getElementById('maxGroupSize').value);
		form.append(
			'startLocation',
			document.getElementById('startLocation').value
		);
		form.append('summary', document.getElementById('summary').value);
		form.append('description', document.getElementById('description').value);

		form.append(
			'startDates',
			document.getElementsByClassName('startDates').value
		);

		const locations = document.getElementsByClassName('locations');
		const locArray = [];

		[...locations].forEach(el => {
			locArray.push(el.value);
		});
		form.append('locations', locArray);

		// console.log(form);
		updateTourText(form, id);
	});
}
//TODO jebiga ili namesti u kontroleru da prima podatke gde treba ili izbrisi iz baze i iz svih jsona nepotrebne

if (deleteTourBtn) {
	deleteTourBtn.addEventListener('click', e => {
		const id = e.target.dataset.tourId;
		// console.log(id);
		deleteTour(id);
	});
}

const userIDs = Array.from(document.querySelectorAll('.delete-user'));

userIDs.forEach(el => {
	el.addEventListener('click', ev => {
		const id = ev.target.dataset.userId;
		// console.log(ev.target);
		// console.log(id);
		deleteUser(id);
	});
});

// document.body.addEventListener('click', ev => {
// 	if (ev.target.classList.contains('delete-user')) {
// 		const id = ev.target.dataset.userId;
// 		console.log(ev.target);
// 		console.log(id);
// 		deleteUser(id);
// 	}
// });
