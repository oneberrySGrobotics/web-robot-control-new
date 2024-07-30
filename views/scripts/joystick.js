function serializeToHundred(max, value) {
    return parseInt(100 * (value / max));
}

function adjustSpeed(state, speed, minusValue) {
    // 1=positive
    // 0=positive down
    // -1=negative
    // -2=negative down
    // console.log(state,speed, minusValue)
    if (state == 1) {
        return speed;
    } else if (state == 0) {
        return (speed - minusValue)
    } else if (state == -1) {
        return speed * -1
    } else if (state == -2) {
        return (speed - minusValue) * -1
    }
}

window.onload = function() {
    const events = ['click', 'touchstart'];
    let ind = 15;
    if (window.innerWidth < 1500) {
        ind = (1500 / window.innerWidth) * ind;
    }

    const joystick = nipplejs.create({
        zone: document.getElementById('joystick_container'),
        mode: 'static',
        position: { left: '50%', bottom: '40%' },
        color: 'red',
        size: ((window.innerWidth / 100) * ind)
    });

    let m1=0,m2=0; //add this code locomotorFix 
    let interval; //add this code locomotorFix 
    joystick.on('end', function() { //EXISTING CODE
        clearInterval(interval);//add this code locomotorFix
        interval = null;//add this code locomotorFix
        socket.emit('movement');
    });

    //add this code locomotorFix whole shown method
    joystick.on('shown', function (evt, data) {
        console.log("start....")
        if(!(m1==0 && m2==0)){
            interval = setInterval(function() {
              socket.emit('movement', m1, m2);
            }, 300);

        }
    });
    //end shown method

    joystick.on('move', function(ev, nipple) {
        let distanceFromCenter = parseInt(nipple.distance);
        let angle = parseInt(nipple.angle.degree);

        let maxDistance = parseInt(((window.innerWidth / 100) * ind) / 2);
        let speed = serializeToHundred(maxDistance, distanceFromCenter);
        let leftState = 1,
            rightState = 1,
            minusValue = 0;

        if (distanceFromCenter < 35) {
            socket.emit('movement');
        } else {
            switch (true) {
                case (angle < 20):
                    leftState = 1
                    rightState = -1
                    break;

                case (angle < 70):
                    leftState = 1
                    rightState = 0
                    minusValue = 70 - angle;
                    break;

                case (angle < 110):
                    leftState = 1
                    rightState = 1
                    break;

                case (angle < 160):
                    leftState = 0
                    rightState = 1
                    minusValue = 50 - (160 - angle);
                    break;

                case (angle < 200):
                    leftState = -1
                    rightState = 1
                    break;

                case (angle < 250):
                    leftState = -2
                    rightState = -1
                    minusValue = 250 - angle;
                    break;

                case (angle < 290):
                    leftState = -1
                    rightState = -1
                    break;

                case (angle < 340):
                    leftState = -1
                    rightState = -2
                    minusValue = 50 - (340 - angle);
                    break;

                case (angle >= 340):
                    leftState = 1
                    rightState = -1
                    break;
            }
            m1 = adjustSpeed(leftState, speed, minusValue); //modify this line : delete the word 'var'
            m2 = adjustSpeed(rightState, speed, minusValue); //modify this line : delete the word 'var'
            socket.emit('movement', m1, m2);
            leftState = null;
            rightState = null;
            minusValue = null;
            distanceFromCenter = null;
            angle = null;
            maxDistance = null;
            speed = null;
            // m1 = null; //commend out this/delete this
            // m2 = null; //commend out this/delete this
        }

    });

    const joystickContainer = document.getElementById('joystick_container');
    joystickContainer.addEventListener('touchend', function() {
        socket.emit('movement');
    });
    joystickContainer.addEventListener('mouseup', function() {
        socket.emit('movement');
    });
}