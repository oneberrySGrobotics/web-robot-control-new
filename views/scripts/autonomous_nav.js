  var navistate = false;
  // var vw=window.innerWidth;
  // alert(vw);
  function navigationSize(nav) {
//       console.log(vw);
      var navx = document.getElementById('navigator');
      if (navistate) {
//           console.log(window.innerWidth)
          nav.children[0].innerText = ">";
          if (window.innerWidth > 1200) {
              navx.style.width = '25%';
          } else {
              navx.style.width = null;
          }
      } else {
          nav.children[0].innerText = "<";
          navx.style.width = '50%';
      }
      navistate = !navistate;
  }
window.visualViewport.addEventListener("resize", viewportHandler);
function viewportHandler(event) {
      var nav = document.getElementById('navigatorPanelController');
      var navx = document.getElementById('navigator');
           console.log(window.innerWidth)
      if (navistate) {
          if (window.innerWidth > 1200) {
              navx.style.width = '25%';
          } else {
              navx.style.width = null;
      			navistate = false;
          }
          nav.children[0].innerText = ">";
      } else {
          nav.children[0].innerText = "<";
          if (window.innerWidth > 1200) {
              navx.style.width = '25%';
          } else {
              navx.style.width = null;
          }
      }
}

  function openCity(evt, tabLabel) {
      loadCanvas();
      getClickableArea();
      if (tabLabel == "offset") {
          setGetOffsetSetting(true);
      } else {
          setGetOffsetSetting(false);
      }

      if (tabLabel == "route") {
          setRouteSetting(true);
      } else {
          setRouteSetting(false);
      }

      if (tabLabel == "run") {
          setrunSetting(true);
      } else {
          setrunSetting(false);
      }

      if (tabLabel == "customizeRoute") {
          setcustomRouteSetting(true);
      } else {
          setcustomRouteSetting(false);
      }

      if (tabLabel == "CustomizeGZone") {
          setcuztomizeZoneSetting(true);
      } else {
          setcuztomizeZoneSetting(false);
      }
      if (tabLabel == "soundsList") {
          setsoundsListSetting(true);
      } else {
          setsoundsListSetting(false);
      }
      if (tabLabel == "facelist") {
          setFaceListSetting(true);
      } else {
          setFaceListSetting(false);
      }
      if (tabLabel == "setting") {
          setAutonomousSetting(true);
      } else {
          setAutonomousSetting(false);
      }

      let i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabLabel).style.display = "block";
      evt.currentTarget.className += " active";

  }

  function setGetOffsetSetting(bool) {
      if (bool) {

       /*   document.getElementById('prevOffsetx').innerText = "";
          document.getElementById('prevOffsetxValue').innerText = "";
          document.getElementById('prevOffsety').innerText = "";
          document.getElementById('prevOffsetyvalue').innerText = "";*/
          // getCalibratedData();
          isGetcanvassOffset = 1;

          hideRobot();
      } else {
          isGetcanvassOffset = 0;
      }
  }

  function setrunSetting(bool) {
      if (bool) {
          // getDataProfile();
          //   
          if (autonomousProfileSelect.options.selectedIndex > 0) {
              socket.emit("getRouteProfileData", autonomousProfileSelect.options[autonomousProfileSelect.options.selectedIndex].value);
          }
      } else {}
      // loadCanvas();
  }

  function setRouteSetting(bool) {
      if (bool) {
          // getDataProfile(false);
          //   
          count = 0;


          hideRobot();
          routeCoord = [];
          isAddRoute = 1;
      } else {
          isAddRoute = 0;
      }
      // loadCanvas();
  }

  function setcuztomizeZoneSetting(bool) {
      if (bool) {
          isCustomizeZone = 1;
          var container = document.getElementById("zoneCoor");
          while (container.hasChildNodes()) {
              container.removeChild(container.lastChild);
          }
          getCalibratedData();

      } else {
          isCustomizeZone = 0;
      }
      // loadCanvas();
  }

  function setcustomRouteSetting(bool) {
      if (bool) {
          isCustomizeRoute = 1;
          var container = document.getElementById("customCoor");
          while (container.hasChildNodes()) {
              container.removeChild(container.lastChild);
          }
          hideRobot();
          if (autonomousProfileDelete.options.selectedIndex > 0) {
              socket.emit("getRouteProfileData", autonomousProfileDelete.options[autonomousProfileDelete.options.selectedIndex].value);
          }

          // getDataProfile();

      } else {
          isCustomizeRoute = 0;
      }
      // loadCanvas();
  }


  function setsoundsListSetting(bool) {
      if (bool) {
          requestSoundlist();
      } else {}
      // loadCanvas();
  }


  function setFaceListSetting(bool) {
      if (bool) {
          requestFacelist();
      } else {}
      // loadCanvas();
  }


  function setAutonomousSetting(bool) {
      if (bool) {
          requestAutonomousSetting();
      } else {}
      // loadCanvas();
  }