import axios from 'axios';
import { showAlert } from './alerts';

export async function deleteTour(id) {
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/tours/${id}`,
		});

		if (res.status === 204) {
			showAlert('success', 'Delete successful!');
			window.setTimeout(() => {
				location.assign('/');
			}, 1000);
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}
export async function deleteUser(id) {
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/users/${id}`,
		});

		if (res.status === 204) {
			showAlert('success', 'Delete successful!');
			window.setTimeout(() => {
				location.assign('/admin-panel/users');
			}, 1000);
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}

//* ~~~ UPDATE ~~~

export async function updateTourText(data, id) {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/tours/${id}`,
			data,
		});

		if (res.status === 200) {
			showAlert('success', 'Update successful!');
			window.setTimeout(() => {
				location.assign(`/admin-panel/tours/${id}`);
			}, 1000);
		}
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
}
