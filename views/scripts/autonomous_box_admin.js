calibrateswitch.onclick = function() {
    count = 0;
    if (calibrateswitch.value == "done") {
        autonomousSwitch.style.display = "block";
        calibrateswitch.value = "calibrate";
        calibrateswitch.innerText = "Map Calibration";
        calibrateswitchStatus = false;
        setCalibrationInterface(false);
        getCalibratedData();
    } else {
        autonomousSwitch.style.display = "none";
        calibrateswitchStatus = true;
        calibrateswitch.value = "done";
        calibrateswitch.innerText = "Home";
        setCalibrationInterface(true);
        document.getElementById('offsetbtn').click();
    }
}

// autonomousSwitch.onclick= function(){

//   if(autonomousSwitch.value=="done"){
//     calibrateswitch.style.display="block";
//   }else{
//     calibrateswitch.style.display="none";
//   }
// }

updateAutonomousSetting.onclick = function() {
    // console.log("updateAutonomousSetting");
    var counter = 0;
    var elem;
    var res = "";

    while (true) {
        counter++;
        elem = null
        elem = document.getElementById("AutonomousSetting" + counter);
        if (!elem) {
            break;
        }
        res += elem.name + " " + elem.value + "\n"

    }
    socket.emit("updateAutonomousSetting", res);
    // alerti("setting Updated, Please Re-run autonomous for it to take effect")
}




clearLastRouteBtn.onclick = function() {
    if (routeCoord.length) {
        var s = routeCoord.pop();
        s = getCanvasCoordinate(s.x, s.y)
        // console.log(s)
        // console.log(routeCoord)
        loadCanvas();
        getClickableArea()
        setTimeout(function() {
            ctx.fillStyle = "#FF0000";
            ctx.strokeStyle = "black";
            ctx.font = "10px Arial";
            ctx.fillStyle = "#FF0B0B";
            for (var i = 0; i < routeCoord.length; i++) {
                s = getCanvasCoordinate(routeCoord[i].x, routeCoord[i].y)
                drawPoint(i + 1, s[0], s[1])
            }
        }, 1000);
        count--;
        // ctx. = "#FF0000";
        // ctx.fillRect(s[0]- 6, s[1]- 15, 11, 15);
        // drawPoint(count,s[0], s[1]);
        // clearPoint(routeCoord.length, s[0], s[1]);
        // printObjectArrayWithBracket(calibrateCoord);
    }
}

autonomousProfileDelete.onchange = function() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    loadCanvas();
    getClickableArea();
    socket.emit("getRouteProfileData", autonomousProfileDelete.options[autonomousProfileDelete.options.selectedIndex].value);
}


deleteForm.onsubmit = function() {
    if (autonomousProfileDelete.options.selectedIndex == 0) {
        alerti("please select some profile to delete")
        return false
    }

    if (confirm("are you sure want to delete this profile " + autonomousProfileDelete.value)) {
        return true;
    }else{
        return false;
    }

}



addRouteBtn.onclick = function() {

    setTimeout(function(){ 
        window.stop() 
    }, 1500);
}
deleteProfile.onclick = function() {

    setTimeout(function(){ 
        window.stop() 
    }, 1500);
}
addRouteForm.onsubmit = function() {

    var routeName = document.getElementById('routeName');
    if (routeName.value.trim() == "" || !routeCoord.length) {
        alerti("Route name is Empty or no point exist in map");
        return false;
    }
    // return false
    if(invalidRouteName.hidden==false){
        return false;
    }
    routeCoordinate.value=JSON.stringify(routeCoord);


}




updateRoute.onclick = function() {
    console.log('Connected to websocket server.'); 
    var container = document.getElementById("customCoor");
    var child;
    var coor;
    var data = "";
    var profileName = document.getElementById("autonomousProfileDelete").value.split('.');
    console.log(profileName[0]);
    routeCoord = [];
    socket.emit("clearProfile", profileName[0]);
    for (var i = 0; i < container.children.length; i++) {
        child = container.children[i];
        //console.log(child); //
        //socket.emit('wp_No', child); //
        if (document.getElementById("coor" + i).value == "") {
            continue;
        }
        coor = document.getElementById("coor" + i).value.split(' ').join('').split(",");
        console.log(coor); //
        //socket.emit('wp_No', i); //
        if (checkInp(coor[0]) || checkInp(coor[1]) ||
            checkInp(document.getElementById("delay" + i).value)) {
            alerti("data no." + (i + 1) + " is not number ")
            return;
        }

        routeCoord.push({ x: Number(coor[0]).toFixed(6), y: Number(coor[1]).toFixed(6) });
        let xDelay = document.getElementById("delay" + i).value;
        let yAudio = document.getElementById("audio" + i).value;
        socket.emit('wp_No', profileName[0], i, yAudio); //

        if (xDelay != 0 || yAudio != "") {
            if(i==container.children.length-1){
                routeCoord.push({ x: xDelay + "d", y: "0s" });
            }else{
                routeCoord.push({ x:"888d", y: xDelay + "s" });
            }
        }


    }
    socket.emit('addAutonomousPath', document.getElementById('autonomousProfileDelete').value.trim(), routeCoord);
    setTimeout(function() {
        document.getElementById('autonomousProfileDelete').onchange();
    }, 800);

}



resetOffset.onclick = function() {
	
		  	offsetArr=[];
		  document.getElementById('xCanvassoffset').value = "";
        document.getElementById('yCanvassoffset').value = "";
        document.getElementById('canvasScaleToMap').value = "";

}
getCanvasOffset.onclick = function() {
    var xoffsetValue = document.getElementById('xCanvassoffset').value;
    var yoffsetValue = document.getElementById('yCanvassoffset').value;
    var canvasScaleToMap = document.getElementById('canvasScaleToMap').value;
    var transformCanvasXY = document.getElementById('transformCanvasXY').checked;
    socket.emit("saveCalibrationValue", xoffsetValue, yoffsetValue, canvasScaleToMap, transformCanvasXY);

    alerti("value sent");
    XcanvassOffsetToZeroSick = xoffsetValue; //x according to canvas (horizontal)
    YcanvassOffsetToZeroSick = yoffsetValue; // y according to canvas (horizontal)
    sickMapScale = canvasScaleToMap;
    isTransformXY = transformCanvasXY;

}


updateCustomGreenZone.onclick = function() {
    var container = document.getElementById("zoneCoor");
    calibrateCoord = [];
    var child;
    var coor;
    var data = "";
    for (var i = 0; i < container.children.length; i++) {
        child = container.children[i];
        if (document.getElementById("green" + i).value == "") {
            continue;
        }
        coor = document.getElementById("green" + i).value.split(' ').join('').split(",");
        if (checkInp(coor[0]) || checkInp(coor[1])) {
            alertw("data no." + (i + 1) + " is not number ")
            return;
        }
        calibrateCoord.push({ x: Number(coor[0]).toFixed(6), y: Number(coor[1]).toFixed(6) });
    }

    if (calibrateCoord.length) {
        if (confirm("are you sure to OVERWRITE Previous calibration")) {
            socket.emit('saveGreenZoneCoor', calibrateCoord);

            updateCustomGreenZone.disabled = true;
            setTimeout(function() {
                calibrateCoord = [];
                updateCustomGreenZone.disabled = false;
                getClickableArea();
            }, 1500);
        }
        loadCanvas();
    }
}




updateGreenZone.onclick = function() {
    if (calibrateCoord.length) {
        if (confirm("are you sure to OVERWRITE Previous calibration")) {
            socket.emit('saveGreenZoneCoor', calibrateCoord);

            updateGreenZone.disabled = true;
            setTimeout(function() {
                calibrateCoord = [];
                updateGreenZone.disabled = false;
                getClickableArea();
            }, 1500);
        }
        loadCanvas();
    }
}




clearLastCalibrationBtn.onclick = function() {
    if (calibrateCoord.length) {
        var s = calibrateCoord.pop();
        ctx.clearRect(s.x - calibrateXoffset, s.y - calibrateYoffset, calibrateDimention, calibrateDimention);
        // printObjectArrayWithBracket(calibrateCoord);
    }
}