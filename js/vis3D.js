/**
 * Created by Aero on 23/11/2018.
 */

var INTERSECTED;
var citySelectedCurr = null;


var glChinaMapObjectsArr = [];

var glTextObjectsArr = [];

var glMapZs = null;
var glMapPositions = null;
var VIS = {
    //DOM features
    windowdiv_width: $("#map").width(),
    windowdiv_height: $("#map").height(),

    //map plane in scene
    map_length: 2800,
    map_width: 2400,
    map_height: 1500,

    //UI
    groupMapCityUI: null,

    projection: null,
    centerOnTexture: d3.map(),

    PositionsOD: d3.map(),
    icelandCenter: [109.6629011, 28.5429806],

    //THREE Components
    camera: null,
    glScene: null,
    cssScene: null,
    glRenderer: null,
    cssRenderer: null,
    controls: null,
    dragControls: null,

    raycaster: null,
    mouse: null,


    // 3D graphic
    unitline3D: 120,
    canvas: document.createElement("CANVAS"),
    ctx: null,
    texture: null,

    label_ctx: null,
    labeltexture: null,


    //max in dataset
    maxAngle: 0,

    maxTotalFlowValue: 0,
    maxSingleFlowValue: 0,
    //scale & color
    linerScaleWidth: null,
    linerScaleValue2Z: null,
    linerScaleAngle2Z: null,
    linerScaleAngle2ZDouble: null,

    //max for graphic
    maxValueWidth: 30,
    maxValueZ: 1500,

    angle2heightZ: 1,
    color: null,

    tweenODMatrixGroup: new TWEEN.Group(),
    tweenODTriangleGroup: new TWEEN.Group(),

}

function initBasic3D() {

    initialize(function() {

        updateVis();
    });

}

function initialize(callback) {

    createTHREEComponents();

    VIS.texture = createTexture();

    VIS.linerScaleWidth = createScaleLinerWidth();

    VIS.linerScaleValue2Z = createScaleLinerHeight();

    VIS.linerScaleAngle2Z = createScaleLinerAngleZ();

    VIS.linerScaleAngle2ZDouble = createScaleLinerAngleZDouble();

    VIS.color = createColorScale();

    VIS.projection = createProjection();

    VIS.groupMapCityUI = createGroupforUI();

    $('input[name="layercontrol"]').change(function(e) {

        updateVis();
    });


    function createProjection() {
        return d3.geoMercator()
            .scale(4000)
            .center(VIS.icelandCenter)
            .translate([VIS.map_length / 2, VIS.map_width / 2]);
    }

    function createTexture() {

        // var devicePixelRatio = window.devicePixelRatio || 1;
        var devicePixelRatio = 1;

        VIS.canvas.width = VIS.map_length;
        VIS.canvas.height = VIS.map_width;
        VIS.ctx = VIS.canvas.getContext('2d');
        VIS.ctx.scale(devicePixelRatio, devicePixelRatio);
        return new THREE.Texture(VIS.canvas);
    }

    function createTHREEComponents() {

        VIS.camera = new THREE.PerspectiveCamera(50, VIS.windowdiv_width / VIS.windowdiv_height, 0.1, 10000);
        VIS.camera.position.set(0, -3000, 3500);

        VIS.glRenderer = createGlRenderer();
        VIS.cssRenderer = createCssRenderer();

        VIS.raycaster = new THREE.Raycaster();
        VIS.mouse = new THREE.Vector2();

        //document.addEventListener( 'mousemove', onDocumentMouseMove, false );

        //document.addEventListener('dblclick', onDoubleClick, false);

        document.getElementById("map").appendChild(VIS.cssRenderer.domElement);
        document.getElementById("map").appendChild(VIS.glRenderer.domElement);

        window.addEventListener('resize', onWindowResize, false);


        VIS.glScene = new THREE.Scene();
        VIS.cssScene = new THREE.Scene();

        addLights();
        addController();

        function createGlRenderer() {

            var glRenderer = new THREE.WebGLRenderer({ alpha: true });
            glRenderer.setClearColor(0xf0f0f0);

            glRenderer.setPixelRatio(window.devicePixelRatio);
            glRenderer.setSize(VIS.windowdiv_width, VIS.windowdiv_height);
            glRenderer.domElement.style.position = 'absolute';
            glRenderer.domElement.style.top = 0;
            glRenderer.shadowMap.enabled = true;
            glRenderer.shadowMap.type = THREE.PCFShadowMap;
            glRenderer.shadowMapAutoUpdate = true;

            //glRenderer.domElement.style.zIndex = 0;
            glRenderer.domElement.style.zIndex = 2;
            return glRenderer;
        }

        function onWindowResize() {

            VIS.camera.aspect = window.innerWidth / window.innerHeight;
            VIS.camera.updateProjectionMatrix();

            VIS.glRenderer.setSize(window.innerWidth, window.innerHeight);
            VIS.cssRenderer.setSize(window.innerWidth, window.innerHeight);

        }

        function createCssRenderer() {
            var cssRenderer = new THREE.CSS3DRenderer();
            cssRenderer.setSize(VIS.windowdiv_width, VIS.windowdiv_height);
            //VIS.glRenderer.domElement.style.zIndex = 0;
            cssRenderer.domElement.style.top = 0;

            cssRenderer.domElement.style.zIndex = 1;
            return cssRenderer;
        }

        function addLights() {


            var ambientLight = new THREE.AmbientLight(0x445555);
            VIS.glScene.add(ambientLight);
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(1000, -2, 10).normalize();
            VIS.glScene.add(directionalLight);


            var directionalLight1 = new THREE.DirectionalLight(0xffffff);
            directionalLight1.position.set(-100, -200, 200).normalize();
            VIS.glScene.add(directionalLight1);


        }

        function addController() {
            VIS.controls = new THREE.TrackballControls(VIS.camera);
            VIS.controls.rotateSpeed = 2;
            VIS.controls.minDistance = 30;
            VIS.controls.maxDistance = 8000;
        }

    }

    function onDocumentMouseMove(event) {

        event.preventDefault();

        VIS.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        VIS.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    }

    function createGroupforUI() {

        var mapDOM = document.createElement('div');
        mapDOM.setAttribute("id", "map_container");
        mapDOM.setAttribute("background-color", "transparent");
        //document.body.appendChild(elem);
        document.getElementById("map").appendChild(mapDOM);

        //var map_container = document.getElementById("map_container");
        var cssObject = new THREE.CSS3DObject(mapDOM);
        cssObject.position.x = 0, cssObject.position.y = 0, cssObject.position.z = 0;
        cssObject.receiveShadow = true;

        objectCssSet.push(cssObject);
        VIS.cssScene.add(cssObject);

        var svg = d3.select("#map_container").append("svg")
            .attr("width", VIS.map_length)
            .attr("height", VIS.map_width);

        return svg.append("g")
            .attr("class", "basemap3D");
    }

    function createColorScale() {

        return d3.scaleOrdinal(["#fe8173", "#beb9d9", "#b1df71", "#31b1dd",
                "#4eb01f", "#feb567", "#8ad4c8", "#d3d431"
            ])
            .domain(["Capital", "East", "Northeast", "Northwest", "South", "Southwest", "West", "Westfjords"]);


    }

    function createScaleLinerWidth() {

        var max_overall = [];
        migrationmatrix.forEach(function(d, i) {
            if (i != 0) {
                max_overall.push(d3.max(d));
            }
        });

        VIS.maxFlowValue = d3.max(max_overall);

        return d3.scaleLinear().domain([0, VIS.maxFlowValue]).range([0, VIS.maxValueWidth]);

    }

    function createScaleLinerHeight() {

        var max_overall = [];

        migrationmatrix.forEach(function(d, i) {
            if (i != 0) {
                max_overall.push(d3.max(d));
            }
        });



        return d3.scaleLinear().domain([0, 1]).range([0, 1]);

    }

    function createScaleLinerAngleZ() {

        return d3.scaleLinear().domain([0, 1]).range([0, 1]);

    }

    function createScaleLinerAngleZDouble() {

        return d3.scaleLinear().domain([0, 1]).range([0, 1]);

    }

    setTimeout(callback, 100);
}

function updateVis() {

    objectGlSet.forEach(function(d) {
        if (d.type === "Group") {
            d.children.forEach(function(t) {
                t.material.dispose();
                t.geometry.dispose();
            });
            for (let i = d.children.length - 1; i >= 0; i--) {
                d.remove(d.children[i]);
            }
        } else {
            d.material.dispose();
            d.geometry.dispose();
        }
        VIS.glScene.remove(d);
    });

    //var type = $('input[name="layercontrol"]:checked').val();


    initPrismMap();

    /*
        var type = "prism-map";

        switch (type) {
            case 'matrix':
                initODMatrix();
                break;

            case 'force-direct':


                initForceDirect3D_Height();
                break;

            case 'point-map':
                initPointMap();
                break;

            case 'prism-map':
                initPrismMap();
                break;

            case 'network':
                initNet3D();
                break;

            case 'flow-map':
            case 'sankey-map':
            case 'sankey-map-2':
            case 'sankey-map-3':
                initFlowMap();
                break;

            case 'symbolmap-3Dpie-1':
                initSymbolMapPie();
                break;

            case 'symbolmap-3Dpie-2':
                initSymbolMapPie2();
                break;

            case 'symbolmap-3Dpie-3':
                initSymbolMapPie3();
                break;

            case 'symbolmap-3Dgeo':
                initSymbolMapGeo();
                break;

            case 'flowmap-double-parallel':
                initFlowMapDoubleP();
                break;

            case 'flowmap-double-orthogonal':
                initFlowMapDoubleO();
                break;

            case '3dMatrxMap':
                init3DMatrixMap();
                break;
        }

        */

    update();
}


function createCurveArray(point_start, point_end, direction, height) {

    var angle = getAngle(point_start, point_end) / 180 * Math.PI;
    var angleX = getAngle(point_start, point_end)

    var disUnit = 50;
    var dx = disUnit * Math.sin(angle);
    var dy = disUnit * Math.cos(angle);

    var interpoint = new THREE.Vector3((point_start[0] + point_end[0]) / 2 + dx * direction,
        (point_start[1] + point_end[1]) / 2 + dy * direction,
        height);

    return [new THREE.Vector3(point_start[0], point_start[1], 0),
        interpoint,
        new THREE.Vector3(point_end[0], point_end[1], 0)
    ];


    function getAngle(a, b) {
        var dx = b[0] - a[0];
        var dy = b[1] - a[1];
        var dis = Math.sqrt(dx * dx + dy * dy);
        var rota = dis > 0 ? Math.round(Math.asin(dy / dis) / Math.PI * 180) : 0;


        if (b[0] < a[0]) {

            rota = 180 - rota;
        }

        return rota;
    }
}

// common components
function initCSSMap() {


    var textmesh = getTexturedMesh();

    objectGlSet.push(textmesh);
    VIS.glScene.add(textmesh);
    VIS.texture.needsUpdate = true;

    function getTexturedMesh() {
        var canvas_material = new THREE.MeshBasicMaterial({
            map: VIS.texture,
            side: THREE.DoubleSide,
            opacity: 0.9
        });

        var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
        var mesh = new THREE.Mesh(geometry, canvas_material);

        mesh.position.set(0, 0, 0);
        mesh.receiveShadow = true;
        return mesh;
    }

}


function updateTexture(selectedCity) {

    var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
    dataIcelandGeo.forEach(function(d) {
        var cityName = d.properties.VARNAME_1;
        if (selectedCity === cityName) {
            VIS.ctx.fillStyle = "#fff125";
        } else {
            //VIS.ctx.fillStyle = VIS.color(cityName) ;
            VIS.ctx.fillStyle = "#ddeedd";
        }
        VIS.ctx.beginPath();
        path(d);
        VIS.ctx.fill();
        VIS.ctx.stroke();
    });


    VIS.texture.needsUpdate = true;
}

function initCSSMaskUI() {


    var path = d3.geoPath().projection(VIS.projection);

    VIS.groupMapCityUI.selectAll("path")
        .data(dataChinaGeo)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("opacity", 1.0)
        .attr("class", "basemap3Dpath")
        .attr("name", function(d) {

            var name = d.properties.ENAME;

            return name;
        })
        .on("dblclick", function(d) {

            /*

            if (d.properties.ENAME === selectedCityName) {
                updateFlowMap('ALL');
                selectedCityName = '';
            } else {
                //updateFlowMap(d.properties.gm_naam);
                selectedCityName = d.properties.ENAME;
            }
            */

        });

    //compute
    d3.selectAll(".basemap3Dpath").each(function(d) {
        var center = path.centroid(d);
        var named = d3.select(this).attr("name");
        VIS.centerOnTexture[named] = center;

        VIS.PositionsOD[named] = [

            center[0] - VIS.map_length / 2,
            VIS.map_width / 2 - center[1]
        ];
    });

}


function transformSVGPath(pathStr) {

    var path = new THREE.Shape();

    var idx = 1,
        len = pathStr.length,
        activeCmd,
        x = 0,
        y = 0,
        nx = 0,
        ny = 0,
        firstX = null,
        firstY = null,
        x1 = 0,
        x2 = 0,
        y1 = 0,
        y2 = 0,
        rx = 0,
        ry = 0,
        xar = 0,
        laf = 0,
        sf = 0,
        cx, cy;

    function eatNum() {
        var sidx, c, isFloat = false,
            s;
        // eat delims
        while (idx < len) {
            c = pathStr.charCodeAt(idx);
            if (c !== COMMA && c !== SPACE)
                break;
            idx++;
        }
        if (c === MINUS)
            sidx = idx++;
        else
            sidx = idx;
        // eat number
        while (idx < len) {
            c = pathStr.charCodeAt(idx);
            if (DIGIT_0 <= c && c <= DIGIT_9) {
                idx++;
                continue;
            } else if (c === PERIOD) {
                idx++;
                isFloat = true;
                continue;
            }

            s = pathStr.substring(sidx, idx);
            return isFloat ? parseFloat(s) : parseInt(s);
        }

        s = pathStr.substring(sidx);
        return isFloat ? parseFloat(s) : parseInt(s);
    }

    function nextIsNum() {
        var c;
        // do permanently eat any delims...
        while (idx < len) {
            c = pathStr.charCodeAt(idx);
            if (c !== COMMA && c !== SPACE)
                break;
            idx++;
        }
        c = pathStr.charCodeAt(idx);
        return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }

    var canRepeat;
    activeCmd = pathStr[0];
    while (idx <= len) {
        canRepeat = true;
        switch (activeCmd) {
            // moveto commands, become lineto's if repeated
            case 'M':
                x = eatNum();
                y = eatNum();
                path.moveTo(x, y);
                activeCmd = 'L';
                break;
            case 'm':
                x += eatNum();
                y += eatNum();
                path.moveTo(x, y);
                activeCmd = 'l';
                break;
            case 'Z':
            case 'z':
                canRepeat = false;
                if (x !== firstX || y !== firstY)
                    path.lineTo(firstX, firstY);
                break;
                // - lines!
            case 'L':
            case 'H':
            case 'V':
                nx = (activeCmd === 'V') ? x : eatNum();
                ny = (activeCmd === 'H') ? y : eatNum();
                path.lineTo(nx, ny);
                x = nx;
                y = ny;
                break;
            case 'l':
            case 'h':
            case 'v':
                nx = (activeCmd === 'v') ? x : (x + eatNum());
                ny = (activeCmd === 'h') ? y : (y + eatNum());
                path.lineTo(nx, ny);
                x = nx;
                y = ny;
                break;
                // - cubic bezier
            case 'C':
                x1 = eatNum();
                y1 = eatNum();
            case 'S':
                if (activeCmd === 'S') {
                    x1 = 2 * x - x2;
                    y1 = 2 * y - y2;
                }
                x2 = eatNum();
                y2 = eatNum();
                nx = eatNum();
                ny = eatNum();
                path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                x = nx;
                y = ny;
                break;
            case 'c':
                x1 = x + eatNum();
                y1 = y + eatNum();
            case 's':
                if (activeCmd === 's') {
                    x1 = 2 * x - x2;
                    y1 = 2 * y - y2;
                }
                x2 = x + eatNum();
                y2 = y + eatNum();
                nx = x + eatNum();
                ny = y + eatNum();
                path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                x = nx;
                y = ny;
                break;
                // - quadratic bezier
            case 'Q':
                x1 = eatNum();
                y1 = eatNum();
            case 'T':
                if (activeCmd === 'T') {
                    x1 = 2 * x - x1;
                    y1 = 2 * y - y1;
                }
                nx = eatNum();
                ny = eatNum();
                path.quadraticCurveTo(x1, y1, nx, ny);
                x = nx;
                y = ny;
                break;
            case 'q':
                x1 = x + eatNum();
                y1 = y + eatNum();
            case 't':
                if (activeCmd === 't') {
                    x1 = 2 * x - x1;
                    y1 = 2 * y - y1;
                }
                nx = x + eatNum();
                ny = y + eatNum();
                path.quadraticCurveTo(x1, y1, nx, ny);
                x = nx;
                y = ny;
                break;
                // - elliptical arc
            case 'A':
                rx = eatNum();
                ry = eatNum();
                xar = eatNum() * DEGS_TO_RADS;
                laf = eatNum();
                sf = eatNum();
                nx = eatNum();
                ny = eatNum();
                if (rx !== ry) {
                    console.warn("Forcing elliptical arc to be a circular one :(",
                        rx, ry);
                }
                // SVG implementation notes does all the math for us! woo!
                // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
                // step1, using x1 as x1'
                x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
                y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
                // step 2, using x2 as cx'
                var norm = Math.sqrt(
                    (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
                    (rx * rx * y1 * y1 + ry * ry * x1 * x1));
                if (laf === sf)
                    norm = -norm;
                x2 = norm * rx * y1 / ry;
                y2 = norm * -ry * x1 / rx;
                // step 3
                cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
                cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;

                var u = new THREE.Vector2(1, 0),
                    v = new THREE.Vector2((x1 - x2) / rx,
                        (y1 - y2) / ry);
                var startAng = Math.acos(u.dot(v) / u.length() / v.length());
                if (u.x * v.y - u.y * v.x < 0)
                    startAng = -startAng;

                // we can reuse 'v' from start angle as our 'u' for delta angle
                u.x = (-x1 - x2) / rx;
                u.y = (-y1 - y2) / ry;

                var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
                // This normalization ends up making our curves fail to triangulate...
                if (v.x * u.y - v.y * u.x < 0)
                    deltaAng = -deltaAng;
                if (!sf && deltaAng > 0)
                    deltaAng -= Math.PI * 2;
                if (sf && deltaAng < 0)
                    deltaAng += Math.PI * 2;

                path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
                x = nx;
                y = ny;
                break;
            default:
                throw new Error("weird path command: " + activeCmd);
        }
        if (firstX === null) {
            firstX = x;
            firstY = y;
        }
        // just reissue the command
        if (canRepeat && nextIsNum())
            continue;
        activeCmd = pathStr[idx++];
    }

    return path;
}


function onDoubleClick(event) {


    event.preventDefault();

    VIS.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    VIS.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    VIS.raycaster.setFromCamera(VIS.mouse, VIS.camera);
    var intersects = VIS.raycaster.intersectObjects(VIS.glScene.getObjectByName("group_glmap").children, true);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {
            //intersects[0].object
            if (INTERSECTED) {
                //console.log(INTERSECTED.name);
                INTERSECTED.material = new THREE.MeshBasicMaterial({ color: VIS.color(INTERSECTED.name) });
            }

            INTERSECTED = intersects[0].object;
            INTERSECTED.material = new THREE.MeshBasicMaterial({ color: "#d9dd28" });
            updateFlowMap(INTERSECTED.name);
        }


    } else {

        if (INTERSECTED) INTERSECTED.material = new THREE.MeshBasicMaterial({ color: VIS.color(INTERSECTED.name) });
        INTERSECTED = null;
        updateFlowMap("ALL");
    }

}


function initPrismMap() {


    initCSSMaskUI();

    var path = d3.geoPath().projection(VIS.projection);

    var groupMap = new THREE.Group();

    groupMap.name = "group_map";


    var groupText = new THREE.Group();

    groupText.name = "group_text";

    const colorScheme = [
        "#8dd3c7",
        "#ffffb3",
        "#bebada",
        "#fb8072",
        "#80b1d3",
        "#fdb462",
        "#b3de69",
        "#fccde5",
        "#d9d9d9",
        "#bc80bd",
        "#ccebc5"

    ];


    dataChinaGeo.forEach(function(d, i) {

        var cityName = d.properties.NAME;
        var cityNameE = d.properties.ENAME;
        var index = cityName.indexOf("|");
        if (index != -1) {
            cityName = cityName.substr(0, index);
        }

        var indexthisCity = citynameIndexMap.indexOf(cityName);

        var feature = path(d);

        var shape = transformSVGPath(feature);

        var index = dataChina.proviceList.indexOf(cityName);

        //console.log(index)
        var height = dataChina.provinceData[index].timeline[0];

        var extrudeSettings = {
            steps: 1,
            depth: height,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 0,
            bevelSegments: 0
        };

        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(Math.PI);


        var centerPoint = VIS.PositionsOD[cityNameE];


        var color = colorScheme[i % 11];

        var material = new THREE.MeshLambertMaterial({ color: color });

        var mesh = new THREE.Mesh(geometry, material);

        //console.log(cityName);

        mesh.name = cityName;

        mesh.position.set(-VIS.map_length / 2, +VIS.map_width / 2, height + 10);

        groupMap.add(mesh);

        glChinaMapObjectsArr.push(mesh);


        //-----------add text------------

        var geometryText = new THREE.TextGeometry(d.properties.SNAME + ':' + height, {
            font: fontData,
            size: 40,
            height: 5,
            curveSegments: 1,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        });

        //var materialText = new THREE.MeshLambertMaterial({color: "#00FF00"});

        var meshText = new THREE.Mesh(geometryText, material);
        meshText.rotateX(Math.PI / 2);
        meshText.position.set(centerPoint[0], centerPoint[1], height + 20);

        // meshText.position.set(centerPoint[0] -VIS.map_length / 2, centerPoint[1]+VIS.map_width / 2, height + 1);

        groupText.add(meshText);

        glTextObjectsArr.push(meshText);

    });

    objectGlSet.push(groupMap);
    VIS.glScene.add(groupMap);


    objectGlSet.push(groupText);
    VIS.glScene.add(groupText);

    //addDragableControllers();

    /*

    function addDragableControllers() {

        VIS.dragControls = new THREE.DragControls(
            // VIS.glScene.getObjectByName("group_glmap").children,
            glMapObjectsArr,
            VIS.camera, VIS.glRenderer.domElement);

        VIS.dragControls.addEventListener('dragstart', function () {

            VIS.controls.enabled = false;

        });
        VIS.dragControls.addEventListener('dragend', function () {

            VIS.controls.enabled = true;

            glMapZs = glMapObjectsArr.map(function (d) {
                return d.position.z;
            });

            glMapPositions = glMapObjectsArr.map(function (d, i) {

                //console.log(d.position.y);
                return [
                    VIS.PositionsOD[citynameIndexMap[i]][0] + d.position.x + VIS.map_length / 2,
                    VIS.PositionsOD[citynameIndexMap[i]][1] + d.position.y - VIS.map_width / 2,
                    d.position.z
                ]
            });

            if (citySelectedCurr) updateFlows(citySelectedCurr)
            else updateFlows("ALL");

        });

    } */

}


var ii = 0;

function updatePrismMap() {

    //console.log(clock);

    VIS.glScene.getObjectByName("group_map").children
        .forEach(function(cellMesh) {
            var name = cellMesh.name;

            var index = dataChina.proviceList.indexOf(name);

            var height = dataChina.provinceData[index].timeline[clock];
            //-dataChina.provinceData[index].timeline[clock];


            var length_2 = parseInt(cellMesh.geometry.vertices.length / 2) + 1;
            cellMesh.geometry.vertices.forEach(function(d, i) {


                if (i < length_2) {
                    d.z = height;
                }
            });
            cellMesh.geometry.verticesNeedUpdate = true;


        });


    var mesh = VIS.glScene.getObjectByName("group_map").children[21];


    console.log(mesh)


    ii++;

    /*

       




            */


    //initCSSMaskUI();

    //VIS.tweenODTriangleGroup.removeAll();
    /*
     VIS.glScene.getObjectByName("group_glmap").children
         .forEach(function (cellMesh) {

             var str = cellMesh.name.split('-');
             var rowIndex = parseInt(str[0]),
                 colIndex = parseInt(str[1]);

             if (selectedCity == "ALL") {

                 var height = VIS.linerScaleValue2Z(dataOveriFlow.matrix[rowIndex][colIndex]);



             } else {

                 var height = VIS.linerScaleValue2Z(dataOveriFlow.matrix[rowIndex][colIndex]);


                 if (rowIndex == dataOveriFlow.cities.indexOf(selectedCity)) {
                     meshGrowUp(cellMesh, height, VIS.color(dataOveriFlow.cities[rowIndex]));

                 } else if (colIndex == dataOveriFlow.cities.indexOf(selectedCity)) {
                     meshGrowUp(cellMesh, height, VIS.color(dataOveriFlow.cities[rowIndex]));

                 } else {
                     meshGropDown(cellMesh, height, VIS.color(dataOveriFlow.cities[rowIndex]));
                 }
             }

            


         });


     function meshGrowUp(mesh, height, color) {

         mesh.material.setValues({color: color});
         mesh.material.needsUpdate = true;

         var timer = {x: 0};

         if (mesh.geometry.vertices[3].z == 0) {
             var tween = new TWEEN.Tween(timer, VIS.tweenODTriangleGroup)
                 .to({x: 1}, 1000)
                 .onUpdate(function () {
                     mesh.geometry.vertices.forEach(function (d, i) {
                         if (i > 2) {
                             d.z = timer.x * height;
                         }
                     });
                     mesh.geometry.verticesNeedUpdate = true;
                 })
                 .easing(TWEEN.Easing.Quadratic.Out)
                 .start();
         }
     }

     //console.log(tripTime);

       */

}

function update() {

    TWEEN.update();

    //VIS.tweenODMatrixGroup.update();
    //VIS.tweenODTriangleGroup.update();

    VIS.controls.update();
    VIS.glRenderer.render(VIS.glScene, VIS.camera);
    VIS.cssRenderer.render(VIS.cssScene, VIS.camera);


    var timestamp = Date.now() / 1000;

    clock = parseInt(((timestamp % loopTime) / loopTime) * loopLength);

    if (clock != clock_old) {
        updatePrismMap();

        clock_old = clock;
    }



    requestAnimationFrame(update);
}