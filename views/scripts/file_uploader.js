let file;
let reader = new FileReader();

uploadImage.onclick = function() {
    let input = document.getElementById("imageInput");
    let allowedExtension = ".jpg";

    // for (var i = 0; i < this.files.length; i++) {
    //   var file = this.files[i];

    //   if (!file.name.endsWith(allowedExtension)) {
    //     hasInvalidFiles = true;
    //   }
    // }

    // if(hasInvalidFiles) {
    //   fileInput.value = ""; 
    //   alerti("Unsupported file selected.");
    // }

    if (input.files && input.files[0]) {
        file = input.files[0];

        if (!isFileImage(file)) {
            alerti("Unsupported file selected.");
            return;
        }

        let slice = file.slice(0, 100000);

        reader.readAsArrayBuffer(slice);
        reader.onload = function(evnt) {
            // socket.emit('UploadFile', { 'Name' : Name, Data : evnt.target.result });

            let arrayBuffer = reader.result;

            document.querySelector("#imagemap").src = "images/loading.gif";

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            socket.emit('slice upload', {
                classification: "map",
                name: file.name,
                type: file.type,
                size: file.size,
                data: arrayBuffer
            });
        }
        // socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
        // reader.readAsDataURL(input.files[0]);
    }
}
uploadSound.onclick = function() {
    let input = document.getElementById("soundUpload");
    uploadSound.disabled = true;
    if (input.files && input.files[0]) {
        file = input.files[0];
        let slice = file.slice(0, 100000);

        reader.readAsArrayBuffer(slice);
        reader.onload = function(evnt) {
            // socket.emit('UploadFile', { 'Name' : Name, Data : evnt.target.result });

            let arrayBuffer = reader.result;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            socket.emit('slice upload', {
                classification: "audio",
                name: file.name,
                type: file.type,
                size: file.size,
                data: arrayBuffer
            });


        }
        // socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
        // reader.readAsDataURL(input.files[0]);
    }
}

uploadFace.onclick = function() {
    let input = document.getElementById("faceUpload");
    uploadFace.disabled = true;
    if (input.files && input.files[0]) {
        file = input.files[0];
        let slice = file.slice(0, 100000);

        reader.readAsArrayBuffer(slice);
        reader.onload = function(evnt) {
            // socket.emit('UploadFile', { 'Name' : Name, Data : evnt.target.result });

            let arrayBuffer = reader.result;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            socket.emit('slice upload', {
                classification: "face",
                name: file.name,
                type: file.type,
                size: file.size,
                data: arrayBuffer
            });


        }
    }
}


socket.on('request slice upload', (data) => {
    let place = data.currentSlice * 100000;
    let slice = file.slice(place, place + Math.min(100000, file.size - place));

    reader.readAsArrayBuffer(slice);
});
socket.on('endupload', async function() {
    await sleep(1000);
    document.querySelector("#imagemap").src = "images/map1.png?" + Math.floor(Math.random() * 1000);
    await sleep(100);
    getClickableArea();
    // loadCanvas();
});
socket.on('endAudioUpload', async function() {
    await sleep(1000);
    let soundUpload = document.getElementById("soundUpload");
    let uploadSound = document.getElementById("uploadSound");
    soundUpload.value = "";
    uploadSound.disabled = false;
    requestSoundlist();
    soundUpload=null;
    uploadSound=null;
});