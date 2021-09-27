const express = require('express')
const router = express.Router();

const {check} = require('express-validator')

const {
    registerUser,
    loginUser,
    logoutUser,
} = require('../controller/users.js')

const {
    authUser
} = require('../middleware/authenticate')

const middlewares = [check('email').isEmail().normalizeEmail(), check('password').trim().isLength(5)]
// Unprotected
router.post('/login', loginUser)
router.post('/register',registerUser)
router.get('/login',(req,res)=>res.send("req receive successfully!!!"))

// Protected
router.get('/logout',authUser,logoutUser)



module.exports = router;