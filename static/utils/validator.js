var emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;
var specialchars = /[!-\//|:-@[-`{-~]/g; // Validate special char
const nameReg = /^[a-zA-Z0-9_-]{4,}$/g;
var lowerCaseLetters = /[a-z]/g; // Validate lowercase letters
var upperCaseLetters = /[A-Z]/g; // Validate uppercase letters
var numbers = /[0-9]/g; // Validate number
var passlength = /.{8,}/g; // Validate length
const filenaming        = /^[a-zA-Z0-9_-]{4,18}$/g;
const replacefileNameReg=/[^a-zA-Z0-9]/ig;
var settingValueReg = /[-!\|@$&`[-^{-~]/g; // Validate setting content
var decimalNumber = /^\d{0,}(\.\d{1,})?$/g; // Validate number



const isboolean = value => {
    if (value == "true") {
        return true;
    }
    if (value == "false") {
        return true;
    }
    if (value == 1) {
        return true;
    }
    if (value == 0) {
        return true;
    }
    
    return false;

}

const isValidDecimalNumber = value => {
    value=value+"";
    if(value.startsWith("-")){
        value=value.substr(1);
    }
    // console.log("value: "+value)
    if (value.match(decimalNumber)) {
        return true;
    } else {
        return false;
    }
}

const isValidSettingvalue = value => {
    if (value.match(settingValueReg)) {
        return false;
    } else {
        return true;
    }
}
   
const isValidFileName = filename => {
    if(filename.lastIndexOf(".")>-1){
        filename=filename.substr(0, filename.lastIndexOf("."));
        // console.log(filename)
    }

    if (filename.match(filenaming)) {
        return true;
    } else {
        return false;
    }
}

const validateEmail = email => {
    if (email.match(emailReg)) {
        return true;
    } else {
        return false;
    }
}

const isSpecialCharIncluded = str => {
    if (str.match(specialchars)) {
        return true;
    } else {
        return false;
    }
}

const validateName = username => {
    if (username.match(nameReg)) {
        return true;
    } else {
        return false;
    }
}

const validatePassword = password => {
    var validPassword = true;

    if (!password.match(lowerCaseLetters)) {
        validPassword = false;
    }
    if (!password.match(upperCaseLetters)) {
        validPassword = false;
    }
    if (!password.match(numbers)) {
        validPassword = false;
    }
    if (!password.match(specialchars)) {
        validPassword = false;
    }
    if (!password.match(passlength)) {
        validPassword = false;
    }

    return validPassword;

}


module.exports = {
    emailReg,
    specialchars,
    nameReg,
    lowerCaseLetters,
    upperCaseLetters,
    numbers,
    passlength,
    isSpecialCharIncluded,
    validateName,
    validateEmail,
    replacefileNameReg,
    isValidFileName,
    isValidSettingvalue,
    isValidDecimalNumber,
    isboolean,
    validatePassword
};