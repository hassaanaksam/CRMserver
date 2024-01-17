const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const router = require("./src/router/user-controller");
const router2 = require("./src/router/customer-controller")
const router3 = require("./src/router/contact-controller")
const cors = require("cors")
const app = express()

app.use(express.json());
app.use(cors());
app.use("/user", router)
app.use("/customer", router2)
app.use("/contact", router3)

mongoose.connect(process.env.MONGODB).then(() => {
    console.log("Database connected..")
}).catch((error) => {
    console.log(error.message)
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port", process.env.PORT)
})
