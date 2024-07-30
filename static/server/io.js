module.exports = socket => {
    let FOCNO="IOB12"
    const config = require('../../config.json');
    var greenZoneArea;
    let logger = require('../perfect-logger/perfect-logger');
    const {
        isSpecialCharIncluded,
        replacefileNameReg,
        isValidFileName,
        isValidSettingvalue,
        isValidDecimalNumber,
        isboolean,
        validateEmail,
    } = require("../utils/validator");
    let fs = require('fs');
    let Canvas = require('canvas');
    let isRepeatAudio = 0;
    let isLightOn = false;
    let interval = null;
    let intervalkeepRobotInGz = null;
    let canvascoord=null;

    let XcanvassOffsetToZeroSick=null;
    let YcanvassOffsetToZeroSick=null;
    let sickMapScale=null;
    let isTransformXY=null;

    let files = {},
        struct = {
            name: null,
            type: null,
            size: 0,
            data: [],
            slice: 0,
        };

        const childProcess = require("child_process");




    const {
        startAutonomous,
        stopAutonomous
    } = require('../utils/autonomous.js');

    const {
        getVelodyneCoord
    } = require('../utils/velodyne.js');

    const {
        
        locoMotor,
        addspeed,
        reducespeed
    } = require('../utils/motor.js');

    const {
        getSickCoord,
        retriveSopasUrl
    } = require('../utils/sick.js');

    const {
        getmember
    } = require('../utils/member.js');

    const { exec } = require('child_process');
    // const spawnOptions = {
    //     cwd: config.CWD,
    //     detached: false
    // };

    function execCallback(err, stdout, stderr) {
        if (err) {
            logger.crit(err)
        }
        if (stdout) {
            logger.info(stdout)
        }
        if (stderr) {
            logger.crit(stderr)
        }
    }


    function execCallbackEmit(err, stdout, stderr, emitTitle) {
        if (err) {
            logger.crit(err)
        }
        if (stdout) {
            socket.emit(emitTitle, stdout)
        } else {
            logger.info("nothing emit back for: " + emitTitle)
        }
        if (stderr) {
            logger.crit(stderr)
        }
    }



    function logErrorcb(err, stderr) {
        if (err) {
            logger.crit(err)
        }
        if (stderr) {
            logger.crit(stderr)
        }
    }

    function sleep(ms) {
        let start = new Date().getTime(),
            expire = start + ms;
        while (new Date().getTime() < expire) {}
        return;
    }

    var lightState;
    var prevLightState = 888;


    
    
    function getCanvasValue(msg){
        let data = msg.split(";");
        if (data.length == 4) {

            XcanvassOffsetToZeroSick = Number(data[0]); //x according to canvas (horizontal)
            YcanvassOffsetToZeroSick = Number(data[1]); // y according to canvas (vertical)
            sickMapScale = Number(data[2]);
            isTransformXY = (data[3].localeCompare("true")) == 1;
        }
    }
    function getCanvasCoordinate(sickx, sicky) {
        if (isTransformXY) {
            let temp = sickx;
            sickx = sicky;
            sicky = temp;
        } else {
            sicky *= -1;
        }
        let coorx = (Number(sickx) * Number(sickMapScale)) + Number(XcanvassOffsetToZeroSick);
        let coory = (Number(sicky) * Number(sickMapScale)) + Number(YcanvassOffsetToZeroSick);
        return [coorx, coory]
        
    }
    let ctx;
    let is_autonomous_running=false;
    function pupulateCanvasGreenzone(GzPoint){
        let x,y,xy;
        let res = GzPoint.split(";");
        let arr = [];
        for (let i = 0; i < res.length; i++) {
            if (res[i].indexOf(",") > -1) {
                xy = res[i].split(",");
                if (xy[0] && xy[1] && xy[0].trim() != "" && xy[1].trim() != "") {
                    arr.push({ x: xy[0], y: xy[1] });
                }
            }
        }
        // greenZoneArea=GzPoint;
        ctx = Canvas.createCanvas(1180, 850).getContext("2d");
        ctx.beginPath();
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#FF0B0B";
        ctx.textAlign = "start";
        for (var i = 0; i < arr.length; i++) {
            x = arr[i].x;
            y = arr[i].y;
            if (i == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.fillStyle = "rgba(35, 255, 0 , 0.1)";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.stroke();
    }
    
    

    function execute(command) {
        return new Promise(function(resolve, reject) {
            childProcess.exec(command, function(error, standardOutput, standardError) {
                if (error) {
                    reject(error)
                }
                if (standardError) {
                    reject(standardError)
                }
                resolve(standardOutput);
            });
        }).catch((e) => {logger.crit(FOCNO+"-"+e)});
    }



    function getLidarData(alerts) {
        if(config.LIDAR=="VELODYNE"){
            return getVelodyneCoord().then(result => {
                return result;
            }).catch(err => {
                return [0,0]
                console.log(err);
            }); 
        }else{
            return getSickCoord();
        }
            
    }


    let countInterval=0;
    async function publishRobotCoord(bol){
        if (bol) {
            if (interval == null) {
                getLidarData(true);
                interval = setInterval(function() {
                    getLidarData(false).then(data => {
                    console.log(data)
                        countInterval++;
                        clearRosTopic();
                        socket.emit("robotCoord", data);
                    })
    
                }, 1000);
            }
        } else {
            clearInterval(interval);
            interval = null;
        } //end if bol
    }




    function KeepRobotInGreenZone(bol){

        if (bol) {
            exec("sed -n '/is_autonomous_running/p' /opt/robo/bin/data/RobotCoord.dat", (err, stdout, stderr) => {
                if (stdout.indexOf('\n') > -1) {
                        stdout = stdout.substr(0, stdout.indexOf('\n'));
                    }
                    let x = stdout.split(" ");
                    if(x.length>1){
                        if(x[1]=="false"){
                            intervalkeepRobotInGz = setInterval(function() {
                                countInterval++;
                                createGzInterval();
                                clearRosTopic();
                            }, 1000);
                            setRunAutonomousFlag(true);
                        }else{

                        }
                    }
            });
        } else {
            if(intervalkeepRobotInGz){
                clearInterval(intervalkeepRobotInGz);
                intervalkeepRobotInGz = null;
            }
        } //end if bol

    }

    function clearRosTopic(){
        if(countInterval>20){
            countInterval=0;
            exec("killall -9 --exact rostopic echo -n1", (err, stdout, stderr) => {
                console.log(stdout)
            });
        }
    }

    function createGzInterval(){
//        console.log("intervalkeepRobotInGz is running")
                exec("sed -n '/is_autonomous_running/p' /opt/robo/bin/data/RobotCoord.dat", (err, stdout, stderr) => {
                    if (stdout.indexOf('\n') > -1) {
                        stdout = stdout.substr(0, stdout.indexOf('\n'));
                    }
                    let x = stdout.split(" ");
                    if(x.length>1){
                        is_autonomous_running=(x[1]=="true");
                    }
//                    console.log("is_autonomous_running : "+is_autonomous_running)

                    if(!is_autonomous_running){
                        KeepRobotInGreenZone(false)
                    }else{
                        getLidarData(false).then(data => {
                            if(data){
                                canvascoord=getCanvasCoordinate(data[0],data[1]);
//                                console.log( "keep robot In Green Zone coordinate: "+canvascoord)
                                
                                if (!ctx.isPointInPath(canvascoord[0], canvascoord[1])) {
                                    // console.log("not in path")
                                    stoppingAutonomousWithCondition("takeoverkenobi");
                                    socket.emit("RobotNotInPath")
                                    KeepRobotInGreenZone(false)
                                }
                            }
                        })
                    }

                });
    }



    retriveSopasUrl();

    function setRunAutonomousFlag(bol){
        exec("sed -i 's/is_autonomous_running .*/is_autonomous_running "+bol+"/g' /opt/robo/bin/data/RobotCoord.dat", 
            (err, stdout, stderr) => {

        });
    }

    function stoppingAutonomousWithCondition(type){
        setRunAutonomousFlag(false)
        logger.info("stopAutonomous")
        logger.info(type)

        if (isSpecialCharIncluded(type)) {
            type = "takeoverkenobi"
            logger.warn("special char included in stopAutonomous, default to stopAutonomous")
        }


        if (type != "takeoverkenobi") {
            exec("echo '" + type + "' > /opt/robo/bin/data/kenobiStuckAction.dat", execCallback);
        }


        locoMotor(0, 0);
        exec("ps -ef | grep 'autonomous _param'", (err, stdout, stderr) => {
            logErrorcb(err, stderr)
            console.log("Input Pressed")
            if (stdout.indexOf("_param:=") > -1) {
                let proc = stdout.split(/\n/);
                let currentlyRunningCoordinate;
                proc.forEach(element => {
                    if (element.indexOf("_param:=") > -1) {
                        currentlyRunningCoordinate = element.split("_param:=");
                        if (currentlyRunningCoordinate[1]) {
                            currentlyRunningCoordinate = currentlyRunningCoordinate[1];
                        }
                    }
                });
                //console.log("hello1")
		currentlyRunningCoordinate = currentlyRunningCoordinate.split(" _wp:=");
		currentlyRunningCoordinate = currentlyRunningCoordinate[0];

                // logger.info(currentlyRunningCoordinate)
		console.log(currentlyRunningCoordinate);
                exec("echo '" + currentlyRunningCoordinate + "' > /opt/robo/bin/data/previousautonomous.dat",
                    (err2, stdout2, stderr2) => {
                        logErrorcb(err2, stderr2)
                        console.log("Stopping1")
                        stopAutonomous();
                    });
            } 
            else{
            exec("ps -ef | grep 'webnomous _param'", (err, stdout, stderr) => {
            logErrorcb(err, stderr)
            //console.log("Resuming")
            if (stdout.indexOf("_param:=") > -1) {
                let proc = stdout.split(/\n/);
                let currentlyRunningCoordinate;
                proc.forEach(element => {
                    if (element.indexOf("_param:=") > -1) {
                        currentlyRunningCoordinate = element.split("_param:=");
                        if (currentlyRunningCoordinate[1]) {
                            currentlyRunningCoordinate = currentlyRunningCoordinate[1];
                        }
                    }
                });
                console.log("Stopping2")

                // logger.info(currentlyRunningCoordinate)
                exec("echo '" + currentlyRunningCoordinate + "' > /opt/robo/bin/data/previousautonomous.dat",
                    (err2, stdout2, stderr2) => {
                        logErrorcb(err2, stderr2)
                        console.log("hello2")
                        stopAutonomous();
                    });
            } 
            else {
                console.log("no autonomous");
                logger.info("no autonomous");
                socket.emit("noautonomous");
            }
            });
            // logger.info(stderr);
            }
        });
        locoMotor(0, 0);
    }

    function CalcDistance(currLocX, currLocY, tarLocX, tarLocY) {
        let a = currLocX - tarLocX;
        let b = currLocY - tarLocY;
        let c = Math.sqrt((a * a) + (b * b));
        // logger.info(currLocX,currLocY +" to "+ tarLocX, tarLocY +" = "+c)
        return c;
    }

    /*function isAdmin() {
        if (socket.request && socket.request.user && socket.request.user.role) {
            return (socket.request.user.role == "admin")
        }
        // return true;
    }*/

  

    socket.on('disconnect', function() {
        // locoMotor(0, 0);
    });

    socket.on('speedup', function() {
        // speedIndex = speedIndex + 0.5;
        addspeed();
    });

    socket.on('speeddown', function() {
        // if (speedIndex > 0) {
        //     speedIndex = speedIndex - 0.5;
        // }
        reducespeed()
    });
    socket.on('light', function() {
        if(isLightOn){
            exec("python /opt/robo/bin/gpOutput.py Light_on", execCallback);
        }else{
            exec("python /opt/robo/bin/gpOutput.py Light_off", execCallback);

        }
        isLightOn=!isLightOn;
    });

    socket.on('bypassOn', function() {
         console.log("On")
        exec("python /opt/robo/bin/gpOutput.py Bypass_on", execCallback);
    });
    socket.on('bypassOff', function() {
         console.log("off")
        exec("python /opt/robo/bin/gpOutput.py Bypass_off", execCallback);
    });

    socket.on('chargingOn', function() {
        // console.log("up")
        exec("echo 'CHARGING_ON' >> /dev/ttyAutoCharging", execCallback);
    });
    socket.on('chargingOff', function() {
        // console.log("up")
        exec("echo 'CHARGING_OFF' >> /dev/ttyAutoCharging", execCallback);
    });


    socket.on('ptzUp', function() {
        // console.log("up")
        exec("python /opt/robo/bin/gpOutput.py Pole_up", execCallback);
    });
    socket.on('ptzStop', function() {
        // console.log("stop")
        exec("python /opt/robo/bin/gpOutput.py Pole_stop", execCallback);
    });
    socket.on('ptzDown', function() {
        // console.log("down")
        exec("python /opt/robo/bin/gpOutput.py Pole_down", execCallback);
    });

    function Resumeautonomous(stdoutAction, route) {
        exec("cat /opt/robo/bin/data/previousautonomous.dat", (errPrev, stdoutPrev, stderrPrev) => {
            logErrorcb(errPrev, stderrPrev)
            stdoutPrev = stdoutPrev.replace(/\s/g, "");
            if (stdoutPrev.indexOf(",") > 0) {
                stdoutPrev = stdoutPrev.split(":")
                let skipIndex = 2;
                if (stdoutPrev.length > 30) {
                    skipIndex = 4;
                } else if (stdoutPrev.length > 20) {
                    skipIndex = 3;
                }
                let nearestCoordinateIndex = 0;
                let prevDistance = 999999,
                    distance;
                let tarloc;
                let remainingCoord;
                getLidarData(true).then(data => {
                    for (var i = 0; i < stdoutPrev.length; i++) {
                        if (!stdoutPrev[i]) {
                            continue;
                        }
                        tarloc = stdoutPrev[i].split(",");
                        distance = CalcDistance(data[0], data[1], tarloc[0], tarloc[1])
                        if (distance < prevDistance) {
                            prevDistance = distance;
                            nearestCoordinateIndex = i;
                            prevDistance
                            // logger.info(i)
                        }
                    }
                    if (stdoutAction == "bringkenobihome") {
                        stdoutPrev.splice(nearestCoordinateIndex - 1, stdoutPrev.length - nearestCoordinateIndex + 1)
                        remainingCoord = stdoutPrev.reverse().join(":")
                        // logger.info(stdoutPrev)
                        // logger.info(remainingCoord)
                    } else if (stdoutAction == "reversepartrolroute") {
                        var stdoutRev = [...stdoutPrev];
                        stdoutRev.splice(nearestCoordinateIndex - 1, stdoutRev.length - nearestCoordinateIndex + 1)
                        stdoutRev = stdoutRev.reverse();
                        stdoutPrev.splice(0, nearestCoordinateIndex + skipIndex);
                        stdoutRev = stdoutRev.concat(stdoutPrev.reverse()).concat(stdoutPrev.reverse().splice(1, stdoutPrev.length));
                        remainingCoord = stdoutRev.join(":")
                    } else { 
                        stdoutPrev.splice(0, nearestCoordinateIndex)
                        remainingCoord = stdoutPrev.join(":")
                    }
console.log("Nearest point: " + nearestCoordinateIndex);
		let resumePoint = nearestCoordinateIndex + 1;

		console.log("_param:=" + remainingCoord);

                    //exec("rosparam set param " + route + " && rosrun autonomous player.py & rosrun autonomous webnomous _param:=" + remainingCoord + " _wp:=" + resumePoint, execCallback);
		    exec("/opt/robo/bin/Robo_Sicknomous.sh " + route + " resume " + remainingCoord);
                    exec("echo '' > /opt/robo/bin/data/kenobiStuckAction.dat", execCallback);


                })
                socket.emit("autonomousResumed")
            } else {
                socket.emit("noautonomous");
            }
        }); //end prevautonomous
    }



    socket.on('resumeAutonomous', function(route) {
        exec("cat /opt/robo/bin/data/kenobiStuckAction.dat", (errAction, stdoutAction, stderrAction) => {
            stdoutAction = stdoutAction.trim();
            //logErrorcb(errAction, stderrAction)
            if (errAction) console.log(errAction);
            else if (stderrAction) console.log(stderrAction);
            else {
                Resumeautonomous(stdoutAction, route);
            }
        }); //end Action
    });



    //________________________________


    socket.on('getRobotCoord', function(bol) {
        // KeepRobotInGreenZone(bol);
        publishRobotCoord(bol);
     

    });
    //________________________________


    socket.on('getmembers', function(email) {
        /*if (!isAdmin()) {
            return;
        }*/

        if (!validateEmail(email)) {
            email = "";
        }
        getmember().then(res => {

            let myArray = res.filter(function(obj) {
                return obj.email != email;
            })
            socket.emit('getmemberList', myArray);
        })
    });


    let isStartClicked=false;
    socket.on('startAutonomous', function(route) {
        let namex = route.substr(0, route.length - 4);
        if (!isValidFileName(namex)) {
            socket.emit("msgx", "invalid route name")
            return;
        }
        if(isStartClicked){
            return;
        }
        isStartClicked=true;

        setRunAutonomousFlag(false);
        locoMotor(0, 0);
        stopAutonomous();
        sleep(2000)
        startAutonomous(route);
        KeepRobotInGreenZone(true);
        // locoMotor(0, 0);
    });
    //________________________________

    socket.on('stopAutonomous', function(type) {
        isStartClicked=false;
        stoppingAutonomousWithCondition(type);
        
    });
    //________________________________

    socket.on('getAutonomousSetting', function() {
        // logger.info("getAutonomousSetting")
        exec("cat /opt/robo/bin/data/config.txt", (err, stdout, stderr) => {
            execCallbackEmit(err, stdout, stderr, 'autonomousSetting')
        });
    });
    //________________________________
    socket.on('updateAutonomousSetting', function(settings) {
        /*if (!isAdmin()) {
            return;
        }*/
        if (!isValidSettingvalue(settings)) {
            logger.warn("invalid setting char")
            socket.emit("msgx", "invalid setting value, changes is not saved")
            return;
        }
        exec("echo '" + settings + "' > /opt/robo/bin/data/config.txt", execCallback);
        socket.emit("msgx", "setting Updated, Please Re-run autonomous for it to take effect")
    });
    //________________________________
    socket.on('getCalibratedData', function() {
        exec("cat /opt/robo/bin/data/AutonomousCalibrate.dat", (err, stdout, stderr) => {
            getCanvasValue(stdout)
            execCallbackEmit(err, stdout, stderr, 'calibratedData')
        });
    });
    socket.on('disconnect', () => {
publishRobotCoord(false)
        if (socket.request) {
            try {
                // console.log("logging out user")
                socket.request.logout();
            } catch (e) {
                logger.crit(e)
            }
        }
        logger.info(`Socket ${socket.id} disconnected.`);
    });

    //________________________________
    socket.on('getClickableArea', function(eventdata) {
        exec("cat /opt/robo/bin/data/AutonomousMapClickable.dat", (err, stdout, stderr) => {
            
            pupulateCanvasGreenzone(stdout);
            execCallbackEmit(err, stdout, stderr, 'ClickableArea')
        });
    });

    socket.on('getRouteProfileData', function(param) {
        var namex = param.substr(0, param.length - 4);
        if (!isValidFileName(namex)) {
            socket.emit("msgx", "invalid route name")
            return;
        }
        exec("cat /opt/robo/bin/autnomousProfile/" + param, (err, stdout, stderr) => {
            logErrorcb(err, stderr)
            exec("ls /opt/robo/web-robot-controller/static/sound/", (err2, stdout2, stderr2) => {
                logErrorcb(err2, stderr2)
                socket.emit('RouteProfileDataCallBack', stdout + "===" + stdout2);
            });
        });
    });
    //________________________________

    socket.on('saveCalibrationValue', function(xoffset, yoffset, scale, checked) {
        /*if (!isAdmin()) {
            return;
        }*/
        if (!isValidDecimalNumber(xoffset) ||
            !isValidDecimalNumber(yoffset) ||
            !isValidDecimalNumber(scale) ||
            !isboolean(checked)) {
            socket.emit("msgx", "invalid calibration input")
            return;
        }
        let res = xoffset + ";" + yoffset + ";" + scale + ";" + checked;
        exec("echo '" + res + "' > /opt/robo/bin/data/AutonomousCalibrate.dat", execCallback);
    });
    //________________________________
    socket.on('saveGreenZoneCoor', function(arr) {
        /*if (!isAdmin()) {
            return;
        }*/
        if (arr.length) {
            let res = "";
            let valid = true;
            for (let i = 0; i < arr.length; i++) {
                if (!isValidDecimalNumber(arr[i].x) || !isValidDecimalNumber(arr[i].y)) {
                    socket.emit("msgx", "invalid Greenzone input")
                    valid = false;
                    break;
                }
                res += arr[i].x + "," + arr[i].y + ";";
            }
            if (valid) {
                exec("echo '" + res + "' > /opt/robo/bin/data/AutonomousMapClickable.dat", execCallback);
            }
        }
    });
    //________________________________


    socket.on('addAutonomousPath', function(name, arr) {
        if (!isValidFileName(name)) {
            name = name.replace(replacefileNameReg, "_");
        }
        if (!name.endsWith(".dat")) {
            name += ".dat";
        }
        if (arr.length) {
            var res = "";
            var valid = true;
            // console.log(arr)
            for (var i = 0; i < arr.length; i++) {
                if(!( arr[i].x.endsWith("s") || arr[i].x.endsWith("d") )){
                    if (!isValidDecimalNumber(arr[i].x) || !isValidDecimalNumber(arr[i].y)) {
                        socket.emit("msgx", "invalid Route input")
                        valid = false;
                        break;
                    }

                }

                res += arr[i].x + "," + arr[i].y + ":";
                
            }
            if (valid) {
                exec("echo '" + res + "' > /opt/robo/bin/autnomousProfile/" + name, execCallback);
            }
        }
    });
    //________________________________

    socket.on('getRouteProfileList', function() {
        // logger.info("getRouteProfileList");
        exec("ls /opt/robo/bin/autnomousProfile/", (err, stdout, stderr) => {
            logErrorcb(err, stderr)
            let set = [];
            stdout.trim();
            if (stdout.indexOf("\r\n") > -1) {
                set = stdout.split("\r\n");
            } else if (stdout.indexOf("\n") > -1) {
                set = stdout.split("\n");
            }
            for (var i = 0; i < set.length; i++) {
                if (set[i].trim() == "") {
                    set.splice(i, 1);
                }
            }
            socket.emit('getRouteProfileListCallBack', set);

        });

    });
    //________________________________


    socket.on('slice upload', (data) => {
        /*if (!isAdmin()) {
            return;
        }*/

        logger.info("data" + data)

        if (!files[data.name]) {
            files[data.name] = Object.assign({}, struct, data);
            files[data.name].data = [];
        }

        //convert the ArrayBuffer to Buffer 
        data.data = Buffer.from(new Uint8Array(data.data));
        //save the data 
        files[data.name].data.push(data.data);
        files[data.name].slice++;

        if (files[data.name].slice * 100000 >= files[data.name].size) {
            //do something with the data 
            var fileBuffer = Buffer.concat(files[data.name].data);
            if (data.classification == "audio") {
                logger.info("saving audio file");
                sleep(1000);
                fs.writeFile('/opt/robo/web-robot-controller/static/sound/' + data.name, fileBuffer, "binary", (err) => {
                    if (err) {
                        logger.crit(err)
                    }
                    // fs.writeFile('/opt/map1.png', fileBuffer,"binary", (err) => { 
                    // delete files[data.name]; 
                    // if (err) return socket.emit('upload error'); 
                    logger.info("end upload");
                    socket.emit('endAudioUpload');

                });
            } else if (data.classification == "face") {
                logger.info("saving face file");
                sleep(1000);
                fs.writeFile('/opt/robo/web-robot-controller/views/images/faces' + data.name, fileBuffer, "binary", (err) => {
                    if (err) {
                        logger.crit(err)
                    }
                    logger.info("end upload");
                    socket.emit('endAudioUpload');

                });
            } else if (data.classification == "map") {
                exec("cp /opt/robo/web-robot-controller/views/images/map1.png /opt/robo/web-robot-controller/views/images/map2.png", execCallback);
                logger.info("saving new map");
                sleep(1000);
                fs.writeFile('/opt/robo/web-robot-controller/views/images/map1.png', fileBuffer, "binary", (err) => {
                    if (err) {
                        logger.crit(err)
                    }
                    console.log("end upload")
                    socket.emit('endupload');

                });

            }

            // files=null;

        } else {
            socket.emit('request slice upload', {
                currentSlice: files[data.name].slice
            });
        }
    });
    //________________________________


    socket.on("repeatSound", function(stat) {
        // logger.info(Stat)
        if (!isboolean(stat)) {
            stat = 0;
        }
        if (stat == 0) {
            isRepeatAudio = false;
        } else {
            isRepeatAudio = true;
        }
        logger.info(isRepeatAudio)
    })
    //________________________________


    socket.on("playAudio", function(sound) {
        let namex = sound.substr(0, sound.length - 4);
        if (!isValidFileName(namex)) {
            socket.emit("msgx", "sound not found")
            return;
        }
        //logger.info("playAudio")
        let loops = "";
        if (isRepeatAudio) {
            loops = "-loop -1";
        }

        exec("pkill ffplay", (err, stdout, stderr) => {
            logErrorcb(err, stderr)
            exec("ffplay -nodisp -autoexit " + loops + " /opt/robo/web-robot-controller/static/sound/" + sound, execCallback);
        });
    })
    //________________________________


    socket.on("stopAudio", function(sound) {
        // var namex = sound.substr(0, sound.length - 4);
        // if (!isValidFileName(namex)) {
        //     socket.emit("msgx", "sound not found")
        //     return;
        // }
        exec("pkill ffplay", execCallback);
    })
    //________________________________


    socket.on("getSoundList", function() {
        exec("ls /opt/robo/web-robot-controller/static/sound/", (err, stdout, stderr) => {
            execCallbackEmit(err, stdout, stderr, 'getSoundListCallback')
        });
    })
    //________________________________
    socket.on("getfaceList", function() {
        exec("ls /opt/robo/web-robot-controller/views/images/thum/", (err, stdout, stderr) => {
            execCallbackEmit(err, stdout, stderr, 'getfaceListCallback')
        });
    })
    //________________________________

    socket.on("deleteAudio", function(sound) {

        let namex = sound.substr(0, sound.length - 4);
        if (!isValidFileName(namex)) {
            socket.emit("msgx", "sound not found")
            return;
        }
        exec("rm '/opt/robo/web-robot-controller/static/sound/" + sound + "'", execCallback);
    })
    //________________________________
    socket.on("changeFace", function(face) {

        let namex = face.substr(0, face.length - 4);
        if (!isValidFileName(namex)) {
            socket.emit("msgx", "face not found")
            return;
        }
        exec("eog -fw /opt/robo/web-robot-controller/views/images/faces/" + face, execCallback);
    })

    /*end ipin code*/

    socket.on('stop', function() {
        locoMotor(0, 0);
    });
    //________________________________
    socket.on('movement', function(x, y) {
        if (!x || !y) {
            locoMotor(0, 0);
        } else {
            if (!isValidDecimalNumber(x) || !isValidDecimalNumber(y)) {
                locoMotor(0, 0);
            } else {
                locoMotor(x, y);
            }

        }

    });
    //________________________________
    socket.on('dismissEmergency', function() {
        releaseEmergency();
    });
    //________________________________
    // socket.on('light', function(state) {
    //     if (state) {
    //         exec(`${config.CWD}${config.ROBO_LIGHT_SWITCH} 0`, execCallback);
    //     } else {
    //         exec(`${config.CWD}${config.ROBO_LIGHT_SWITCH} 1`, execCallback);
    //     }
    // });
    //________________________________
    // socket.on('pole', function(a, b) {
    //     // logger.info(`Pole Control: ${a} ${b}`);
    //     headSpawn(a, b);
    // });
    // //________________________________
    // socket.on('face', function(a, b) {
    //     // logger.info(`Face Control: ${a} ${b}`);
    //     faceSpawn(a, b);
    // });
    // //________________________________
    // socket.on('gpio', function() {
    //     // logger.info('inside socket gpio')
    //     socket.broadcast.emit('IOWarning', arguments[0], arguments[1]);
    // });



    // socket.on('make_call', function() {

    //     logger.info("make_call")
    //     // const caller = spawn(`./${config.SIP_COMMAND}`, spawnOptions);
    //     // caller.on('error', (error) => {
    //     //   if (error.code === 'ENOENT') {
    //     //     logger.info('No such command');
    //     //     logger.info(error)
    //     //   } else {
    //     //     console.error(error);
    //     //   }
    //     // });
    //     // caller.stdout.on('data', data => logger.info(`CALL SUCCESS: ${data}`));
    //     // caller.stderr.on('data', err => logger.info(`CALL ERROR: ${err}`));
    // });

    //________________________________
    // socket.on('pm2_reload', function() {
    //     logger.info("pm2_reload")
    //     // exec(`pm2 reload ${APP_NAME}`,execCallback);
    // });
    //________________________________

    // socket.on('reboot', function() {
    //     logger.info("reboot")
    //     // exec(`reboot`, execCallback);
    // });
    //________________________________



    // socket.on('shutdown', function() {
    //     logger.info("shutdown")
    //     // exec(`shutdown -t 0`,execCallback);
    // });


}
