import axios from 'axios';
import { showAlert } from './alerts';

export async function login(email, password) {
	try {
		const res = await axios.post('http://localhost:5555/api/users/login', {
			email,
			password,
		});

		if (res.status === 200) {
			showAlert('success', 'Login successful!');
			window.setTimeout(() => {
				location.assign('/');
			}, 1000);
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}

export async function logout() {
	try {
		const res = await axios.get('http://localhost:5555/api/users/logout');

		if (res.status === 200) {
			location.assign('/');
		}
	} catch (e) {
		showAlert('error', 'Error logging out!');
	}
}

export async function updateBase(data) {
	try {
		const res = await axios({
			method: 'PATCH',
			url: 'http://localhost:5555/api/users/me',
			data,
		});

		if (res.status === 200) {
			showAlert('success', 'Update successful!');
			location.assign('/me');
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}

export async function updatePw(password, newPassword, confirmPassword) {
	try {
		const res = await axios({
			method: 'PATCH',
			url: 'http://localhost:5555/api/users/me/password',
			data: { password, newPassword, confirmPassword },
		});

		if (res.status === 200) {
			showAlert('success', 'Update successful!');
			location.assign('/me');
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}
