const config = require('../../config.json');
const express = require('express');
const helmet = require('helmet')
const https = require('https');
//const http = require('http');
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
const server = https.createServer(options, app);
//const server = http.createServer(options, app);
const bodyParser = require('body-parser');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const router = require('./routex.js');


const mongoose = require("mongoose")
const {PERSetting} = require("../utils/auth");
const { startRoscore } = require('../utils/autonomous.js');
const MongoStore = require('connect-mongo')(session);
const iosoc = require('./io');
const socketio = require('socket.io');
const passportSocketIo = require('passport.socketio');
const io = socketio(server);

var exec = require('child_process').exec, child;

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
app.use(methodOverride('_method'))


/*
connection with DB
*/
function sleep(ms) {
    var start = new Date().getTime(),
        expire = start + ms;
    while (new Date().getTime() < expire) {}
    return;
}

let counter=0;
const startApp = async () => {
    try {
        await mongoose.connect(config.DB_URL, utils.connectionOptions)
        console.log(`successfully connected with the database \n`)
        var mongoStore = new MongoStore({ mongooseConnection: mongoose.connection,
        ttl: 60  })
        //await PERSetting();
        

        app.use(session(utils.defaultSesWithStore(mongoStore)))
        app.use(passport.initialize())
        app.use(passport.session())
        router.initializeApp(app);

        // console.log(xApp);
        io.use(passportSocketIo.authorize(utils.defaultPassportIO(mongoStore)));
        io.on('connection', (socket) => {
            logger.info("connection Up")
            iosoc(socket)
            router.setsocket(socket);   
        });
        /*
        // Initialize ROS node
        const rosnodejs = require('rosnodejs');
        const nh = await rosnodejs.initNode('/web_server_node');

        // Establish connection to ROS Bridge server
        const ROSLIB = require('roslib');
        const rosBridgeUrl = 'ws://localhost:9090';  // Replace with your ROS Bridge server URL
        const rosClient = new ROSLIB.Ros({
            url : rosBridgeUrl
        });

        rosClient.on('connection', function() {
            console.log('Connected to ROS Bridge server');
        });

        rosClient.on('error', function(error) {
            console.error('Error connecting to ROS Bridge server:', error);
        });

        rosClient.on('close', function() {
            console.log('Connection to ROS Bridge server closed');
        });

        // Example ROS subscriber and publisher (adjust as per your ROS topics)
        const listener = nh.subscribe('/ros_topic', 'std_msgs/String', (data) => {
            console.log(`Received: ${data.data}`);
            // Process ROS message received
        });

        const publisher = new ROSLIB.Topic({
            ros : rosClient,
            name : '/ros_topic',
            messageType : 'std_msgs/String'
        });
        // Example: emit ROS data to the client
        listener.on('message', (message) => {
          socketio.emit('ros_data', message.data);
      });

      // Example: send data to ROS
      socketio.on('ros_command', (data) => {
          const msg = new ROSLIB.Message({
              data: data
          });
          publisher.publish(msg);
      }); 
    */
        



        sleep(1000)
        server.listen(config.NODE_PORT, function() {
            console.log(`server started on port ${config.NODE_PORT}`);
        })

    } catch (err) {
        logger.crit(err);
        console.log(`unable to connect withn database \n${err}`);
        startApp();
    }
}

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('clearProfile', profileName => {
        var new_profile = 'mkdir -p /opt/robo/web-robot-controller/static/profile/' + profileName + ' && rm /opt/robo/web-robot-controller/static/profile/' + profileName+ '/*.*';
        console.log(new_profile);
        child = exec(new_profile, function(error, stdout, stderr){
        //  io.emit('audio_No', wpNo);
        });

    });
    socket.on('wp_No', (profileName, wpNoO, aNo) => {
        var wpNo = wpNoO + 1;
        console.log('Route: ' + profileName);
      console.log('Waypoint Number: ' + wpNo);
      console.log('Audio Name: ' + aNo);
      
      var command = 'cp /opt/robo/web-robot-controller/static/sound/' + aNo + ' /opt/robo/web-robot-controller/static/profile/' + profileName + '/' + wpNo + '.mp3';
      console.log(command);
      child = exec(command, function(error, stdout, stderr){
        io.emit('audio_No', wpNo);
      });

    });


    socket.on('ros_No', (rosNo) => {
        console.log('Waypoint Number: ' + rosNo);
        var command = 'play /home/dexter/'+ rosNo + '.mp3';
        console.log(command);
        child = exec(command, function(error, stdout, stderr){
          io.emit('ros_Audio_No', rosNo);
        });
      });

  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });


utils.initializeLogger();
startRoscore();
startApp();








process.on('SIGINT', () => {
    logger.info('Closing HTTP Server.');
    io.close(); 
    process.exit(0);
});