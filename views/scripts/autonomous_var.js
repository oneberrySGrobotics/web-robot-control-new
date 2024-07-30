// const autonomousSwitch = document.getElementById('autonomousSwitch');
var calibrateswitchStatus = false;
const socket = io();
var arr = new Array();
var selectProfileValue = "";
var deleteProfileValue = "";
var robotLocX = 10000;
var robotLocY = 10000;
var isTransformXY = "true";
var isCustomizeRoute = 0;
var isCustomizeZone = 0;
var isDeletingProfile = 0;

var isGetcanvassOffset = 0;
var isAddRoute = 0;

var sickMapScale = 25;
var XcanvassOffsetToZeroSick = 0; //x according to canvas (horizontal)
var YcanvassOffsetToZeroSick = 0; // x according to canvas (horizontal)

var clickXoffset = 3;
var clickYoffset = 3;
var clickDimention = 5;

var calibrateXoffset = 2;
var calibrateYoffset = 2;
var calibrateDimention = 5;

var strokeTextXoffset = 3;
var strokeTextYoffset = -10;

var routeCoord = [];
var calibrateCoord = [];
var isPaintRandomCoor = 0;

var isCanvasLoad = 0;

let offsetArr=[];
var globalID;
var ctx;
var ctx2;
const canvas = document.getElementById('canvasmap');
const canvasTrans = document.getElementById('canvasmapRobotPosition');



// socket.emit("testio");