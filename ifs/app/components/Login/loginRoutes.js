/*
  Modified from Barrett Harber's work on node-express-passport-mysql GitHub.
*/

var router = require('express').Router();
var path = require('path');
var viewPath = path.join( __dirname + "/");
var maxCookieAge = 1000*60*5; //TODO: Moves this to sessionConfig

var Logger = require( __configs + "loggingConfig");

var _ = require('lodash');

module.exports = function( app, passport ) {

    function isAuthenticated(req,res,next) {
        var nonSecurePaths = ['/', '/login', '/register', '/about', '/about/data', '/user/data'];
        var result = _.findIndex(nonSecurePaths, function (p) { return p == req.path});

        if(result >= 0 || (req.user) ) {
            next();
        }
        else {
            res.redirect('/login');
        }
    }

    // This function ensure the user in or returns them to main navigation point.+
    function isLoggedIn( req, res, next ) {
        if( req.user )
            return next();
        res.redirect('/');
    }

    // Call Authenticate before every function
    app.use( isAuthenticated );


    // Function to provide login Information to Angular
    app.get("/user/data", function(req,res) {
        if( req &&  req.user  )
            return res.status(200).json( {user: req.user.username} );
        return res.status(400);
    });

    app.get("/", function(req,res) {
        if( req &&  req.user  )
            res.redirect('/tool');
        else
            res.render(viewPath + "login", { title: 'Login  TESTER Screen'});
    });

    // Load the login page
    app.get( "/login", function(req,res){
        if( req &&  req.user  )
            res.redirect('/tool');
        res.render( viewPath + "login", { title: 'Login Screen'});
    });

    //Login request, pass off to the correct link, set coookie session info.
    app.post("/login", passport.authenticate('local-login', {
            successRedirect : '/tool',
            failureRedirect : '/login'
        }),
        function(req,res) {
            if( req.body.remember) {
                req.session.cookie.maxAge = maxCookieAge;
            }
            else {
                req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

    app.get('/register', function ( req,res ) {
        res.render(viewPath + 'register', { title: "Signup Screen", message:"ok"});
    });

    app.post('/register', passport.authenticate('local-signup', {
            //TODO: Change /tool to a preference selection page.
            successRedirect : '/tool',
            failureRedirect : '/register',
            failureFlash : true,
            badRequestMessage: "Failed to login"
    }));

    app.get('/profile', function( req,res ) {
        res.render(viewPath + "profile", { title: "Profile Screen", message:"ok"});
    });

    app.get('/logout', function (req, res ){
        
        req.logOut();
        res.redirect('/');
    });


}; //Close Export module




