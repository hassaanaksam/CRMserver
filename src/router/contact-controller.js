const express = require("express");
const Contact = require("../model/contact")
const router3 = express.Router();

router3.post("/contact", async (req, res) => {
    try {
        const contactsData = req.body;
        const contact = new Contact(contactsData);
        const contactData = await contact.save()

        res.status(200).send({ message: "Contact successfully saved", data: contactData.data })
    } catch (error) {
        res.status(400).send(error)
    }
})

router3.get('/contact', async (req, res) => {

    const contacts = await Contact.find();

    res.json({
        status: true,
        contacts: contacts
    })

})

module.exports = router3;