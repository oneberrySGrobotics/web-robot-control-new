let socket;
const passport = require('passport')


const initializeApp = (app) => {
    const {
        checkisAllowedMethod,
        checkResetToken,
        changePassword,
        resetPassword,
        userRegister,
        deletemember,
        appKey,
        checkIsAuthenticated,
        checkIsNotAuthenticated
    } = require("../utils/auth");

    // function execCallback(err, stdout, stderr) {
    //     if (err) {
    //         logger.crit(err)
    //     }
    //     if (stdout) {
    //         logger.info(stdout)
    //     }
    //     if (stderr) {
    //         logger.crit(stderr)
    //     }
    // }
    function logErrorcb(err, stderr) {
        if (err) {
            logger.crit(err)
        }
        if (stderr) {
            logger.crit(stderr)
        }

    }
    const { exec } = require('child_process');
    let logger = require('../perfect-logger/perfect-logger');
    const {
        isValidFileName,
        isValidDecimalNumber,
    } = require("../utils/validator");

    app.post('/reportcspviolat', checkIsAuthenticated, (req, res) => {
        if (req.body) {
            logger.crit(req.body)
        }
        res.redirect('/')
    })

    app.get('/', checkIsAuthenticated, (req, res) => {
        res.render('pages/index.ejs', { root: '.'});
    })



    app.get('/login', checkIsNotAuthenticated, (req, res) => {
        res.render('pages/login.ejs')
    })

    app.post('/login', checkIsNotAuthenticated, passport.authenticate('local', {
       successRedirect: '/',
       failureRedirect: "/pages/login",
       failureFlash: true
    }))


    app.get('/register', checkIsAuthenticated, (req, res) => {
        {
            res.render('pages/register.ejs', { msx: '', email: req.user.email })
        }
    })

    app.post('/register', checkIsAuthenticated, async (req, res) => {
        {
            await userRegister(req.body, "user", res,req.user.email);
        }
    })

    app.post('/deletemember', checkIsAuthenticated, async (req, res) => {
        {
            if (req.body && req.body.member) {
                await deletemember(req.body.member, res);
            }
        } 
    })
    
    app.post('/notif', async (req, res) => {
        console.log(req.body.notif);
            emit("notif", req.body.notif)

    })

    app.post('/deleteroute', checkIsAuthenticated, (req, res) => {
        let param = (req.body && req.body.autonomousProfileDelete) ? req.body.autonomousProfileDelete : "";
        if (isValidFileName(param)) {
            exec("rm -f /opt/robo/bin/autnomousProfile/" + param, (err, stdout, stderr) => {
                logErrorcb(err, stderr)
                emit("refreshProfile")
            });
        } else {
            logger.crit("invalid file name found for 'delete profile'" + param)
        }
    })

    app.post('/addAutonomousRoute', checkIsAuthenticated, (req, res) => {
        // var param = (req.body && req.body.autonomousProfileDelete) ? req.body.autonomousProfileDelete : "";

        let name = (req.body && req.body.routeName) ? req.body.routeName : "";
        let arr = (req.body && req.body.routeCoordinate) ? JSON.parse(req.body.routeCoordinate) : "";
        if (!name || !arr) {
            emit("msgx", "invalid route name or input coordinate")
        } else {
            if (!isValidFileName(name)) {
                name = name.replace(replacefileNameReg, "_");
            }
            if (!name.endsWith(".dat")) {
                name += ".dat";
            }
            if (arr.length) {
                let result = "";
                let valid = true;
                for (var i = 0; i < arr.length; i++) {
                    if (!isValidDecimalNumber(arr[i].x) || !isValidDecimalNumber(arr[i].y)) {
                        emit("msgx", "invalid Route input")
                        valid = false;
                        break;
                    }
                    result += arr[i].x + "," + arr[i].y + ":";
                }

                if (valid) {
                    exec("echo '" + result + "' > /opt/robo/bin/autnomousProfile/" + name, (err, stdout, stderr) => {
                        logErrorcb(err, stderr)
                        emit("refreshAddRoute")
                    });
                }
            }
        }


        // res.redirect('back');
    })


    app.delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/login')
    })

    app.get('/forgot', function(req, res) {
        res.render('pages/forgot.ejs', { msx: '' });
    });

    app.post('/forgot', async (req, res) => {
        await resetPassword(req.headers.host, req.body, res);
    })

    app.post('/reset', async (req, res) => {
        await checkResetToken(req, res);
    });

    app.post('/resetpass', async (req, res) => {
        await changePassword(req, res);
    });
    /*
    app.all('/',checkisAllowedMethod, function(req, res) {
        res.redirect('/')
    });*/
    app.all('*', function(req, res) {
        res.redirect('/')
    });


}
function emit(event){
    emit(event,"")
}

function emit(event, msg){
    if(socket){
        socket.emit(event,msg);
    }
}

const setsocket = (socketio) => {
    socket = socketio;
}

module.exports = {
    setsocket,
    initializeApp
};