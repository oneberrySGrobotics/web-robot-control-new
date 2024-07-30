
const nameReg = /^[a-zA-Z0-9_-]{4,}$/g;

/*Validate Email*/
routeName.onchange = function() {
    validateFileName();
}
routeName.onkeyup = function() {
    validateFileName();
}

function validateFileName() {
	let routenaming=routeName.value.trim();
	let nameToolong=document.getElementById("nameToolong");
	let invalidRouteName=document.getElementById("invalidRouteName");
	if(routenaming.length>18){
		nameToolong.hidden=false;
		return;
	}else{
		nameToolong.hidden=true;		
	}
	
    if (routenaming.match(nameReg)) {
    	invalidRouteName.hidden=true;
    }else{
    	invalidRouteName.hidden=false;
    }

}