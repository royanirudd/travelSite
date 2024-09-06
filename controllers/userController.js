const User = require('../models/user');
const passport = require('passport');

//Express validator
const { check, validationResult } = require('express-validator');

exports.signUpGet = (req,res) => {
    res.render('sign_up', { title: "User sign up"} );
}

exports.signUpPost = [
	//Validate data
    check('first_name').isLength({ min: 1 }).withMessage('First name must be specified')
    .isAlphanumeric().withMessage('Special characters not allowed').trim().escape(),

    check('surname').isLength({ min: 1 }).withMessage('Surname must be specified')
    .isAlphanumeric().withMessage('Special characters not allowed').trim().escape(),

    check('email').isEmail().withMessage('Invalid email address').normalizeEmail(),

    check('confirm_email')
    .custom((value, { req }) => value === req.body.email)
    .withMessage("Email addresses do not match"),

    check('password').isLength({min: 6})
    .withMessage('Invalid password, must be atleast 6 characters long'),

    check('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),



    (req,res,next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty) {
            //Errors present
            res.render('sign_up', {title: "Please fix the following errors", errors: errors.array()});
            return;
        } else {
            // No errors
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, function(err) {
                if(err){
                    console.log('Error while registering!', err);
                    return next(err);
                }
                next(); //Move onto loginPost after registering
            });
        }
    }
]

exports.loginGet = (req,res)=> {
    res.render('login', {title: 'Login to continue'});
}

exports.loginPost = passport.authenticate('local', {
    successRedirect: '/',
    successFlash: "You are now logged in",
    failureRedirect: '/login',
    failureFlash: "login failed, please try again"
});

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.redirect('/'); // Handle error appropriately
        }
        req.flash('info', "You are now logged out");
        res.redirect('/');
    });

};

exports.isAdmin = (req,res,next) => {
	if(req.isAuthenticated() && req.user.isAdmin){
		next();
		return;
	}
	res.redirect('/');
}
