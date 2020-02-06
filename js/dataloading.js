/**
 * Created by Aero on 08/03/2017.
 */

function dataProcessing(callback) {

    loadData(function() {

         initData(callback);
    });
}

function initData(callback) {

    setTimeout(callback, 200);
}

function loadData(callback) {

    var loader = new THREE.FontLoader();
    

     loader.load( './helvetiker_regular.typeface.json', function ( font ) {

        fontData = font;

    } );


     /*
    loader.load( './FangSong_GB2312_Regular.json', function ( font ) {

        fontData = font;

    } );

    */

    d3.json("./china_data.json")
        .then(function(data) {
            dataChina = data;
        });

    d3.json("./china_s.geojson")
        .then(function(data) {
            dataChinaGeo = data.features;
        });

    setTimeout(callback, 2000);
}

