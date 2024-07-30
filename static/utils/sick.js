const childProcess = require("child_process");
let logger = require('../perfect-logger/perfect-logger');
let FOCNO="SIC13 - "
let localizationError="LocalizationError"
let lastLoc=[0,0];
let sopasUrl = "";
const { exec } = require('child_process');  
const axios = require('axios').default;

const getSickCoord = () =>  {
    return axios.post(sopasUrl, {})
            .then(response => {
                // console.log(response.data)
                if (response.data && response.data.data && response.data.data.PositionInfo) {
                    let data = response.data.data.PositionInfo.split(" ");
                    if (data.length) {
                        lastLoc = [data[0], data[1]];
                        // function
                    } else {
                        logger.warn("invalid data received from SICK")
                    }
                } else {
                    logger.crit("no data received from SICK")
                }

                return lastLoc;
            })
            .catch(function(error) {
                logger.warn(FOCNO+"SOPAS:"+error)
                return lastLoc;
            });
}




 function retriveSopasUrl() {
        exec("sed -n '/Sopas_url/p' /opt/robo/bin/data/config.txt", (err, stdout, stderr) => {
            // console.log("stdout:"+stdout)
            // logErrorcb(err, stderr)
            if (stdout) {
                if (stdout.indexOf('\n') > -1) {
                    stdout = stdout.substr(0, stdout.indexOf('\n'));
                }
                let sps = stdout.split(" ");
                if (sps[1]) {
                    sopasUrl = sps[1].replace(/"/g, "");
                    getSickCoord().then(data => {
                        // console.log("data 1: "+data)
                    })
                } //end if sps
            }
        });
    }


module.exports = {
    getSickCoord,
    retriveSopasUrl,
};


