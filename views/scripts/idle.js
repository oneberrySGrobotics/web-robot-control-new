sessionExpiration(idleMinutes = 30, warningMinutes = 14, logoutUrl = '/logout');
// sessionExpiration(idleMinutes = 0.5, warningMinutes = 0.01, logoutUrl = '/logout');




function sessionExpiration(idleMinInput, warningMinInput, logoutUrl, serverRefresh = 'none') {
    var t;
    var activeTime;
    var oldActiveTime; /* Only used if serverRefresh URL is provided. */
    var serverInterval = 50; /* Seconds. If serverRefresh URL is provided, at what interval to you want to contact server? */
    var warningCountdown;
    var sessExpirDiv = document.getElementById('sessExpirDiv');
    // window.onload = resetTimer; /* Window is refreshed. */
    window.onmousemove = resetTimer; /* Mouse is moved. */
    window.onkeypress = resetTimer; /* Key is pressed. */
    window.onmousedown = resetTimer; /* Touchscreen is pressed. */
    window.onclick = resetTimer; /* Touchpad clicks. */
    window.onscroll = resetTimer; /* Scrolling with arrow keys. */
    if (serverRefresh !== 'none') {
        refreshServer();
    }
    resetTimer();

    function warning(idleSeconds, warningSeconds) {
        bannerDisplay = setTimeout(function() {
            sessExpirDiv.style.display = 'inline-block';
        }, 100); /* In Firefox opacity isn't taken into account before the page and div load. Without this the banner would flicker upon page load. */
        warningStart = setTimeout(function() {
            sessExpirDiv.style.opacity = '0.96';
            sessExpirDiv.style.zIndex = '999999';
        }, 1100); /* Wtihout this, warning div would appear before the text. */
        remaining = idleSeconds - warningSeconds;
        warningCountdown = setInterval(function() { /* Update every 1 second. */
            if (remaining <= 0) {
                /* Now we check that no other tab has been active after us. */
                var browserActive = localStorage.getItem('activeTime');
                if (activeTime != browserActive) { /* Then another tab has been active more recently than this tab. */
                    // alert("Not the same. User has been active in another tab. browserActive: " + browserActive + " and activeTime: " + activeTime);
                    /* We want to keep going, because user might close the other tab - and if this script is broken, the sessionExpiration is broken. */
                    sessionExpiration(idleMinInput, warningMinInput, logoutUrl);
                } else {
                    // alert("The same. User has not been active in another tab. browserActive: " + browserActive + " and activeTime: " + activeTime);
                    logout();
                }
            } else {
                remaining -= 1;
                document.getElementById('sessExpirDiv').innerHTML =
                    '<p id="sessExpirP">User is inactive!.<br> ' + remaining + ' seconds to sign out.<br><br>Use keyboard or mouse to remain logged in.</p>';
            }
        }, 1000);
    }

    function recordTime() {
        activeTime = Date.now(); /* Milliseconds since 1970/01/01. */
        localStorage.setItem('activeTime', activeTime);
    }

    function clearEverything() {
        clearTimeout(t);
        clearInterval(warningCountdown);
        clearWarning();
    }

    function clearWarning() {
        sessExpirDiv.style.opacity = '0';
        sessExpirDiv.innerText = ' ';
        sessExpirDiv.style.zIndex = '-999999';
    }

    function logout() {
        // window.location.href = logoutUrl;
        
        hideRobot();
        logoutbutton.click();
    }

    function resetTimer() {
        clearEverything();
        recordTime(); /* Records across all tabs in browser. */
        var idleMinutes = idleMinInput; /* After how long idle time do we log out user? */
        var warningMinutes = warningMinInput; /* After how long idle time do we start the warning countdown? */
        var idleSeconds = parseInt(idleMinutes * 60);
        var warningSeconds = parseInt(warningMinutes * 60);
        var wMilliSeconds = warningSeconds * 1000;
        /* When user has been idle warningSeconds number of seconds, we display warning and countdown. */
        t = setTimeout(function() { warning(idleSeconds, warningSeconds); }, wMilliSeconds);
    }
    /* Optional. This is used only if you have a server end session timer too, and provide the URL serverRefresh. */
    function refreshServer() {
        setInterval(function() {
            if (activeTime !== oldActiveTime) { /* Then user has been active in the last 50 seconds. */
                var xhr = new XMLHttpRequest();
                xhr.open('GET', serverRefresh);
                xhr.send(null);
                oldActiveTime = activeTime;
            }
        }, serverInterval * 1000);
    }
};