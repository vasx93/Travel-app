import '@babel/polyfill';
import { login, logout, updateBase, updatePw } from './userAccount';

import { bookTour } from './stripe';

const loginForm = document.querySelector('#samoodbrana');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateAccount = document.querySelector('.form-user-data');
const updatePwForm = document.querySelector('.form-user-settings');
const checkoutBtn = document.getElementById('book-tour');

// //* LOGIN EVENTS

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
		form.append('photo', document.getElementById('photo').files[0]);

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
		e.target.textContent = 'Processing...';
		// data from DOM element
		const tour = e.target.dataset.tourId;

		bookTour(tour);
	});
}
