const childProcess = require("child_process");
let logger = require('../perfect-logger/perfect-logger');
let FOCNO="ROB13"
/**
 * @DESC start roscore
 */
const startRoscore = async () => {
    if (!(await isRoscoreRunning())) {
        logger.info(FOCNO+"starting ros.");
        execute("roscore");
    }
};

/**
 * @DESC kill roscore
 */
const killRoscore = () => {
    execute("killall -9 roscore")
    sleep(2000)
    execute("killall -9 rosmaster")
};


/**
 * @DESC start  Autonomous
 */
const startAutonomous = async (route) => {
    // console.log("0000")
    if (!(await isRoscoreRunning())) {
        logger.info(FOCNO+"starting ros");
        execute("roscore");
    }
    // console.log(1111)
    sleep(2000);
    // console.log(22222)
    //execute("rosparam set param " + route + " && rosrun autonomous player.py & rosrun autonomous autonomous _param:=$(cat /opt/robo/bin/autnomousProfile/" + route + ") _wp:=1");
    //execute("rosrun autonomous autonomous _param:=$(cat /opt/robo/bin/autnomousProfile/" + route + ")");
    execute("/opt/robo/bin/Robo_Sicknomous.sh " + route);
};

/**
 * @DESC start  Autonomous
 */
const stopAutonomous = async () => {
	console.log("Stop Received");
	execute("/opt/robo/bin/Robo_StopAll.sh");
        //execute("killall -9 autonomous");
/*
	execute("rosnode kill /charge_status_checker && killall -9 check_charge");
        execute("rosnode kill /undocking");
	execute("rosnode kill /auto_charging");
        execute("rosnode kill /autonomous");
        execute("killall -9 autonomous");
        execute("killall -9 webnomous");
        sleep(7000);
	console.log("round 2");
	execute("rosnode kill /auto_charging");
        execute("rosnode kill /autonomous");
*/
        
        
        sleep(1500);
        locoMotor(0, 0);
};

function sleep(ms) {
    let start = new Date().getTime(),
    expire = start + ms;
    while (new Date().getTime() < expire) {}
    return;
}

function locoMotor(a, b) {
    try{

        let le = a * speedIndex;
        let ri = b * speedIndex;
        let result = "echo '!M " + le + " " + ri + "' \r > /dev/ttyACM0 \n"
        exec(result, execCallback);
    }catch(e){
        logger.crit(FOCNO+e);
    }
    // console.log(a,b)
}

async function isRoscoreRunning() {
    var result;
    result = await execute("rostopic list");
    if(!result){
        return false;
    }
    if (result.indexOf("/rosout") > -1) {
        return true;
    } else {
        return false;
    }
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


function sleep(ms) {
    let start = new Date().getTime(),
        expire = start + ms;
    while (new Date().getTime() < expire) {}
    return;
}

module.exports = {
    startRoscore,
    killRoscore,
    startAutonomous,
    stopAutonomous
};
