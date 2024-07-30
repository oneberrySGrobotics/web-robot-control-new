
const User = require("../models/User");



const getmember=async () =>{
		// console.log("1.getmember")
		let users = await User.find()
		var result=[];
    	for (var i = 0; i < users.length; i++) {
    		// user=users[i];
    		result.push({id:users[i]._id,name:users[i].name,email:users[i].email})
    	}

    	// console.log(result)
		return result
	}



module.exports = {
  // userAuth,
  getmember
};
