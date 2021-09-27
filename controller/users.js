const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt  = require('jsonwebtoken')

const redis = require('redis')
const url = require('url')
let redisClient
if (process.env.REDISCLOUD_URL) {
    let redisURL = url.parse(process.env.REDISCLOUD_URL)
    redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true })
    redisClient.auth(redisURL.auth.split(":")[1])
} else {
    redisClient = redis.createClient()
}
const JWTR = require('jwt-redis').default
const jwtr = new JWTR(redisClient)

const Users = require('../model/users')
const {ValidateEmail} = require('../helper/validatorMiddleware')
const {validationResult } = require('express-validator')
dotenv.config()

/**
 * api      POST @/api/logger/register
 * desc     @register for logger access only
 */
const registerUser = async (req,res) => {
    try {
        
    const {
        name,
        email,
        password
    } = req.body;

    const validateEmailId = ValidateEmail(email);
    if (password.length === 0) throw {
        "status":0,
        "message":"Please enter password!"
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password,salt);

    console.log(`password hash: ${passwordHash}`)

    if (validateEmailId) {
        const user = await new Users({
            name,
            email,
            isSuperAdmin:false,
            passwordHash
        })
        const savedUser = await user.save(user);

        if (savedUser) {
            res.status(201).json({"status":1,"message":'Registration successfull!','name':savedUser.name})

        }else throw {
            "status":0,
            "message":"some error happend during registration"
        }

    }else throw {
        "status":0,
        "message":"Invalid email address."
    }

    } catch (error) {
        console.log(error);
        if (error.code === 11000) res.status(409).json({"status":0,"message":error.message,"errorMessage":"Account already exist"})
        res.status(400).json({"status":0,"message":error.message, "errorMessage":`${error.message}`})
    }
}
        

/**
 * 
 * @param {email, password} req 
 * @param {token} res 
 * @api     POST @/api/logger/login
 */

const loginUser = async (req,res) => {
    try {
        console.log("request receive at login user!!!")
        const {
            email,
            password
        } = req.body

        if (!email || !password)  throw {
            "status":0,
            "message":"Email or password missing!",
            "errorMessage":"Please enter required fields"
        }

        const validateEmail = ValidateEmail(email);
    
        if (!validateEmail) throw {
            "status":0,
            "message":"Email invalid",
            "errorMessage":"Email not valid"
        }

        // const errors = validationResult(req)
        // if(errors){
        //     return res.json({errors})
        // }
    
        const isUserExist = await Users.findOne({email:email})

        if (!isUserExist) throw {
            "status":0,
            "message":"User not available with this email address.",
            "errorMessage":"User does not exist with this email!!"
        }

        const isPasswordCorrect = await bcrypt.compare(password, isUserExist.passwordHash)
    
        if (!isPasswordCorrect) throw {
            "status":0,
            "message":"Password Incorrect",
            "errorMessage":"Check Credentials"
        }
    
        // Token
        // const token = jwt.sign({
        //     user:isUserExist._id
        // },process.env.JWT_SECRET,{
        //     issuer: 'D&D tech',
        //     expiresIn: '1d'
        // });

        const id = {user:isUserExist._id}
        const token = await jwtr.sign(id, process.env.JWT_SECRET, {expiresIn: '15d'})
    
        // Assign token to http cookies
        return res.status(201).json({ "status":1,'message':`Logged In ${email} ${password}`,'token':token, 'name':isUserExist.name});
           
    } catch (error) {
        console.log(error)
        res.status(401).json({
            "status":0,
            "error": error.message,
            "errorMessage":"Some error occured!"
        })
    }
}

const logoutUser = async(req,res) => {
    try {
        const gettoken = req.headers['authorization'].split(' ')[1];
        console.log(req.user)
        const result = await jwtr.destroy(req.jti)
        console.log(result)
        return res.status(200).json({'status': 1,'message':'Logged out successfully!'});
        // return res.json({'message':'Logged out successfully!','token':token});

    } catch (error) {
        return res.status(500).json({'errormessage':`Server response error: ${error.message}`});
    }
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
}