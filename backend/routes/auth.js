const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const fetchuser = require('../middlewere/fetchuser');
var jwt = require('jsonwebtoken');


const JWT_SECRET = 'Harryisagoodboy';
// Define authentication routes here
// Create a user using POST "api/auth" doesn't require auth

//** Route 1: */
router.post( 
    '/createuser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // password hashing
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // create new user
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            //  console.log(authtoken);

            res.json(authtoken);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ errors: errors.array(), message: 'Validation failed' });

        }
    }
);


//authentication a user using :post/"api/auth/login" no login required
//** Route 2: */
router.post(
    '/login',
    [
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password can not be blank').exists(),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ errors: "please try to login with current user" });

            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(404).json({ errors: "please try to login with current user" });
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            //  console.log(authtoken);

            res.json(authtoken);


        } catch (error) {
            console.error(error);
            return res.status(401).json({ errors: "Invalid credentials" });

        }

    })

//** Route 3: Get loggedin User Details using post "api/auth/getuser" Login required*/
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
