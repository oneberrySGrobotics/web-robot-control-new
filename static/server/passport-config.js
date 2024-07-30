const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require("../models/User");
const { validatePassword, validateEmail } = require('../utils/validator.js');
let logger = require('../perfect-logger/perfect-logger');
let FOCNO="PAS13 - "
const label = "Authenticate User : "+FOCNO;









function initialize(passport) {

    const authenticateUser = async (email, password, done) => {
        let isValid = true;
        if (isValid && !validateEmail(email)) {
            isValid = false;
            logger.warn(label + "invalid email format")
        }
        if (isValid && !validatePassword(password)) {
            isValid = false;
            logger.warn(label + "invalid Password format")
        }
        let user = await User.findOne({ email });

        if (isValid && user == null) {
            isValid = false;
            logger.warn(label + "user not found")
        }

        logger.info("valid: "+isValid)
        if (isValid) {
            await initializedUser(user);
            if (user.lastLoginFailDelay > new Date()) {
                logger.warn("user blocked - last login fail delay")
                return done(null, false, { message: 'you are currently blocked, next wrong password will double up blocking time' })
            }
            if (user.passwordExpiresDate < new Date()) {
                logger.warn("user blocked - password expire")
                return done(null, false, { message: 'your password Expired, please reset your password' })
            }


            try {
                if (await bcrypt.compare(password, user.password)) {
                    user.passwordAttemp = 1;
                    await user.save();
                    isValid = true;
                } else {
                    isValid = false;
                    logger.crit(label + user.email + ", Password Not Match")
                }
            } catch (e) {
                logger.crit(e)
                return done(e)
            }
        }



        if (isValid) {
            return done(null, user);
        } else {
            if (user) {
                console.log(user.passwordAttemp);
                user.lastLoginFailDelay = Date.now() + (user.passwordAttemp * 3000);
                user.passwordAttemp = user.passwordAttemp * 2;
                await user.save();
            }
            logger.info(FOCNO+" invalid Cridential")
            return done(null, false, { message: 'Invalid Cridential' })
        }

    }

    passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {

        let user = await User.findOne({ _id: id });
        return done(null, user)
    })

}

async function initializedUser(userx) {
    let isInitialized = false;
    if (!userx.passwordAttemp) {
        userx.passwordAttemp = 1;
        isInitialized = true;
    }

    if (!userx.lastLoginFailDelay) {
        userx.lastLoginFailDelay = userx.createdAt;
        isInitialized = true;
    }

    if (!userx.passwordExpiresDate) {
        userx.passwordExpiresDate = userx.createdAt.addDays(90);
        isInitialized = true;
    }
    if (isInitialized) {
        await userx.save();
    }
}

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

module.exports = initialize