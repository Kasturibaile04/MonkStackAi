const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BlacklistModel = require("../models/blacklist.model");

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

async function registerUserContoller(req,res){

    const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    const isUserAlreadyExists = await UserModel.findOne({
        $or: [
            {username: username},
            {email: email}
        ]
    });

    if(isUserAlreadyExists){
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({username,email,password: hashedPassword});

    const token = jwt.sign({
        id: user._id,
        username:user.username
    }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    });


}

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */

async function loginUserContoller(req,res){
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    const user = await UserModel.findOne({email});
    if(!user){
        return res.status(400).json({
            success: false,
            message: "User not found"
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            success: false,
            message: "Invalid password"
        });
    }
    const token = jwt.sign({
        id: user._id,
        username:user.username
    }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    });
}

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */

async function logoutUserContoller(req,res){
    const token = req.cookies.token;
    if(!token){
        return res.status(400).json({
            success: false,
            message: "No token found"
        });
    }
    await BlacklistModel.create({
        token
    });
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
  
}
/**
 * @route GET /api/auth/get-me
 * @desc Get current user
 * @access Private
 */

async function getCurrentUser(req,res){
    const user = await UserModel.findById(req.user.id);
    
    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}


module.exports = {
    registerUserContoller,
    loginUserContoller,
    logoutUserContoller,
    getCurrentUser
};
