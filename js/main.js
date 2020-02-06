/**
 * Created by Aero on 15/02/2017.
 */



var dataChinaGeo;
var dataChinaNcov;

var fontData;

const loopLength = 8;
const animationSpeed = 0.5;
const loopTime = loopLength / animationSpeed;
var clock_old = -1;
var clock = 0;




var dataIcelandGeo;
var dataIcelandGeoForGl;

var citynameIndexMap = [];

var migrationmatrix = [];
var graph = null;

var objectGlSet =[];

var objectCssSet = [];



var lastSelectedCity = null;
var selectedCity = null;
var drawingallSwith = true;
var lines3DSet =[];
var linesPara3DSet =[];



//var dataOveriGeo;
//var dataOveriFlow;
var dataChord;
var dataChordT;
var dataChordC;

var dataOveriGeoCollection;


var flowsSet =[];
var cylinderODSet = [];

var cylinderODSetForGroupDirection = [];

var cylinderODSetForGroupNode = [];

var barODSet = [];
var pieODSet = [];

var selectedCityName = '';


//var typeOf3DFlow = "line";
var typeOf3DFlow = "tube";

const SHOW_ALL_FLOWS = -5;
var font = null;

//var texture = null;
//var textureMaterial = null;


const DEGS_TO_RADS = Math.PI / 180,
    UNIT_SIZE = 100;

const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
    MINUS = 45;

/*
var t = d3.timer(function(elapsed) {
    console.log(elapsed);
    if (elapsed > 5000) t.stop();
}, 3000);
*/





function visStart_3D(e){

    dataProcessing(initBasic3D);

}

function visStart_2D(e){

    dataProcessing(initBasic2D);

}


//-------------- run time -----------------

/*
function updateVisualizations(selectedCity){

    var index = citynameIndexMap.indexOf(selectedCity);
    drawingallSwith = false;

    //var thiscityData = migrationmatrix[index];
    graphics2D.g_flows2D.selectAll("." + graphics2D.className2Dflows).remove();

    //drawFlowsOn2DMap(index);
    highlightChord(index);
    draw3DFlows(index);
    draw3DSankeyFlows(index);
    update();

}

function highlightChord(index){
    var paths = graphics2D.g_chord.select("#chordRibbonGourp").selectAll("path");
    paths.each(function(d){
        if( d3.select(this).attr("source") == index ||
            d3.select(this).attr("target") == index) {
            d3.select(this).attr("class", "chordHighlightRibbon");
        }
        else{
            d3.select(this).attr("class", "chordMuteRibbon");
        }

    });
}
*/

