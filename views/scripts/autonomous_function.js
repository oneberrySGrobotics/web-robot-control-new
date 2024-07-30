function showRobot() {
    socket.emit("getRobotCoord", 1);
    let robotLocationButton = document.getElementById("robotLocationButton");
    robotLocationButton.value = "hide";
}

function hideRobot() {
    let robotLocationButton = document.getElementById("robotLocationButton");
    robotLocationButton.value = "show";
    socket.emit("getRobotCoord", 0);
    sleep(1)
    robotLocX = 10000;
    robotLocY = 10000;
}

function requestAutonomousSetting() {
    // console.log("requestAutonomousSetting")
    socket.emit("getAutonomousSetting")
}

function drawPoint(count, x, y) {
    strokeTextXoffset = 3;
    strokeTextYoffset = -7;
    // ctx.beginPath(); 
    ctx.fillText(count, x - strokeTextXoffset, y + strokeTextYoffset);
    // ctx.strokeText(count, x-strokeTextXoffset, y+strokeTextYoffset );
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.closePath();
    ctx.stroke();

}

function clearPoint(count, x, y) {
    strokeTextXoffset = 3;
    strokeTextYoffset = -7;

    ctx.fillStyle = "#FF0B0B";
    ctx.fillText(count, x - strokeTextXoffset, y + strokeTextYoffset);
    // ctx.strokeText(count, x-strokeTextXoffset, y+strokeTextYoffset );
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.closePath();
    ctx.stroke();
}


function paintRandomCoord() {
    let coorx;
    let coory;
    let minx = 190;
    var maxxmaxx = 911;
    let miny = 367;
    let maxy = 588;
    let randomArr = [];
    let startingCoorArr = [];
    let endingCoorArr = [];

    startingCoorArr.push(getCanvasCoordinate2(2.116531, 0.225123));
    startingCoorArr.push(getCanvasCoordinate2(2.165311, 3.688537));
    endingCoorArr.push(getCanvasCoordinate2(2.804878, 9.254472));
    endingCoorArr.push(getCanvasCoordinate2(2.097561, 0.984959));
    endingCoorArr.push(getCanvasCoordinate2(0.283902, 0.006504));
    endingCoorArr.push(getCanvasCoordinate2(0.582827, 0.060500));

    for (var i = 0; i < startingCoorArr.length; i++) {
        if (ctx.isPointInPath(startingCoorArr[i].x, startingCoorArr[i].y)) {
            randomArr.push({ x: startingCoorArr[i].x, y: startingCoorArr[i].y });
            // routeCoord.push(getSickCoordinate(coorx,coory));
        }
    }

    count = 0;
    for (var i = 0; i < 10; i++) {
        coorx = randomIntFromInterval(minx, maxx);
        coory = randomIntFromInterval(miny, maxy);
        // 
        if (ctx.isPointInPath(coorx, coory)) {
            randomArr.push({ x: coorx, y: coory });
        }
    }

    for (var i = 0; i < endingCoorArr.length; i++) {
        if (ctx.isPointInPath(endingCoorArr[i].x, endingCoorArr[i].y)) {
            randomArr.push({ x: endingCoorArr[i].x, y: endingCoorArr[i].y });
            // routeCoord.push(getSickCoordinate(coorx,coory));
        }
    }
    var sickRand = [];

    for (var i = 0; i < randomArr.length; i++) {
        count++;
        coorx = randomArr[i].x;
        coory = randomArr[i].y;
        ctx.fillStyle = "red";
        ctx.font = "10px Arial";


        drawPoint(count, coorx, coory);
        sickRand.push(getSickCoordinate(coorx, coory));
    }
    socket.emit("startRandnomous", sickRand);



    sickRand=null;
    coorx=null;
    coory=null;
    miny =null;
    maxx =null;
    maxy =null;
    randomArr =null;
    startingCoorArr =null;
    endingCoorArr =null;
}




function setCalibrationInterface(calibrate) {
    if (calibrate) {
        isGetcanvassOffset = 0;
        document.getElementById('calibrateTab').style.display = "block";
        document.getElementById('calibrationCenter').style.display = "block";
        calibrateCoord = [];
    } else {
        isGetcanvassOffset = 1;
        document.getElementById('calibrateTab').style.display = "none";
        document.getElementById('calibrationCenter').style.display = "none";

    }
}



function getClickableArea() {
    socket.emit('getClickableArea');
}

function getCalibratedData() {
    socket.emit("getCalibratedData");
}

function clearDataProfile(autonomousProfile) {
    let select = document.getElementById(autonomousProfile);
    if (select.length) {
        for (var i = select.length - 1; i > 0; i--) {
            select.remove(i);
        }
    }
    select=null;
}

function getDataProfile(clear) {
    //    console.log("getDataProfile")
    let autonomousProfileSelect=document.getElementById('autonomousProfileSelect')
    let autonomousProfileDelete=document.getElementById('autonomousProfileDelete')

    if(autonomousProfileDelete.options.selectedIndex<0){
        autonomousProfileDelete.options.selectedIndex=0;
    }
    selectProfileValue = autonomousProfileSelect.options[autonomousProfileSelect.options.selectedIndex].value;

    deleteProfileValue = autonomousProfileDelete.options[autonomousProfileDelete.options.selectedIndex].value;
    if (clear) {
        clearDataProfile("autonomousProfileSelect");
        clearDataProfile("autonomousProfileDelete");
    }    
    sleep(1000);
    socket.emit('getRouteProfileList');
    autonomousProfileSelect=null
    autonomousProfileDelete=null

}


function getCanvasCoordinate(sickx, sicky) {
    if (isTransformXY) {
        let temp = sickx;
        sickx = sicky;
        sicky = temp;
    } else {
        sicky *= -1;
    }

    let coorx = (Number(sickx) * Number(sickMapScale)) + Number(XcanvassOffsetToZeroSick);
    let coory = (Number(sicky) * Number(sickMapScale)) + Number(YcanvassOffsetToZeroSick);
    return [coorx, coory]
    
}

function getCanvasCoordinate2(sickx, sicky) {
    if (isTransformXY) {
        let temp = sickx;
        sickx = sicky;
        sicky = temp;
    } else {
        sicky *= -1;
    }

    let coorx = (Number(sickx) * Number(sickMapScale)) + Number(XcanvassOffsetToZeroSick);
    let coory = (Number(sicky) * Number(sickMapScale)) + Number(YcanvassOffsetToZeroSick);
    // return [coorx,coory]
    return { x: coorx, y: coory }
}

function getSickCoordinate(coorx, coory) {
    let sickx = (coorx - XcanvassOffsetToZeroSick) / sickMapScale;
    let sicky = (coory - YcanvassOffsetToZeroSick) / sickMapScale;
    // 
    if (isTransformXY) {
        // 
        let temp = sickx;
        sickx = sicky;
        sicky = temp;
    } else {
        // 
        sicky *= -1;
    }

    // 

    return { x: sickx.toFixed(6), y: sicky.toFixed(6) };
}



function loadCanvas() {
    isCanvasLoad = 0;
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isCanvasLoad = 1;
}

/*manage clicked position*/
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const coorx = event.clientX - rect.left;
    const coory = event.clientY - rect.top;
    if (isGetcanvassOffset) {
  
			      
		  if(offsetArr.length==0){
		  	offsetArr.push(Number(coorx));
		  }else if(offsetArr.length==1){
		  	offsetArr.push(Number(coory));
		  }else if(offsetArr.length==2){
		  	offsetArr.push([Number(coorx),Number(coory)]);
		  } 
		  if(offsetArr.length>=3){
		  	
		  	
        let xdiff = "x1 - x2 = ";

        let ydiff = "y1 - y2 = ";
        let xdiffValue = (offsetArr[2][0] - offsetArr[0]) / 10;
        let ydiffValue = (offsetArr[2][1] - offsetArr[1])/ 10;
		
		  
		  
		  document.getElementById('xCanvassoffset').value = coorx;
        document.getElementById('yCanvassoffset').value = coory;
        document.getElementById('canvasScaleToMap').value = (Math.abs(xdiffValue)+Math.abs(ydiffValue))/2;
//        document.getElementById('prevOffsetx').innerText = xdiff;
//        document.getElementById('prevOffsety').innerText = ydiff;

        document.getElementById('scalingDetail').innerText = xdiff+xdiffValue+"   ,   "+ydiff+ydiffValue ;
//        document.getElementById('prevOffsetyvalue').innerText = ydiffValue;
		  
		  
		  
		  
		  	offsetArr=[];
		  }		  		
			
			
        

        getSickCoordinate(coorx, coory);
        // console.log(coorx, coory)
    } else {
        if (!calibrateswitchStatus) {

            if (ctx.isPointInPath(coorx, coory) && isAddRoute) {
                count += 1;
                ctx.fillStyle = "red";
                ctx.font = "10px Arial";
                drawPoint(count, coorx, coory);
                // console.log(coorx, coory);
                routeCoord.push(getSickCoordinate(coorx, coory));
            }
        } else {
            if (!isCustomizeZone) {

                count += 1;
                ctx.fillStyle = "red";
                ctx.fillRect(coorx - 3, coory - 3, 6, 6);
                calibrateCoord.push({ x: coorx, y: coory });
            }
        }
    }


}