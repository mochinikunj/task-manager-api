const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    const emailData = {
        to: email,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how you get along with the app.`
    };

    sendMail(emailData);
};

const sendCancelationMail = (email, name) => {
    const emailData = {
        to: email,
        subject: 'Confirmation for account cancelation',
        text: `Can you pls reply back with your feeback ${name}, Telling us the reason of account cancelation.`
    };

    sendMail(emailData);
};

const sendMail = (emailData) => {
    sgMail.send({
        to: emailData.to,
        from: 'mochinikunj2@gmail.com',
        subject: emailData.subject,
        text: emailData.text
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationMail
};