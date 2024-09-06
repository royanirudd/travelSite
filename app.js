require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');

// For passport.js
const User = require('./models/user');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

// For flash messages
const flash = require('connect-flash');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Initialize session middleware
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure to true in production with HTTPS
    store: MongoStore.create({
        mongoUrl: process.env.DB,
        // Alternatively, you can use mongoose.connection if you prefer
        // mongooseConnection: mongoose.connection
    })
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.url = req.path;
    res.locals.flash = req.flash(); // Fixed the comma issue
    next();
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message)); // Improved error message

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
