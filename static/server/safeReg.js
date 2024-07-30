const {
    emailReg,
    specialchars,
    nameReg,
    lowerCaseLetters,
    upperCaseLetters,
    numbers,
    passlength,
    filenaming,
    replacefileNameReg,
    isboolean,
    isValidDecimalNumber,
    isValidSettingvalue,
} = require("../utils/validator");

var safe = require('safe-regex');
var evils2=/^(([a-z])+.)+[A-Z]([a-z])+$/g;
var evils3=/^[A-Z]([a-z])+$/g;
var evils3=/^[A-Z]([a-z])+$/g;

console.log(safe(emailReg));
console.log(safe(specialchars));
console.log(safe(nameReg));
console.log(safe(lowerCaseLetters));
console.log(safe(upperCaseLetters));
console.log(safe(numbers));
console.log(safe(passlength));
console.log(safe(evils2));
console.log(safe(evils3));
console.log(safe(filenaming));
console.log(safe(replacefileNameReg));
console.log("---------------");

var str="http://172.16.1$00.96/api/crown/ResultHandling/getPositionInfo"
str="1"
var testreg= /[!-|-@[-`{-~]/g;
var settingValueReg = /[-!\|@$&[-`{-~]/g; // Validate setting content
var decimalNumber = /^\d{0,}(\.\d{1,})?$/g; // Validate number
testregex(str, decimalNumber)



console.log(isboolean(true))

function testregex(strs, reg) {
	// body...
	console.log("safe: "+safe(reg));
	if(strs.match(reg)){
		console.log(true)
	}else{
		console.log(false)
	}
}

isValidDecimalNumber(-6.684323)
isValidDecimalNumber("9.730179")

// var newString = str.match(/[^a-zA-Z0-9]/ig, "_");
// console.log(newString)


