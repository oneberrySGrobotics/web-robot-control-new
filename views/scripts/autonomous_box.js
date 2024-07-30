/*initialize canvas*/

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})
canvasTrans.addEventListener('mousedown', function(e) {
    getCursorPosition(canvasTrans, e)
})

loadCanvas();

/***********************************************************
 *************** canvas image map handling ********************
 ************************************************************/



function scaleIt(source, scaleFactor) {
    let c = document.createElement('canvas');
    let ctxs = c.getContext('2d');
    let w = source.width * scaleFactor;
    let h = source.height * scaleFactor;
    c.width = w;
    c.height = h;
    ctxs.fillStyle = "rgba(255, 255, 255, 0.0)";
    ctxs.fillRect(0, 0, w, h);
    ctxs.drawImage(source, 0, 0, w, h);
    ctxs.strokeStyle = "red";
    ctxs.beginPath();
    ctxs.lineWidth = 2;
    ctxs.moveTo(w / 5, h / 4);
    ctxs.lineTo(0, 0);
    ctxs.lineTo(h / 3, h / 5);
    ctxs.lineTo(1, 1);
    ctxs.closePath();
    ctxs.stroke();
    return (c);
}

function scalingLength(max, min) {
    let x = (max - min) / 4; //scaling from max - min width
    let ratio = 5 - window.devicePixelRatio;
    return min + (x * ratio);

}

window.addEventListener('load', function() {

    let img = new Image,
        ctx3 = document.getElementById('canvasmapRobotPosition').getContext('2d');

    img.src = 'images/konob-icon_50px.png';
    img.classList.add("robotLocationimgCanvas");
    img.addEventListener('load', function() {

        setInterval(function() {


            return function() {


                let w = scalingLength(63, 27);
                let h = scalingLength(53, 26);

                ctx3.clearRect(0, 0, ctx3.canvas.width, ctx3.canvas.height);
                let c1 = scaleIt(img, 1);
                ctx3.drawImage(c1, robotLocX, robotLocY, w, h);

            };
        }(), 500);
    }, false);
}, false);

getClickableArea();
getCalibratedData();


var isBypassOn = false;

bypass.onclick = function() {
    if (!isBypassOn) {
        document.getElementById("bypassImg").src = "images/bypassOn.png";
        socket.emit("bypassOn");
    } else {
        document.getElementById("bypassImg").src = "images/bypassOff.png";
        socket.emit("bypassOff");
    }

    isBypassOn = !isBypassOn;
}

ptzUp.onmousedown = function() {
    socket.emit("ptzUp")
}


ptzUp.onmouseup = function() {
    socket.emit("ptzStop")
}

ptzDown.onmousedown = function() {
    socket.emit("ptzDown")
}


ptzDown.onmouseup = function() {
    socket.emit("ptzStop")
}

lightButton.onclick = function() {
    socket.emit("light")
}


// ---------------------------------------------------

var isCharging=false;
charging.onclick = function() {
    if(isCharging){
        socket.emit("chargingOn")
    }else{
        socket.emit("chargingOff")
    }
    isCharging=!isCharging;
}

resumeAutonomous.onclick = function() {
    if (autonomousProfileSelect.options.selectedIndex == 0) {

        alerti("Please select some profile")
        return
    }
    showRobot();
    startAutonomousBtn.classList.add("not-allowed");
    randomRoute.classList.add("not-allowed");
    autonomousProfileSelect.classList.add("not-allowed");
    startAutonomousBtn.disabled = true;
    deleteProfile.disabled = true;
    socket.emit("resumeAutonomous",autonomousProfileSelect.value);
}


speedup.onclick = function() {
    socket.emit("speedup");
}


speeddown.onclick = function() {
    socket.emit("speeddown");
}

autonomousSwitch.onclick = function() {
    if (autonomousSwitch.value == "done") {
        calibrateswitch.style.display = "block";
        autonomousSwitch.value = "autonomous";
        autonomousSwitch.innerText = "Autonomous";
        // socket.emit("stopROSCORE");
        document.getElementById('controlCenter').style.display = "none";
        document.getElementById('controlTab').style.display = "none";
    } else {
        // socket.emit("startROSCORE");
        getCalibratedData();
        document.getElementById('controlCenter').style.display = "block";
        document.getElementById('controlTab').style.display = "block";
        calibrateswitch.style.display = "none";
        autonomousSwitch.value = "done";
        autonomousSwitch.innerText = "Home";
        document.getElementById('runAutonomous').click();
    }
}


robotLocationButton.onclick = function() {
    // console.log(robotLocationButton.value);

    if (robotLocationButton.value == "show") {
        showRobot();
    } else {
        hideRobot();
    }
    robotLocationButton.disabled = true;
    setTimeout(function() {
        robotLocationButton.disabled = false;
    }, 500);
}

startAutonomousBtn.onclick = function() {
    if (autonomousProfileSelect.options.selectedIndex == 0) {

        alerti("Please select some profile")
        return
    }
    showRobot();
    startAutonomousBtn.classList.add("not-allowed");
    randomRoute.classList.add("not-allowed");
    autonomousProfileSelect.classList.add("not-allowed");
    startAutonomousBtn.disabled = true;
    deleteProfile.disabled = true;

    socket.emit('startAutonomous', autonomousProfileSelect.value);
}


stopAutonomousBtn.onclick = function() {
    setTimeout(function() {
        startAutonomousBtn.disabled = false;
        autonomousProfileSelect.classList.remove("not-allowed");
        startAutonomousBtn.classList.remove("not-allowed");
        randomRoute.classList.remove("not-allowed");
    }, 2000);
    console.log("s")
    socket.emit('stopAutonomous', "takeoverkenobi");
}

randomRoute.onclick = function() {
    isPaintRandomCoor = 1;
    loadCanvas();
    getClickableArea();
    socket.emit("getRobotCoord", 1);
    autonomousProfileSelect.disabled = true;
    autonomousProfileSelect.classList.add("not-allowed");
    startAutonomousBtn.classList.add("not-allowed");
    startAutonomousBtn.disabled = true;
    randomRoute.classList.add("not-allowed");
    randomRoute.disabled = true;
    setTimeout(function() {}, 2000);
}

openAutonomousBoxButton.onclick = function() {
    document.getElementById('autonomous-box').setAttribute('data-visibility', true);
    getDataProfile();
    getCalibratedData();
}

closeAutonomousBoxButton.onclick = function() {
    document.getElementById('autonomous-box').setAttribute('data-visibility', false);
}

autonomousProfileSelect.onchange = function() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    loadCanvas();
    getClickableArea();
    socket.emit("getRouteProfileData", autonomousProfileSelect.options[autonomousProfileSelect.options.selectedIndex].value);
}
















/*****************************socket****************************/





socket.on('stop', function() {
    startAutonomousBtn.classList.remove("not-allowed");
});


socket.on('autonomousResumed', function() {
    alerti("Autonomous resumed to the nearest point from the robotCoor")
});

socket.on('msgx', function(msgs) {
    alerti(msgs)
});

socket.on('msgsc', function(msgs) {
    alerts(msgs)
});
socket.on('wrongSopasUrl', function() {
    // console.log("wrongSopasUrl")
    alertw("Wrong Sopas Url!\n please Update accordingly and \nrefresh the page")
});

socket.on('RobotNotInPath', function() {
    // console.log("wrongSopasUrl")
    
    var audio = document.getElementById("outOfGreenZoneAudio");
    audio.play();

    alertw("Warning!\n Robot OUT OF Green Zone \nPlease take over");
});


socket.on('robotCoord', function(coorArr) {
    if (coorArr && coorArr.length) {
        // console.log(coorArr)
        let robotCoor = getCanvasCoordinate(coorArr[0], coorArr[1]);
        // console.log(robotCoor)

        //checking if robot is in greenzone else stop robot
        if (!ctx.isPointInPath(robotCoor[0], robotCoor[1])) {
            // alertw("Robot is not in greenz, stopping robot!")
            // socket.emit('stopAutonomous', "takeoverkenobi");
            // socket.emit("getRobotCoord", 0);
        }
        // else {
        //     console.log("is in Gz")
        // }


        // robotLocX=(Number(coorArr[0])*Number(sickMapScale))+Number(XcanvassOffsetToZeroSick);
        // robotLocY=((Number(coorArr[1])*-1)*Number(sickMapScale))+Number(YcanvassOffsetToZeroSick);
        robotLocX = robotCoor[0];
        robotLocY = robotCoor[1];
    }else{
        console.log("no robotCoord")
    }

});


socket.on('autonomousSetting', async function(data) {
    let settingList = data.split(/\n/);
    let container = document.getElementById("autonomousSetting");
    let elem,h3c,input, counter = 1;
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    for (let i = 0; i < settingList.length; i++) {
        if (settingList[i] == "") {
            continue
        }
        elem = settingList[i].split(" ");


        h3c = document.createElement("p");
        h3c.classList.add("listing");
        input = document.createElement("input");
        input.classList.add("input");
        input.type = "text";
        input.id = "AutonomousSetting" + counter;
        input.name = elem[0];
        input.value = elem[1];
        h3c.appendChild(document.createTextNode((counter) + ". " + elem[0].replace(/_/g, " ") + " : "));
        h3c.appendChild(document.createElement("br"))
        h3c.appendChild(input);
        // input2 = document.createElement("input");
        // input2.classList.add("text");
        // input2.type = "text";
        // input2.name = "delay" + counter;
        // input2.id = "delay" + counter;
        // h3c.appendChild(input2);
        container.appendChild(h3c);
        counter++;

    }
    elem=null;
    h3c=null;
    input=null;
    counter =null;

});
socket.on('calibratedData', async function(msg) {
    let data = msg.split(";");
    if (data.length == 4) {

        XcanvassOffsetToZeroSick = Number(data[0]); //x according to canvas (horizontal)
        YcanvassOffsetToZeroSick = Number(data[1]); // y according to canvas (vertical)
        // robotLocX=Number(data[0]) ; //x according to canvas (horizontal)
        // robotLocY=Number(data[1]); // y according to canvas (vertical)
        sickMapScale = Number(data[2]);

        isTransformXY = (data[3].localeCompare("true")) == 1;
        // 
        // 
        // await sleep(5000);

        document.getElementById('xCanvassoffset').value = data[0];
        document.getElementById('yCanvassoffset').value = data[1];
        document.getElementById('canvasScaleToMap').value = data[2];
        document.getElementById('transformCanvasXY').checked = JSON.parse(data[3]);
    }
});
socket.on('getRouteProfileListCallBack', function(arrs) {
    // selectObject=document.getElementById('autonomousProfileSelect');
    let selected = 0;
    for (let i = 0; i < arrs.length; i++) {
        let option = document.createElement('option');
        if (selectProfileValue == arrs[i]) {
            selected = i;
        }
        option.setAttribute('value', arrs[i]);
        option.appendChild(document.createTextNode(arrs[i]));
        autonomousProfileSelect.appendChild(option);
    }
    autonomousProfileSelect.options.selectedIndex = 0;

    // deleteObject=document.getElementById('autonomousProfileDelete');
    for (var i = 0; i < arrs.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', arrs[i]);
        if (deleteProfileValue == arrs[i]) {
            selected = i;
        }
        option.appendChild(document.createTextNode(arrs[i]));
        autonomousProfileDelete.appendChild(option);
    }

    autonomousProfileDelete.options.selectedIndex = selected + 1;
    if (isDeletingProfile) {
        autonomousProfileDelete.onchange();
    }
});

socket.on("refreshProfile", function() {
    getDataProfile(true);
});

socket.on("refreshAddRoute", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loadCanvas();
    routeCoord = [];
    routeName.value = "";
    getDataProfile(true);

    // getCalibratedData();
    getClickableArea();
});


/*clickableCoordinate*/
socket.on('ClickableArea', function(msg) {
    let xy = 0;
    let counter = 0;
    let res = msg.split(";");
    arr = [];
    for (let i = 0; i < res.length; i++) {
        if (res[i].indexOf(",") > -1) {
            xy = res[i].split(",");
            if (xy[0] && xy[1] && xy[0].trim() != "" && xy[1].trim() != "") {
                arr.push({ x: xy[0], y: xy[1] });
            }
        }
    }
    let x, y,h3c,input;
    let container = document.getElementById("zoneCoor");
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    for (let i = 0; i < arr.length; i++) {
        // container.appendChild
        x = arr[i].x;
        y = arr[i].y;
        // canvassXY=getCanvasCoordinate(val[0],val[1]);
        // container.appendChild(document.createElement("h2"));
        h3c = document.createElement("h3");
        input = document.createElement("input");
        input.classList.add("text");
        input.type = "text";
        input.name = "green" + counter;
        input.id = "green" + counter;
        input.value = x + ",   " + y;
        h3c.appendChild(document.createTextNode((counter + 1) + ". "));
        h3c.appendChild(input);
        // input2 = document.createElement("input");
        // input2.classList.add("text");
        // input2.type = "text";
        // input2.name = "delay" + counter;
        // input2.id = "delay" + counter;
        // h3c.appendChild(input2);
        container.appendChild(h3c);
        counter++;
    }


    // var c = document.getElementById("canvasmap");
    ctx = canvas.getContext("2d");
    // var img = new Image(); 
    // img.src = 'images/map1.png';/*initialize map image*/
    // img.onload = function() {    // after the pic is loaded
    //   ctx.drawImage(this, 0, 0, img.width,    img.height, 0, 0, canvas.width, canvas.height);// add the picture

    /*start creating a clickable area*/
    if (arr.length) {
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
            if (isCustomizeZone) {
                ctx.fillText(i + 1, x, y);

            }
        }
        ctx.fillStyle = "rgba(35, 255, 0 , 0.1)";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.stroke();


    } else {
        ctx.font = "30px Arial";
        ctx.fillStyle = "rgba(35, 255, 255, 1)";
        ctx.fillText("PLEASE CALIBRATE FIRST", 110, 110);
    }


    isCanvasLoad = 1;
    if (isPaintRandomCoor) {
        paintRandomCoord();
        isPaintRandomCoor = 0;

    }


    x=null;
    y=null;
    h3c=null;
    input=null;

    // };
});





/*end RouteProfileDataCallBack*/
socket.on('RouteProfileDataCallBack', async function(msg) {
    let res = msg.split("===");
    res[0] = res[0].replace(/\s/g, "");
    let soundarr;
    if (res[1] && res[1] != "") {
        soundarr = res[1].split(/\n/);
        // 
    }
    let option;

    let selectAudio = document.createElement("select");
    option = document.createElement('option');
    option.setAttribute('value', "");
    option.appendChild(document.createTextNode(""));
    selectAudio.appendChild(option);
    selectAudio.classList.add("audio");
    for (var j = 0; j < soundarr.length; j++) {
        if (soundarr[j] == "") {
            continue;
        }
        let option = document.createElement('option');
        option.setAttribute('value', soundarr[j]);
        option.appendChild(document.createTextNode(soundarr[j]));
        selectAudio.appendChild(option);
    }

    var coorx, coory;
    await sleep(500);
    if (res[0] == "") {

        getDataProfile();
    } else {

        let arrx = res[0].split(":");
        let isUsable = 1;
        let val = [];
        let canvassXY;
        for (let i = arrx.length - 1; i > -1; i--) {
            if (arrx[i].trim() == "") {
                arrx.splice(i, 1);
                continue;
            }
            val = arrx[i].split(",");
            if (val[0].endsWith("d") || val[1].endsWith("s")) {
                continue;
            }
            canvassXY = getCanvasCoordinate(val[0], val[1])
            if (!ctx.isPointInPath(canvassXY[0], canvassXY[1])) {
                isUsable = 0;
                break;
            }
            // arrx[i]=canvassXY[0]+","+canvassXY[1];
        }

        if (isUsable || isCustomizeRoute) {

            let container = document.getElementById("customCoor");
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            let input = document.createElement("input");
            let input2 = document.createElement("input");

            let h3c,counter = 0;
            for (let i = 0; i < arrx.length; i++) {
                val = arrx[i].split(",");
                if(i==arrx.length-1){
                    if (val[0].endsWith("d")) {
                        input2.value = val[0].substr(0, val[0].indexOf("d"));
                        // input3.value = val[1];
                        continue;
                    }

                }else{
                    
                    if (val[1].endsWith("s")) {
                        input2.value = val[1].substr(0, val[1].indexOf("s"));
                        // input3.value = val[1];
                        continue;
                    }
                }
                canvassXY = getCanvasCoordinate(val[0], val[1]);
                // container.appendChild(document.createElement("h2"));
                h3c = document.createElement("h3");
                input = document.createElement("input");
                input.classList.add("text");
                input.type = "text";
                input.name = "coor" + counter;
                input.id = "coor" + counter;
                input.value = val[0] + ",   " + val[1];
                h3c.appendChild(document.createTextNode((counter + 1) + ". "));
                h3c.appendChild(input);
                input2 = document.createElement("input");
                input2.classList.add("number");
                input2.type = "text";
                input2.name = "delay" + counter;
                input2.id = "delay" + counter;
                h3c.appendChild(input2);
                input3 = selectAudio.cloneNode(true);
                input3.name = "audio" + counter;
                input3.id = "audio" + counter;
                h3c.appendChild(input3);
                container.appendChild(h3c);
                input2.value = 0;

                ctx.fillStyle = "red";
                coorx = canvassXY[0];
                coory = canvassXY[1];
                ctx.font = "10px Arial";

                ctx.beginPath();
                drawPoint(counter + 1, coorx, coory);
                ctx.fill();
                counter++;
            }
        } else {

            autonomousProfileSelect.options.selectedIndex = 0;
            alertw("This Profile cant be used!\n  point are not in accessible area,\n please adjust in customize route");
        }

    } //end else
});

// sessionExpiration(idleMinutes = 15, warningMinutes = 14, logoutUrl = '/logout');