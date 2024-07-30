const childProcess = require("child_process");
let logger = require('../perfect-logger/perfect-logger');
let FOCNO="VEL13 - "
let localizationError="LocalizationError"

const rosnodejs = require('rosnodejs');
const std_odommsg = rosnodejs.require('nav_msgs').msg;
let lastLoc=[0,0];

function listener() {
    rosnodejs.initNode('/listener_node')
        .then((rosNode) => {
        let sub = rosNode.subscribe('/odom', std_odommsg.Odometry,
        (data) => {
	    lastLoc = [data.pose.pose.position.x, data.pose.pose.position.y]
    	}
    	);
    });
}
listener();

const getVelodyneCoord = async () =>  {
    let result;
    /*result = await execute("rostopic echo -n1 --noarr --offset /odom");
    result=result.toString();
    if(result==localizationError){
    	return lastLoc; 
    }*/
	
    result = lastLoc;
    console.log(result);

/*    try {
        if (result.indexOf("x:") > -1) {
        		result=result.substring(result.indexOf("position:"), result.indexOf("orientation:"));
        		result=result.split(/\n/);
				lastLoc= [result[1].replace(/\s/g, "").split(":")[1],result[2].replace(/\s/g, "").split(":")[1]] ;
				return lastLoc;       
          
        }else{
            logger.warn(FOCNO+"odom does not contain localization Data xy");
        }
    } catch (error) {
        logger.crit(FOCNO+error)
        return lastLoc;
    }*/
    return result;
}
const x = 2000 ;/*milisec*/

function execute(command) {
    return new Promise(function(resolve, reject) {
        command = command.split(' ');
        const ps = childProcess.spawn(command[0], command.slice(1));
        const killTimeout = setTimeout(function () {
             ps.kill();
             resolve(localizationError)
             logger.warn(FOCNO+"timeout, odom not responding")
         }, x);

        ps.stdout.on('data', data => {
            clearTimeout(killTimeout);
            // console.log("data: "+data)
            resolve(data);
        });

        ps.stderr.on('data', data => {
        	resolve(localizationError)
            logger.warn(FOCNO+data)
        });      	
    }).catch((e) => {logger.crit(FOCNO+e)});
}



module.exports = {
    getVelodyneCoord,
};
