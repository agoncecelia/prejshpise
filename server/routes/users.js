var express = require('express');

var router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
var User = require('../models/user');


//Register
router.post('/register', (req,res,next)=>{
    let newUser = new User({
        name : req.body.firstName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err,user)=>{
        if(err){
            res.json(err);
        }
        else{
            res.json({success: true, msg:'User registered'});
        }

    });
});
//Authenticate
router.post('/authenticate', function(req,res,next){
   const username = req.body.username;
   const password = req.body.password;

   User.getUserByUsername(username,(err,user)=>{
    if(err) throw err;
    if(!user){
        return res.json({success: false,msg:'User not found'});
    }
    User.comparePassword(password, user.password, (err,isMatch)=>{
        if(err) throw err;
        if(isMatch){
            const token = jwt.sign(user.toJSON(),config.secret,{
                expiresIn: 604800 //1week
            });

            res.json({
                success:true,
                token:'JWT '+token,
                user: {
                    id:user._id,
                    name:user.name,
                    username:user.username.password,
                    email:user.email

                }
            });
        }
        else{
            return res.json({success:false,msg:'Wrong Password'});
        }
    })
   })
});

//Profile

router.get('/profile', passport.authenticate('jwt',{session:false}) ,function(req,res,next){
    res.json({user: req.user});
});


module.exports = router;