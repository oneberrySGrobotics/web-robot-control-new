socket.on('notif', function(msg) {
    let blockedAudio = getElementById("blockedAudio")
    blockedAudio.muted = false;
    let promise = blockedAudio.play();


    blockoptions.style.display = "block";
    if (promise !== undefined) {
        // console.log("play audio")
        promise.then(result => {
            logger.info(result)
            // Autoplay started!
        }).catch(error => {
            blockwarning.style.display = "block";
        });
    }
});

dismisswarning.onclick = function() {
    let blockwarning = getElementById("blockwarning")
    blockwarning.style.display = "none";
}
takeoverkenobi.onclick = function() {
    if (confirm("Are you sure want to take over KenOBI?")) {
        let blockoptions = getElementById("blockoptions")
        blockoptions.style.display = "none";
        socket.emit('stopAutonomous', "takeoverkenobi");
    }
}
bringkenobihome.onclick = function() {
    if (confirm("Are you sure want to bring KenOBI home?")) {
        let blockoptions = getElementById("blockoptions")
        blockoptions.style.display = "none";
        socket.emit('stopAutonomous', "bringkenobihome");
    }
}
reversepartrolroute.onclick = function() {
    if (confirm("Are you sure want to reverse patrol route?")) {
        let blockoptions = getElementById("blockoptions")
        blockoptions.style.display = "none";
        socket.emit('stopAutonomous', "reversepartrolroute");
    }
}


closeWarning.onclick = function() {
    if (confirm("Are you sure want ignore the robot?")) {
        let blockoptions = getElementById("blockoptions")
        blockoptions.style.display = "none";
        // socket.emit('stopAutonomous',"reversepartrolroute");
    }
}