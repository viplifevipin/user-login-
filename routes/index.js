var express = require('express');
var router = express.Router();
var db=require('../database/db')
let ObjectID = require('mongodb').ObjectID;
var passport=require('passport')
var  {check,validationResult}=require('express-validator')


//get profile page for user and admin
router.get('/profile',isLoggedIn,(req,res)=>{
if (req.user.role=='admin'){
    db.get().collection('users').find({}).toArray(function (err,docs){
     res.render('user/details',{doc:docs})
    })
}else {
    console.log(req.user)
    const person=req.user
    res.render('user/profile',{person})

}
})

//logout route

router.get('/logout',isLoggedIn,function (req,res,next) {
    req.logOut()
    res.redirect('/')
})



router.use('/',notLoggedIn,function (req,res,next) {
    next();
})

//home page
router.get('/', function(req, res, next) {
    var messages=req.flash('error');
    res.render('user/index', {messages:messages,hasErrors:messages.length>0});
});


//route for registration form
router.get('/register',(req,res)=>{
    var messages=req.flash('error');
    res.render('user/register',{messages:messages,hasErrors:messages.length>0})
})

//route for submitting
router.post('/register',[check('email','Invalid email').isEmail(),check('password','Invalid password.').isLength({min:5})],
    passport.authenticate('local-signUp',
        {
          failureRedirect:'/user/signup',
          failureFlash:true
        }),function(req,res,next){
      if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      }
      else {
        res.redirect('/')
      }
    })


// router for sign in
router.post('/',[check('email','Invalid email').isEmail(),check('password','Invalid password.').isLength({min:5})],passport.authenticate('local.signIn',
    {
        successRedirect:'/profile',
        failureRedirect:'/',
        failureFlash:true
    }
),function(req,res,next){
        if(req.session.oldUrl){
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        }
        else {
            res.redirect('/profile')
        }
})


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl=req.url
    res.redirect('/')
}


function notLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}


module.exports = router;
