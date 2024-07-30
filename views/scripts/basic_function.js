function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function checkInp(x) {
    if (x.match("[a-zA-Z]")) {
        return true;
        // alert('Not a numeric');
    } else {
        return false;
        // alert('numeric');
    }

}

function cutString(val, num) {
    if (val.length > num) {
        return val.substr(0, num);
    }
}

function printObjectArrayWithBracket(arrs) {
    var res = "";
    for (var i = 0; i < arrs.length; i++) {
        res += "{x :" + arrs[i].x + ",y :" + arrs[i].y + "},";
    }
}


function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
}


function alerti(msg) {
    swal("Opps..", msg, "info");
}

function alertw(msg) {
    swal("Opps!", msg, "warning");
}

function alerte(msg) {
    swal("Opps!!!! ", msg, "error");
}

function alerts(msg) {
    swal("Success!", msg, "success");
}


function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerText = this.responseText; }
                    if (this.status == 404) { elmnt.innerText = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}