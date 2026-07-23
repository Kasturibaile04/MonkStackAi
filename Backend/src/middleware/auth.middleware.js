const jwt = require("jsonwebtoken");
const BlacklistModel = require("../models/blacklist.model");


async function authUser(req,res,next){

    const token = req.cookies.token;
    
    if(!token){
        return res.status(401).json({
            success: false,
            message: "No token found"
        });
    }
    const isTokenBlacklisted = await BlacklistModel.findOne({token});
    if(isTokenBlacklisted){
        return res.status(401).json({
            success: false,
            message: "Token is blacklisted"
        });
    }
    
    try{
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
        
    }catch(error){
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}

module.exports = {authUser};