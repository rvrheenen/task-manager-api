const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "rickvanrheenen@hotmail.com",
        subject: "Thanks for joining in",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "rickvanrheenen@hotmail.com",
        subject: "Sad to see you go",
        text: `Goodbye, ${name}. We will miss you, good bye my friend!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}