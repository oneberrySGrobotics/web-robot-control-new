
let logger = require('../perfect-logger/perfect-logger');

let prevLightState = 888;
let motorDirection;
const { exec } = require('child_process');
    let speedIndex = 4;
    const config = require('../../config.json');

function addspeed(){
	speedIndex = speedIndex + 0.5;
}
function reducespeed(){
	if (speedIndex > 0) {
        speedIndex = speedIndex - 0.5;
    }
}


let FOCNO="MOT13 - "

function locoMotor(m1, m2) {
        try{
            
            manipulatingLight(m1,m2);
  
			if(speedIndex>10){speedIndex=10}
			m1=m1 * speedIndex;
			m2=m2 * speedIndex;
			// console.log(m1,m2)
					
			let result="";


    		if(config.DRIVERCTR=="SABERTOOTH"){
	        	
                result = "echo M1:" + m1 + " > /dev/ttyACM0\n";
                result += "echo M2:" + m2 + " > /dev/ttyACM0\n";
                result += "echo M1:" + m1 + " > /dev/ttyACM1\n";
                result += "echo M2:" + m2 + " > /dev/ttyACM1";

    		}else if(config.DRIVERCTR=="ROBOTEQMIX"){
    			//new motor configuration m1=a+b (Forward speed  + turning speed), m2= a-b (throttle -steering )           
				//input from -100  to 100 .. converted to max motor input -1000 to 1000 for SpeedIndex 10
//				lower speed index to reduce max speed
				if(speedIndex>10){speedIndex=10}
				m1=m1 * speedIndex
				m2=m2 * speedIndex
				let fs = m1+b;
				let ts = m1-b;
				if(fs>1000){
					fs=1000
				}else if(fs<-1000){
					fs=-1000
				}
				if(ts>1000){
					ts=1000
				}else if(ts<-1000){
					ts=-1000
				}
            	result =  "echo '!M " + fs + " "+ ts +"' \r > /dev/ttyRobo \n";

    		}else { //ROBOTEQSEP
                
                result = "echo '!M " + m1 + " "+ m2 +"' \r > /dev/ttyRobo \n";
                result += "echo '@02!G  1  "+ m1 +"'\r > /dev/ttyRobo \n";
                result += "echo '@02!G  2  "+ m2 +"'\r > /dev/ttyRobo \n";
                
    		}



            exec(result,execCallback);
        }catch(e){
            logger.crit(FOCNO+e);
        }
    }


function manipulatingLight(m1,m2){
	if (m1 > 0 && m2 > 0) {
    	motorDirection="forward";
        lightState = 3;
    } else if (m1 < 0 && m2 < 0) {
    	motorDirection="backward";
        lightState = 4;
    } else if (m1 < 0 && m2 >= 0) {
    	motorDirection="left";
        lightState = 1;
    } else if (m1 >= 0 && m2 < 0) {
    	motorDirection="right";
        lightState = 1;
    } else {
    	motorDirection="stop";
        lightState = 1;
    }

    if(motorDirection=="forward"){
    	lightState=3;
    }else if(motorDirection=="backward"){
    	lightState=4;
    }else{
    	lightState=1;
    }



    if (lightState != prevLightState) {
        exec("python /opt/robo/bin/gpOutput.py " + lightState, execCallback);
        
        prevLightState = lightState;
    }

}

   function execCallback(err, stdout, stderr) {
        if (err) {
            logger.crit(FOCNO+err)
        }
        if (stdout) {
            logger.info(FOCNO+stdout)
        }
        if (stderr) {
            logger.crit(FOCNO+stderr)
        }
    }



module.exports = {
locoMotor,
addspeed,
reducespeed
};

