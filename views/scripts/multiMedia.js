var currentAudio;
var isRepeatAudio = 0;
var soundlistArray;



/*faces */

function requestFacelist() {
    socket.emit("getfaceList");
}

function updateFaceList(arr) {

    let container = document.getElementById("customFace");
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    let input, h3, counter = 0;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "") {
            continue;
        }
        if ((i % 3) == 1 || i == 0) {
            h3 = document.createElement("h3");
        }
        input = document.createElement("img");
        input.classList.add("imgFace");
        input.src = "images/faces/" + arr[i];
        input.name = arr[i];
        input.id = "face" + counter;
        input.value = arr[i];
        input.onclick = (function() {
            return function() {
                ChangeFace(this.value);
            };
        })();
        h3.appendChild(input);
        if ((i % 3) == 1 && i != 0) {
            container.appendChild(h3);
            counter++;
        }
    }


    input=null;
    h3=null; 
    counter = null;
    container=null;
}

function ChangeFace(img) {
    socket.emit("changeFace", img);
}


/*audio*/

function requestSoundlist() {
    socket.emit("getSoundList");
}

function updateSoundList(arr) {

    var container = document.getElementById("customSound");
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    let input,input2, h3, counter = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "") {
            continue;
        }
        h3 = document.createElement("h3");
        h3.classList.add("songlist");

        input = document.createElement("button");
        input.classList.add("button1");
        input.classList.add("songtitle");
        input.type = "button";
        input.name = arr[i];
        input.id = "audio" + counter;
        input.value = arr[i];
        input.onclick = (function() {
            return function() {
                playAudio(this.value);
            };
        })();
        audioname = arr[i].substr(0, arr[i].indexOf("."));
        if (audioname.length > 30) {
            audioname = audioname.substr(0, 30);
        }
        input.innerText = audioname;
        h3.appendChild(input);



        input2 = document.createElement("button");
        input2.classList.add("number");
        input2.type = "button";
        input2.name = "delete_" + arr[i];
        input2.id = "deleteAudio" + counter;
        input2.value = arr[i];
        input2.onclick = (function() {
            return function() {

                deleteAudio(this);
            };
        })();
        input2.innerText = "DEL";
        h3.appendChild(input2);
        container.appendChild(h3);
        counter++;
    }

    input=null;
    input2=null;
    h3=null; 
    counter = null;
    container=null;

}

function playAudio(sound) {
    socket.emit("playAudio", sound);
}
// audioplayer.onended = function() {
//     stopAudio();
// };

function deleteAudio(sound) {
    if (confirm("are you sure want to delete this audio " + sound.value)) {
        socket.emit("deleteAudio", sound.value);
        requestSoundlist();
    }
}

// playAll.onclick= function(){
//   stopAudio();
//   playnext(0);

// }

// function playnext(index) {
//     if (soundlistArray[index] == "") {
//         index++;
//         if (index < soundlistArray.length) {
//             playnext(index);
//         }
//     } else {
//         playAudio(soundlistArray[index]);
//         audioplayer.onended = function() {
//             index++;
//             if (index < soundlistArray.length) {
//                 playnext(index);
//             }
//         }

//     }

// }

function stopAudio() {
    socket.emit("stopAudio");
}


stopSound.onclick = function() {
    stopAudio();
}



loopSound.onclick = function() {
    if (loopSound.value == "repeatoff") {
        loopSound.innerText = "Repeat is ON";
        loopSound.value = "repeaton";
        // isRepeatAudio=1;
        // audioplayer.loop = true;
        socket.emit("repeatSound", 1);
    } else {
        loopSound.value = "repeatoff";
        loopSound.innerText = "Repeat is OFF";
        socket.emit("repeatSound", 0);
        // isRepeatAudio=0;
        // audioplayer.loop = false;
    }
}


/*socket*/
socket.on("getSoundListCallback", function(data) {
    soundlistArray = data.split(/\n/);
    updateSoundList(soundlistArray);
});

socket.on("getfaceListCallback", function(data) {
    facelistArray = data.split(/\n/);
    updateFaceList(facelistArray);
});