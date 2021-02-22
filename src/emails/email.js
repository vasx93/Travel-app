const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SG_API_KEY);

const hostMail = process.env.HOST_MAIL;

module.exports = {
	welcomeEmail(user, url) {
		sgMail.send({
			to: user.email,
			from: hostMail,
			subject: `${user.name}, welcome to your Touring Experience!`,
			text: `Thank you for joining us here at Touring. You can check out more info at this link ${url}`,
		});
	},

	cancelAccountEmail(user, url) {
		sgMail.send({
			to: user.email,
			from: hostMail,
			subject: `Sorry to see you leave ${user.name}!`,
			text: `If you could state out the reason of your leave, it would be very helpful in the future. Come visit us again at ${url} GGWP`,
		});
	},

	resetPasswordEmail(user, url) {
		sgMail.send({
			to: user.email,
			from: hostMail,
			subject: `Reset your password ${user.name} (valid for 15 mins)`,
			text: `Here is your reset password link:
      ${url}
       If you did not forget your password, ignore this email`,
		});
	},

	reactivateAccountEmail(user, url) {
		sgMail.send({
			to: user.email,
			from: hostMail,
			subject: `Reactivate your account ${user.name}!`,
			text: `${user.name}Here is the link to reactivate your account: ${url} `,
		});
	},
};
