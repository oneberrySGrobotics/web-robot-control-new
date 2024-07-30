const socket = io();

function getmemberx(email){
	socket.emit("getmembers",email)
}

registerForm.onsubmit = function() {
     registerbtn.disabled = true;
    	// registerbtn.style.cursor="not-allowed";
    setTimeout(function() {
        registerbtn.disabled = false;
        // registerbtn.style.cursor="pointer";
    }, 3000);
}


socket.on("getmemberList", function(result) {

    var container = document.getElementById("memberList");
    var elem, counter = 1;
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    // var span = document.createElement("span");
    // h3c.classList.add("listing");
    // span.innerHTML="&#9993";


    for (var i = 0; i < result.length; i++) {
        if (result[i] == "") {
            continue
        }
        elem = result[i];


        form = document.createElement("form");
        form.action = "/deletemember"
        form.method = "POST"
        form.id = "form" + i
        h3c = document.createElement("h3");
        h3c.id = "cover" + i;
        h3c.classList.add("membercover");

        div = document.createElement("div");
        div.classList.add("nameContainer");

        span = document.createElement("span");
        span.classList.add("symbolname");
        span.innerHTML = "&#128100;";
        div.appendChild(span)

        span2 = document.createElement("span");
        span2.classList.add("labelname");
        span2.innerText = elem.name;
        div.appendChild(span2)
        h3c.appendChild(div)




        div = document.createElement("div");
        div.classList.add("emailContainer");

        span = document.createElement("span");
        span.classList.add("symbolemail");
        span.innerHTML = "&#128234;";
        div.appendChild(span)

        span2 = document.createElement("span");
        span2.classList.add("labelemail");
        span2.innerText = elem.email;
        div.appendChild(span2)
        h3c.appendChild(div)

        div = document.createElement("div");
        div.classList.add("symbolarrow");
        div.style.width = "50px";

        span = document.createElement("span");
        span.classList.add("symbolarrow");
        span.innerHTML = "&#10145;";
        span.id = "arrow" + i;
        span.style.display = "none";
        div.appendChild(span)
        h3c.appendChild(div)

        span = document.createElement("span");
        span.classList.add("symbolbin");
        span.innerHTML = "&#128465;";
        span.id = "bin" + i;
        span.value = elem.id;
        span.data = i;
        span.name = "id";
        span.title = "delete " + elem.name;
        span.onclick = (function() {
            return function() {
                var formx = document.getElementById("form" + this.data);
                formx.submit();
            };
        })();
        span.onmouseover = (function() {
            return function() {
                var arrowx = document.getElementById("arrow" + this.data);
                arrowx.style.display = "inline-block";
                var coverx = document.getElementById("cover" + this.data);
                coverx.classList.add("hoverx");
            };
        })();
        span.onmouseleave = (function() {
            return function() {
                var arrowx = document.getElementById("arrow" + this.data);
                arrowx.style.display = "none";
                var coverx = document.getElementById("cover" + this.data);
                coverx.classList.remove("hoverx");
            };
        })();
        h3c.appendChild(span)



        input = document.createElement("input");
        input.name = "member"
        input.value = elem.id;
        input.hidden = true;
        form.appendChild(input)
        h3c.appendChild(document.createElement("br"))
        // h3c.appendChild(input);
        // input2 = document.createElement("input");
        // input2.classList.add("text");
        // input2.type = "text";
        // input2.name = "delay" + counter;
        // input2.id = "delay" + counter;
        // h3c.appendChild(input2);

        form.appendChild(h3c);
        container.appendChild(form);

    }
})