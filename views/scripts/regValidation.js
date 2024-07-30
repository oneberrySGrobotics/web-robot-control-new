/*Validate Name*/
namex.onchange = function() {
    validateName();
}
namex.onkeyup = function() {
    validateName();
}

function validateName() {
    removeClass(namex);
    const nameReg = /^[a-zA-Z0-9_-]{4,}$/g;
    return setValid(namex.value.match(nameReg), namex, namemsg)

}



/*Validate Email*/
email.onchange = function() {
    validateEmail();
}
email.onkeyup = function() {
    validateEmail();
}

function validateEmail() {
    removeClass(email);
    var emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;
    return setValid(email.value.match(emailReg), email, emailmsg)
}




/*validate password*/

password.onfocus = function() {
    passalert.hidden = false;
    // message.hidden=true;
    // setOnfocus(password)
}
password.onblur = function() {
    passalert.hidden = true;
    // message.hidden=false;
}
password.onkeyup = function() {
    validatePassword();
    validatePasswordm();
}

password.onchange = function() {
    validatePassword();
    validatePasswordm();
}

passwordm.onkeyup = function() {
    validatePasswordm();
}

passwordm.onchange = function() {
    validatePasswordm();
}


registerForm.onsubmit = function() {
    let ValidName = validateName();
    let ValidPassword = validatePassword();
    let validEmail = validateEmail();
    if (!ValidName || !ValidPassword || !validEmail) {
        return false;
    }
}
resetForm.onsubmit = function() {
    let ValidPassword = validatePassword();
    let ValidPasswordm = validatePasswordm();
    if (!ValidPassword || !ValidPasswordm) {
        return false;
    }
}


function passwordRequirementValidity(pattern, obj) {
    if (password.value.match(pattern)) {
        obj.classList.remove("invalid");
        obj.classList.add("valid");
        return true;
    } else {
        obj.classList.remove("valid");
        obj.classList.add("invalid");
        return false;
    }
}

function validatePasswordm() {

    let isPasswordMatch = (password.value == passwordm.value);
    removeClass(passwordm);
    setValid(isPasswordMatch, passwordm, passwordMatchmsg)
    return isPasswordMatch;

}

function validatePassword() {
    let validPassword = true;

    let lowerCaseLetters = /[a-z]/g; // Validate lowercase letters
    let upperCaseLetters = /[A-Z]/g; // Validate uppercase letters
    let numbers = /[0-9]/g; // Validate number
    let specialchars = /[!-\//|:-@[-`{-~]/g; // Validate special char
    let passlength = /.{8,}/g; // Validate length
    if (!passwordRequirementValidity(lowerCaseLetters, letter)) {
        validPassword = false;
    }

    if (!passwordRequirementValidity(upperCaseLetters, capital)) {
        validPassword = false;
    }

    if (!passwordRequirementValidity(numbers, number)) {
        validPassword = false;
    }

    if (!passwordRequirementValidity(specialchars, specialx)) {
        validPassword = false;
    }

    if (!passwordRequirementValidity(passlength, lengthx)) {
        validPassword = false;
    }

    removeClass(password);
    // if(validPassword){
    //  password.classList.add("validBox");
    // }else{
    //  password.classList.add("invalidBox");
    // }

    setValid(validPassword, password, passwordmsg)
    return validPassword;

}


// function setOnfocus(obj){
//  obj.onfocus=()=>{
//      obj.classList.remove("invalidBox");
//      obj.classList.remove("validBox");
//      obj.classList.add("pendingBox");
//  }
// }


function setValid(bol, obj, msgObj) {
    if (bol) {
        obj.classList.add("validBox");
        // message.hidden=true;
        msgObj.hidden = true;
        return true
    } else {
        obj.classList.add("invalidBox");
        // message.hidden=false;
        // message.classList.add("invalid");
        msgObj.hidden = false;
        // message.innerText=msg;
        return false
    }
}

function removeClass(obj) {
    obj.classList.remove("pendingBox");
    obj.classList.remove("invalidBox");
    obj.classList.remove("validBox");
}