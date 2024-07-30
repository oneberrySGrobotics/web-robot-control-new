/***********************************************************
 ******************* EMERGENCY WARNING **********************
 ************************************************************/

const leftCollisionGraphic = document.getElementById('left-collision');
const rightCollisionGraphic = document.getElementById('right-collision');
const emergencyCollisionGraphic = document.getElementById('emergency-collision');
const backgroundWrapper = document.getElementById('collision-warning-wrapper');
const dismissButton = document.getElementById('dismiss-emergency')

// socket.on('emergency-dismissed', function () {
//   console.log('back to the client from the server');
// });

dismissButton.addEventListener('click', function() {
    // console.log('emitting the dismiss');
    socket.emit('dismissEmergency');

    var elementsToCheck = [
        leftCollisionGraphic,
        rightCollisionGraphic,
        emergencyCollisionGraphic,
        backgroundWrapper
    ];

    elementsToCheck.forEach(element => {
        if (element.classList.contains('active')) {
            element.classList.remove('active');
        } else if (element.classList.contains('emergency')) {
            element.classList.remove('emergency')
        } else {
            // console.log('Done!');
        }
    });
});

dismissButton.addEventListener('touchstart', function() {
    // console.log('emitting the dismiss');
    controlLock = true;
    socket.emit('dismissEmergency');

    const elementsToCheck = [
        leftCollisionGraphic,
        rightCollisionGraphic,
        emergencyCollisionGraphic,
        backgroundWrapper
    ];

    elementsToCheck.forEach(element => {
        if (element.classList.contains('active')) {
            element.classList.remove('active');
        } else if (element.classList.contains('emergency')) {
            element.classList.remove('emergency')
        } else {
            // console.log('Done!');
        }
    });
});