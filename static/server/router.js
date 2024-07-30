const express = require('express');
const router = express.Router();
const socketClient = require('socket.io-client')('http://localhost:3000');
const { exec } = require('child_process');
const config = require('../../config.json');

const releaseEmergency = function() {
    exec(`${config.CWD}${config.ROBO_GPIO} 4 0`, (err, stdout, stderr) => {
        if (err) {
            return stderr;
        } else {
            return stdout;
        }
    });
};


router
    .post('/call', (req, res) => {
        console.log('calling');
        socketClient.emit('make_call', false);
        res.send(200);
    })
    .post('/api/gpio', (req, res) => {
        const gpioMap = [{
                value: 'Emergency Warning Collision'
            },
            {
                value: 'Left Collision Warning'
            },
            {
                value: 'Right Collision Warning'
            },
            {
                value: 'Something here'
            },
            {
                value: 'Another one here'
            },
            {
                value: 'Just Another One'
            },
            {
                value: 'Also Another One'
            },
            {
                value: 'DISMISS STATUS'
            }
        ]

        const data = req.body;
        let valuesChanged = [];

        if ((data[0].gpio_value === 1 && data[7].gpio_value === 0) || (data[0].gpio_value === 0 && data[7].gpio_value === 0)) {

            data.forEach((item, index) => {
                if (item.gpio_value === 1) {
                    socketClient.emit('gpio', gpioMap[index].value, true)
                    valuesChanged.push(gpioMap[index].value)
                } else {
                    socketClient.emit('gpio', gpioMap[index].value, false)
                }
            });
        } else if (data[0].gpio_value === 0) {
            releaseEmergency();
            socketClient.emit('gpio', gpioMap[0].value, false);
        } else if (data[0].gpio_value === 1 && data[7].gpio_value === 1) {
            // console.log('no dismiss')
            socketClient.emit('gpio', gpioMap[0].value, false);
        }


        res.send(valuesChanged);
    });

module.exports = router;