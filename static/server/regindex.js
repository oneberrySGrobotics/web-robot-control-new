const config = require('../../config.json');
const express = require('express');
const helmet = require('helmet')
const https = require('https');
const fs = require('fs');
const app = express();
app.use(helmet())
const options = {
    key: fs.readFileSync(__dirname + '/slc/localhost.key'),
    cert: fs.readFileSync(__dirname + '/slc/localhost.crt'),
    rejectUnauthorized: true
};
const logger = require('../perfect-logger/perfect-logger');
const utils = require('../utils/serverOB.js');
utils.initializeLogger();
const server = https.createServer(options, app);
const bodyParser = require('body-parser');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const router = require('./routex.js');

const mongoose = require("mongoose")
const { startRoscore } = require('../utils/autonomous.js');

const iosoc = require('./io');
const socketio = require('socket.io');
const passportSocketIo = require('passport.socketio');
const io = socketio(server);
const MongoStore = require('connect-mongo')(session);

const {
    userRegister,
    //regPetrifier,
} = require("../utils/auth");
const initializePassport = require('./passport-config')
initializePassport(passport)
app.use(utils.reqSanitizer);
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet(utils.csp))
app.use(utils.expectCt)
app.use(utils.limiter);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.json({ type: ['json', 'application/csp-report'] }))
app.use(express.static('views'));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
startRoscore();
app.use(methodOverride('_method'))

const {
    validateEmail,
} = require("../utils/validator");
const {
    getmember
} = require('../utils/member.js');
const {
        deletemember,
    } = require("../utils/auth");
/*
connection with DB
*/
const startApp = async () => {
    try {
        await mongoose.connect(config.DB_URL, utils.connectionOptions)
        console.log(`successfully connected with the database \n`)
        var mongoStore = new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 60
        })
        // var mongoStore = new session.MemoryStore();
        app.use(session(utils.defaultSesWithStore(mongoStore)))
        app.use(passport.initialize())
        app.use(passport.session())

  
        //regPetrifier()

        app.get('/register', (req, res) => {
            res.render('pages/register.ejs', { msx: '', email: "e" })
        })

        app.post('/register', async (req, res) => {
            await userRegister(req.body, "user", res, "e");
        })
        app.post('/deletemember', async (req, res) => {
                if (req.body && req.body.member) {
                    await deletemember(req.body.member, res);
                }
        })

        app.all('*', function(req, res) {
            res.redirect('/register')
        });


        // router.initializeApp(app);

        // io.use(passportSocketIo.authorize(utils.defaultPassportIO(mongoStore)));
        io.on('connection', (socket) => {
            logger.info("connection Up")
            socket.on('getmembers', function(email) {

                if (!validateEmail(email)) {
                    email = "";
                }
                getmember().then(res => {

                    myArray = res.filter(function(obj) {
                        return obj.email != email;
                    })

                    socket.emit('getmemberList', myArray);
                })
            });
            // iosoc(socket)

            // router.setsocket(socket);
        });

        server.listen(config.NODE_PORT, function() {
            console.log(`server started on port ${config.NODE_PORT}`);
        })

    } catch (err) {
        logger.crit(err);
        console.log(`unable to connect withn database \n${err}`);
        startApp();
    }
}


startApp();









process.on('SIGINT', () => {
    logger.info('Closing HTTP Server.');
    io.close();
    process.exit(0);
});