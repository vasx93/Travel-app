import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);

export async function bookTour(tourId) {
	try {
		// API checkout session
		const session = await axios({
			method: 'GET',
			url: `http://localhost:5555/api/booking/checkout-session/${tourId}`,
		});
		console.log(session);

		// Create checkout form + charge card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		});
	} catch (err) {
		console.log(err);
		showAlert('error', err);
	}
}
