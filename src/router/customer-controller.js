const express = require("express");
const Customer = require("../model/customer.js");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const router2 = express.Router();

router2.post("/signup", async (req, res) => {
    try {
        const customersData = req.body;
        const customer = new Customer(customersData);
        const customerData = await customer.save()

        res.status(200).send({ message: "Customer successfully saved", data: customerData.data })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            res.status(400).send({ message: 'Validation error', errors: validationErrors });
        } else {
            res.status(400).send({ message: 'Error saving customer', error: error.message });
        }
    }
})

router2.put("/customer/:sid", async (req, res) => {
    const customerId = req.params.sid;
    if (!customerId) {
        return res.json({
            status: false,
            message: "Please provide customer id"
        })
    }
    const ExistingCustomer = await Customer.findById(customerId);

    if (!ExistingCustomer) {
        return res.status(404).json({
            status: false,
            message: "Customer not found."
        })
    }
    await Customer.findByIdAndUpdate(customerId, req.body).then(async (data) => {

        res.status(200).send({ message: "Customer successfully saved", data: data })

    }).catch((error) => {
        res.status(400).send(error)
    })
})

router2.post('/sendemail', async (req, res) => {

    const { to, subject, message } = req.body;

    const emailData = {
        to,
        from: process.env.EMAIL,
        subject,
        text: message,
    };

    sgMail.send(emailData)
        .then(() => {
            res.status(200).send('Email sent successfully');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email');
        });
});

router2.post('/sendemails', async (req, res) => {

    const { to, subject, message } = req.body;

    const toEmails = Array.isArray(to) ? to : [to];

    const emailData = {
        to: toEmails,
        from: 'hassaantahirrock@gmail.com',
        subject,
        text: message,
    };

    sgMail.send(emailData)
        .then(() => {
            res.status(200).send('Email sent successfully');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email');
        });
});

router2.post('/sendsms', (req, res) => {
    const { to, body } = req.body;
    client.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        body,
    })
        .then((message) => {
            console.log(`Message sent: ${message.sid}`);
            res.json({ success: true, message: `Message sent: ${message.sid}` });
        })
        .catch((error) => {
            console.error(`Error sending SMS: ${error}`);
            res.status(500).json({ success: false, error: 'Failed to send SMS' });
        });
});

router2.get('/customer', async (req, res) => {

    const customer = await Customer.find();

    res.json({
        status: true,
        customer: customer
    })
})

router2.get('/allemails', async (req, res) => {
    try {
        const customers = await Customer.find({}, 'email');
        const emails = customers.map(customer => customer.email);
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router2.delete('/delete/:sid', async (req, res) => {
    const customerId = req.params.sid;
    if (!customerId) {
        return res.json({
            status: false,
            message: "Please provide customer id"
        })
    }
    const ExistingCustomer = await Customer.findById(customerId);

    if (!ExistingCustomer) {
        return res.status(404).json({
            status: false,
            message: "Customer not found."
        })
    }
    await Customer.findByIdAndDelete(customerId).then((data) => {
        return res.status(200).json({
            status: true,
            message: "Customer successfully deleted.",
            deletedCustomer: data
        })
    })
})

router2.post('/search', async (req, res) => {

    const Name = req.body.name
    const customer = await Customer.find({ name: { $regex: new RegExp(Name, 'i') } });

    res.json({
        status: true,
        customer: customer
    })

})
module.exports = router2;