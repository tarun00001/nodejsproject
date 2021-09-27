const jwt = require('jsonwebtoken')
const User = require('../model/users');
const dotenv = require('dotenv')

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
dotenv.config()

const authUser = async (req,res,next)=>{
    try {
        if(!req.headers['authorization']) throw {"message":"Your are not logged in!!"}
        const token = req.headers['authorization'].split(' ')[1];

        if(!token){
            // return res.status(401).json({'errormessage':"Authentication Failed!"});
            throw {"message":"unauthenticated"};
        }
        
        const verified = await jwtr.verify(token,process.env.JWT_SECRET);
        if(!verified) throw {"message":"Not verified"};
        req.user = verified.user;
        req.jti = verified.jti

        // proceed after authentication
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            "status":0,
            'error':`${error.message}`,
            'errorMessage': 'Some error occured!'
        });
    }
}

module.exports = {authUser}