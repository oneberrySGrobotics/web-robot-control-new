const config = require('../../config.json');
const logger = require('../perfect-logger/perfect-logger');
const rateLimit = require("express-rate-limit");
const expectCts = require('expect-ct')
const passport = require('passport')
var cookieParser = require('cookie-parser');




var defDate = new Date(1610666880375)

const initializeLogger = () => {

    logger.initialize('roboguard', {
        logLevelFile: 0, // Log level for file
        timezone: 'Asia/Singapore',
        maximumLogFieSize: '12400000',
        logLevelConsole: -1, // Log level for STDOUT/STDERR
        logDirectory: config.LOG_DIR, // Log directory
        customBannerHeaders: 'This is a custom banner', // Custom Log Banner
    });
}

function randomStr(length) {
    var chars = '#aA!'
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '!@#$%^&=<>?';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}
config.APPKEY = randomStr(96);
// config.SES_NAME = randomStr(26);

const limiter = rateLimit({
    windowMs: 13 * 1000, // 5 sec
    max: 200 // limit each IP to 100 requests per windowMs
});

const expectCt = expectCts({
    enforce: true,
    maxAge: 123
})

const csp = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
            //    sandbox: ['allow-forms', 'allow-same-origin'],
            reportUri: '/reportcspviolat',
            objectSrc: ["'self'"],
            upgradeInsecureRequests: true,
            workerSrc: false // This is not set.
        },
        loose: false,
        reportOnly: false,
        setAllHeaders: false,
        disableAndroid: false,
        browserSniff: true
    },
    referrerPolicy: { policy: 'same-origin' },
}

const defaultSesWithStore = (storex) => {
    return {
        name: config.SES_NAME,
        secret: config.APPKEY,
        resave: true,
        secure: true,
        store: storex,
        saveUninitialized: true,
        cookie: {
            secure: true,
            expires: config.period,

        }
    }
}




const defaultPassportIO = (storex) => {

    return {
        key: config.SES_NAME,
        secret: config.APPKEY,
        store: storex,
        passport: passport,
        cookieParser: cookieParser
    }
}
const cookieDef = {
    name: config.SES_NAME,
    secret: config.APPKEY,
    resave: false,
    secure: true,
    saveUninitialized: false,
    cookie: {
        secure: true,
        expires: config.period
    }
}
const connectionOptions = {
    useFindAndModify: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    user: config.DB_USER,
    pass: config.DB_PASS,
    authSource: config.DB_SOURCE
};

// const defaultSocketSesIO={
//   key: 'connect.sid',
//   secret: config.APPKEY,
//   store: sessionStore,
//   passport: passport,
//   cookieParser: cookieParser
// }

const reqSanitizer = function(req, res, next) {

    res.setHeader('Cache-Control', 'no-cache,no-store,max-age=0,must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '-1');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-XSS-Protection', '1;mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader("Access-Control-Allow-Origin", "192.168.0.199");
    // logger.info(req.method + ": " + req.url)
    const allowedMethods = ['GET', 'HEAD', 'POST']
    if (!allowedMethods.includes(req.method)) {
        logger.warn("unwanted method detected, redirct to Login")
        return res.redirect('/login');
    }
    var err = null;
    try {
        decodeURIComponent(req.path)
    } catch (e) {
        err = e;
    }
    if (err) {
        logger.crit(req.url)
        logger.crit(err);
        return res.redirect('/login');
    }
    next();
}



module.exports = {
    connectionOptions,
    initializeLogger,
    limiter,
    expectCt,
    csp,
    reqSanitizer,
    cookieDef,
    randomStr,
    defaultPassportIO,
    defaultSesWithStore
}