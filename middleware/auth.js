const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    if (!req.header("Authorization")) {
        return res.status(401).json({message: "Auth Error"});
        
    }
    const token = req.header("Authorization").split(" ")[1];
    // console.log(token)
    if(!token)
    return res.status(401).json({message: "Auth Error"});

    try{
        const decoded = await jwt.verify(token, "MYNAMEISTARUNSINGHCHAUDHARYANDILIVESINGHAZIABAD");
        // console.log(decoded)
        req.user = decoded;
        next();
    } catch(err){
        console.log(err)
        res.status(500).send({ message: "Invalid Token"});
    }
}

module.exports = auth;