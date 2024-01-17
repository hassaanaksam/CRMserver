const express = require("express");
const User = require("../model/user.js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const router = express.Router();

const secretKey = crypto.randomBytes(32).toString('hex');

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Failed to authenticate token" });
      }
      req.userId = decoded.userId;
      next();
    })
  }

  router.post("/signup", async (req, res) => {
    try {
      const usersData = req.body;
      const user = new User(usersData);
      const userData = await user.save();
      res.status(200).send({ message: "User successfully saved", data: userData.data });
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Log in a user and issue a JWT
  router.post("/login", async (req, res) => {
    try {
      const user = req.body;
      if (user.email && user.password) {
        const userData = await User.findOne({ email: user.email });
        if (userData) {
          if (user.password === userData.password) {
            // Sign a JWT and send it to the client
            const token = jwt.sign({ userId: userData._id }, secretKey, { expiresIn: "1h" });
            res.status(200).send({ message: "Successfully logged in", token , userData});
          } else {
            res.status(401).send({ message: "Invalid password" });
          }
        } else {
          res.status(404).send({ message: "User not found" });
        }
      } else {
        res.status(400).send({ message: "Invalid request, missing email or password" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  
  // Example of a protected route
  router.get("/secure", verifyToken, async (req, res) => {
    // Only accessible with a valid JWT
    const userId = req.userId;
    // Use userId to retrieve user-specific data or perform actions
    res.json({
      status: true,
      message: "Access granted to protected route",
      userId,
    });
  });

router.get('/user', async (req, res) => {

  const user = await User.find();

    res.json({
        status: true,
        user: user
    })

})

router.post('/search', async (req, res) => {
  
  const Name = req.body.name  
  const user = await User.find({ name: { $regex: new RegExp(Name, 'i') } });

    res.json({
        status: true,
        user: user
    })

})

router.delete('/delete/:sid', async (req, res) => {
    const userId = req.params.sid;
    if (!userId) {
        return res.json({
            status: false,
            message: "Please provide user id"
        })
    }
    const ExistingUser = await User.findById(userId);

    if (!ExistingUser) {
        return res.status(404).json({
            status: false,
            message: "User not found."
        })
    }
    await User.findByIdAndDelete(userId).then((data) => {
        return res.status(200).json({
            status: true,
            message: "User successfully deleted.",
            deletedUser: data
        })
    })
})

router.put("/user/:sid", async (req, res) => {
    const userId = req.params.sid;
    if (!userId) {
        return res.json({
            status: false,
            message: "Please provide user id"
        })
    }
    const ExistingUser = await User.findById(userId);

    if (!ExistingUser) {
        return res.status(404).json({
            status: false,
            message: "User not found."
        })
    }
    await User.findByIdAndUpdate(userId, req.body).then(async (data) => {
    
            res.status(200).send({ message: "User successfully saved", data: data })
        
    }).catch((error) => {
        res.status(400).send(error)
    })
})

router.get("/loginbyid/:n", async (req, res) => {
    try {
        const id = req.params.n
        const userData = await User.findById(id)
        res.status(200).send({ message: "Successfully get user data", data: userData })
    } catch (error) {
        res.status(404).send(error)
    }
})


module.exports = router;