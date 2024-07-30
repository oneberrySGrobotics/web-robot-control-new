const User = require("../models/User");
const { validateName, 
    validatePassword, 
    validateEmail, 
    isSpecialCharIncluded 
} = require('./validator.js');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const per = require("../models/per");
const config = require('../../config.json');
const separator = "=GodPassword="
const tokensalt = "a5t6sltlx0980"
const sessionExpired = "Session expired, try reset password again"
const invalidUser = "User Data is invalid"
let FOCNO="AUT15 - "
let perinit=1600000000000;
let pervalid=1680000000000; //to be updated per 2 year

let logger = require('../perfect-logger/perfect-logger');

var nodemailer = require("nodemailer");

const userRegister = async (userDets, res, creatorEmail) => {
    try {
        //validate user
        if (!userDets || !userDets.name || !userDets.email || !userDets.password) {
            logger.warn(FOCNO+" empty input")
            return res.render('pages/register.ejs', { msx: invalidUser })
        }

        if (!validateName(userDets.name)) {
            logger.warn(FOCNO+" invalid name")
            return res.render('pages/register.ejs', { msx: invalidUser })
        }

        if (!validateEmail(userDets.email)) {
            logger.warn(FOCNO+" invalid email")
            return res.render('pages/register.ejs', { msx: invalidUser })
        }

        if (!validatePassword(userDets.password)) {
            logger.warn(FOCNO+" invalid password")
            return res.render('pages/register.ejs', { msx: invalidUser })
        }

        let isUsernameTaken = await CheckUserNameTaken(userDets.name);
        if (isUsernameTaken) {
            logger.warn(FOCNO+" username Taken")
            return res.render('pages/register.ejs', { msx: 'user name already taken' })
        }

        let isEmailRegistered = await checkEmailRegistered(userDets.email);
        if (isEmailRegistered) {
            logger.warn(FOCNO+" email Taken")
            return res.render('pages/register.ejs', { msx: 'email already taken' })
        }

        //get hased passw
        const password = await bcrypt.hash(userDets.password, 15);

        //create new user
        const newUser = new User({
            ...userDets,
            passwordExpiresDate: Date.now() + (90 * 24 * 60 * 60 * 1000),
            password
        });
        // newUser.passwordExpiresDate= Date.now() + (90*24*60*60*1000);
        await newUser.save();
        return res.render('pages/register.ejs', { msx: 'success', email: creatorEmail })
    } catch (error) {
        //implement logger function (winston)
        logger.crit(FOCNO+"unable to create account:" + error)
        return res.render('pages/register.ejs', { msx: 'Error: unable to create account' })
    }
};



const changePassword = async (req, res) => {
    try {

        let passtoken = "",
            token2 = "",
            passlist;
        for (const property in req.body) {
            if (`${property}`.trim().startsWith(tokensalt)) {
                token2 = `${req.body[property]}`;
                passtoken = `${property}`.replace(tokensalt, "");
            }
        }
        if (isSpecialCharIncluded(passtoken)) {
            return res.render('pages/forgot.ejs', { msx: sessionExpired });
        }
        let user = await User.findOne({ resetPasswordToken: passtoken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.render('pages/forgot.ejs', { msx: sessionExpired })
        }

        let hist = user.passwordhist;
        if (!hist) {
            hist = "";
        }
        hist = user.password + separator + hist;
        passlist = hist.split(separator);
        if (passlist.length > 10) {
            passlist.splice(10);
        }

        let isoldPassword = false;
        for (var i = 0; i < passlist.length; i++) {
            if (await bcrypt.compare(req.body.password, passlist[i])) {
                isoldPassword = true;
                break;
            }
        }
        if (isoldPassword) {
            return res.render('pages/resetpass.ejs', {
                msx: 'Usage of old Passwords is forbidden',
                token: tokensalt + passtoken,
                tokenX1: req.body.token,
                tokenX2: token2
            })
        }



        user.password = await bcrypt.hash(req.body.password, 15);
        user.passwordhist = hist;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = Date.now() - 999999999;
        user.passwordExpiresDate = Date.now() + (90 * 24 * 60 * 60 * 1000);
        await user.save();
        return res.render('pages/resetpass.ejs', { msx: 'success', token: '', tokenX1: '', tokenX2: '' })

    } catch (error) {
        logger.crit(FOCNO+"unable to reset password, Token Error : " + error)
        return res.render('pages/forgot.ejs', { msx: 'Error: unable to reset password' })
    }
};


const checkResetToken = async (req, res) => {
    try {
        if (isSpecialCharIncluded(req.body.token)) {
            logger.warn(FOCNO+req.body.token + ": invalid token")
            return res.render('pages/forgot.ejs', { msx: sessionExpired });
        }

        let user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            logger.warn(FOCNO+req.body.token + " : token not found")
            return res.render('pages/forgot.ejs', { msx: sessionExpired })
        }
        if (req.body.unblock && req.body.unblock == "unblock") {
            user.lastLoginFailDelay = Date.now() - 1000;
            user.passwordAttemp = 1;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = Date.now() - 999999999;
            await user.save();
            return res.render('pages/login.ejs')
        }


        const tokenX1 = crypto.randomBytes(64).toString("hex");
        const tokenX2 = crypto.randomBytes(64).toString("hex");
        return res.render('pages/resetpass.ejs', { msx: '', token: tokensalt + req.body.token, tokenX1: tokenX1, tokenX2: tokenX2 })


    } catch (error) {
        logger.crit("FOCNO+unable to reset password, Token Error :" + error)
        return res.render('pages/forgot.ejs', { msx: sessionExpired })
    }
};


const resetPassword = async (host, body, res) => {
    let email = body.email;
    let unblock = (body.unblock) ? "unblock" : "";

    try {
        //validate user
        if (!email) {
            logger.warn(FOCNO+"Reset password: " + host + "," + email + " is empty")
            return res.render('pages/forgot.ejs', { msx: 'email sent' })
        }
        if (!validateEmail(email)) {
            logger.warn(FOCNO+"Reset password: " + host + "," + email + " is not a valid email")
            return res.render('pages/forgot.ejs', { msx: 'Email Sent' })
        }

        let user = await User.findOne({ email });
        if (!user) {
            logger.info(FOCNO+"Reset password: " + host + "," + email + " is sent")
            return res.render('pages/forgot.ejs', { msx: 'Email Sent' })
        }
        const token = crypto.randomBytes(34).toString("hex");

        if (user.resetPasswordExpires > new Date()) {
            logger.warn(FOCNO+"Reset password: " + host + "," + email + " reset before previous session expired")
            return res.render('pages/forgot.ejs', { msx: 'Email Sent' })
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour= 60 min * 60 sec * 1000 milsec

        await user.save();
        sendEmail(token, user, res, host, unblock);
    } catch (error) {
        logger.crit(FOCNO+"unable to reset password for " + email + ":" + error)
        return res.render('pages/forgot.ejs', { msx: 'Email Sent' })
    }
};



function sendEmail(token, user, res, host, unblock) {
    let isExpired = (user.passwordExpiresDate < new Date());
    let msgHeader = "You are receiving this because you (or someone else) have requested the reset of the password for your account "
    let msgFooter = "If you did not request this, please ignore this email and your password will remain unchanged.\n'"
    if (isExpired) {
        msgHeader = "<b>your Password Has Expired</b>"
        msgFooter = "";
    }

    let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        secure: true,
        auth: {
            user: config.EMAIL,
            pass: config.EMAIL_PASS
        }
    });
    let mailOptions = {
        to: user.email,
        from: 'oneberrybatam@gmail.com',
        subject: 'KenOBI Password Agent',
        html: `<html><head></head><body><div>
      <img src="cid:kenobi" style="width:200px;height: 119px;display: block;margin: auto;">
    </div><div style="width: 100%;height: auto;padding-top: 50px;padding-left: 10px;text-align: center;padding-right: 10px;">
    ` + msgHeader + `
    <br><br>

      Please click on the following Button to Change your password
      <br>
      <b>Expiry in one hour</b>
      <br>
          <form action="https://` + host + `/reset" method="POST">
            <input type="hidden" name="unblock" value="` + unblock + `">
            <input type="hidden" name="token" value="` + token + `">
            <button type="submit" style="background-color: #4f4f4f;width: 200px;height: 36px;border-radius: 39px;color: white;">Reset password</button>
          </form>
      <br>      
      ` + msgFooter + `
      </div>
      </body></html>`,
        attachments: [{
            filename: 'roboguard_logo_small.jpg',
            path: 'views/images/roboguard_logo_small.jpg',
            cid: 'kenobi' //same cid value as in the html img src
        }]
    };

    smtpTransport.sendMail(mailOptions, function(err) {
        logger.info(FOCNO+'mail sent');
        if (err) {
            logger.crit(FOCNO+err)
        }
        let msgx = "success";
        if (isExpired) {
            msgx = "Password expired, please Check your mail"
        }
        return res.render('pages/forgot.ejs', { msx: msgx })
    });
}

const deletemember = async (_id, res) => {
    try {
        //validate user
        let user = await User.findOne({ _id });

        user.delete()
        return res.render('pages/register.ejs', { msx: '', deletex: 'success' })
    } catch (error) {
        logger.crit(FOCNO+"unable to delete member for " + error)
        return res.render('pages/register.ejs', { deletex: 'Error: unable to delete member' })
    }
};


const CheckUserNameTaken = async username => {
    let user = await User.findOne({ username });
    return user ? true : false;
};

const checkEmailRegistered = async email => {
    let user = await User.findOne({ email });
    return user ? true : false;
};


function checkauthUser(req, res, next) {
    if (req.isAuthenticated()) {

        if (req.user.passwordExpiresDate < new Date()) {
            logger.info(FOCNO+"password Expired")
            // let email = req.user.email;
            req.logOut();
            return false;
        } else {
            return true;
        }

    } else {
        return false;
    }
}

function checkIsAuthenticated(req, res, next) {
    logger.info(req.originalUrl);
    if (req.isAuthenticated()) {
        if (req.user.passwordExpiresDate < new Date()) {
            req.logOut();
        } else {
            return next();
        }

    } else {
        res.redirect('/login')
    }
}

function checkIsNotAuthenticated(req, res, next) {
    logger.info(req.originalUrl);
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }else{
        return next();
    }
}

/*function checkisAllowedMethod(req, res, next) {
    if (isAllowedMethod(req.method)) {
        return res.redirect('/')
    }
    let err = null;
    try {
        decodeURIComponent(req.path)
    } catch (e) {
        err = e;
    }
    if (err) {
        logger.crit(FOCNO+req.url);
        logger.crit(FOCNO+err);
        return res.redirect('/login');
    }

    next()
}*/

const regPetrifier = async () => {
      let perx = await per.findOne();
        if(!perx){
            const newper = new per({
                per:perinit
            });
            config.period=new Date(perinit);
            await newper.save(); 
        }

}


const PERSetting = async () => {
    let perx = await per.findOne();
        config.period=((perx.per < pervalid) && (new Date().getTime() < pervalid) )? new Date(perx.per):new Date(pervalid);       
}

function isAllowedMethod(method) {
    const allowedMethods = ['GET', 'HEAD', 'POST']
    if (!allowedMethods.includes(method)) {
        return false;
    }

    return true;
}


module.exports = {
    //checkisAllowedMethod,
    changePassword,
    checkResetToken,
    resetPassword,
    deletemember,
    checkIsNotAuthenticated,
    checkIsAuthenticated,
    checkauthUser,
    userRegister,
    regPetrifier,
    PERSetting,
};