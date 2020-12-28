const passport = require('passport');
const LocalStrategy= require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
var  {check,validationResult}=require('express-validator')

const dbconfig = require('../database/db');



passport.serializeUser(function(user, done){
    console.log('serializeUser: ' + user)
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('local-signUp',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req,email,password,done) {
    var errors=validationResult(req).array()

    if(errors.length>0)
    {
        console.log('errrr')
        var messages=[]
        errors.forEach(function(error){
            messages.push(error.msg)
        })
        return done(null,false,req.flash('error',messages))
    }

    dbconfig.get().collection('users').findOne({'email': email}, function (err, user) {

        console.log(email);
        if (err) {
            console.log('err case');
            return done(err);
        }
        if (user) {

            console.log('Email is already in use.');
            return done(null, false, {message: 'Email is already in use.'});
        }

        console.log('Creating New User');

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,(err,hash)=>{
                dbconfig.get().collection('users').insertOne({
                    email: email,
                    password: hash,
                    name:req.body.name,
                    role:req.body.role
                }, function (err, data) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, email)
                });
            })
        })

        console.log(user)

    })
}));


passport.use('local.signIn',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req,email,password,done) {


    var errors=validationResult(req).array()

    if(errors.length>0)
    {
        console.log('errrr')
        var messages=[]
        errors.forEach(function(error){
            messages.push(error.msg)
        })
        return done(null,false,req.flash('error',messages))
    }
    dbconfig.get().collection('users').findOne({'email': email}, function (err, user) {

        console.log(email);

        if (err) {
            console.log('err case');
            return done(err);
        }
        if (!user) {

            console.log('Email is invalid.');
            return done(null, false, {message: 'Email is invalid.'});
        }
        bcrypt.compare(password,user.password,(err,isMatch)=>{
            if (isMatch){
                return done(null,user)
            }
            else {
                return done(null,false,{message:'password incorrect'})
            }
        })


    })
}))
