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

function initODMatrix() {

    var posODPlane = [0, 0, 0];

    var cellWidth, cellHeight, cellPadding;
    var unit = 0.8 * VIS.map_width / migrationmatrix.length;
    cellWidth = cellHeight = unit * 0.8;
    cellPadding = unit * 0.2;

    var matrixPos2d = [posODPlane[0] - VIS.map_length / 2 + (VIS.map_length - 0.8 * VIS.map_width) / 2 + unit / 2,
        posODPlane[1] - VIS.map_width / 2 + 0.1 * VIS.map_width + unit / 2
    ];


    //var grids = getGrids();
    var grids = getCaptailRowCol();
    var basePlane = initODMatrxiPlane(posODPlane);


    objectGlSet.push(basePlane);
    VIS.glScene.add(basePlane);

    objectGlSet.push(grids);
    VIS.glScene.add(grids);


    //VIS.glScene.add(  getSumGrids());

    createGridLabels();

    function getCaptailRowCol() {

        var group = new THREE.Group();

        group.name = "matrix_group";

        migrationmatrix.forEach(function(row, i) {
            //var color = VIS.color(i);


            var color;

            row.forEach(function(cell, j) {

                if (cell || 1) {


                    var height = VIS.linerScaleValue2Z(cell);

                    if (citynameIndexMap[i] == "Capital" || citynameIndexMap[j] == "Capital") {

                        color = "#288fdd";

                    } else {
                        color = "#9b9b9b";
                        height = 10;
                    }


                    //var material = new THREE.MeshBasicMaterial( {color: color} );

                    var material = new THREE.MeshLambertMaterial({ color: color });

                    var geometry = new THREE.BoxGeometry(cellWidth, cellHeight, 0);
                    //var geometry = new THREE.BoxBufferGeometry( cellWidth, cellHeight, 0);

                    var cube = new THREE.Mesh(geometry, material);

                    cube.name = i + "-" + j;
                    group.add(cube);

                    var timer = { x: 0 };

                    var tween = new TWEEN.Tween(timer)
                        .to({ x: 1 }, 2000)
                        .onStart(function() {
                            cube.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                                matrixPos2d[1] + i * (cellWidth + cellPadding),
                                0);
                        })
                        .onUpdate(function() {

                            cube.geometry.vertices.forEach(function(d) {
                                d.z = d.z > 0 ? timer.x * height / 2 : -1 * timer.x * height / 2;
                            })

                            cube.geometry.verticesNeedUpdate = true;

                            cube.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                                matrixPos2d[1] + i * (cellWidth + cellPadding),
                                timer.x * VIS.linerScaleValue2Z(cell) / 2 + 10);

                            //cube.geometry.attributes.position.needsUpdate = true;

                        })
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                }

            })

        });

        return group;
    }

    function getGrids() {

        var group = new THREE.Group();

        group.name = "matrix_group";

        migrationmatrix.forEach(function(row, i) {
            //var color = VIS.color(i);

            var color = "#288fdd";

            row.forEach(function(cell, j) {

                if (cell) {

                    var height = VIS.linerScaleValue2Z(cell);
                    //var material = new THREE.MeshBasicMaterial( {color: color} );

                    var material = new THREE.MeshLambertMaterial({ color: color });

                    var geometry = new THREE.BoxGeometry(cellWidth, cellHeight, 0);
                    //var geometry = new THREE.BoxBufferGeometry( cellWidth, cellHeight, 0);

                    var cube = new THREE.Mesh(geometry, material);

                    cube.name = i + "-" + j;
                    group.add(cube);


                    var timer = { x: 0 };

                    var tween = new TWEEN.Tween(timer)
                        .to({ x: 1 }, 2000)
                        .onStart(function() {
                            cube.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                                matrixPos2d[1] + i * (cellWidth + cellPadding),
                                0);
                        })
                        .onUpdate(function() {

                            cube.geometry.vertices.forEach(function(d) {
                                d.z = d.z > 0 ? timer.x * height / 2 : -1 * timer.x * height / 2;
                            })

                            cube.geometry.verticesNeedUpdate = true;

                            cube.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                                matrixPos2d[1] + i * (cellWidth + cellPadding),
                                timer.x * VIS.linerScaleValue2Z(cell) / 2);

                            //cube.geometry.attributes.position.needsUpdate = true;

                        })
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                }

            })

        });

        return group;
    }

    function createGridLabels() {

        VIS.label_ctx.font = '30pt Arial';

        citynameIndexMap.forEach(function(d, i) {

            //labels for rows
            VIS.label_ctx.fillStyle = "#2318ff";
            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "right";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText(d,
                0.2 * VIS.map_width - cellWidth,
                VIS.map_width - (0.1 * VIS.map_width + (i + 0.5) * (cellWidth + cellPadding)));

            VIS.label_ctx.rotate(Math.PI / 2);

            //labels for columns
            VIS.label_ctx.fillStyle = "#ff6324";
            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "left";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText(d,
                VIS.map_width - 0.1 * VIS.map_width + cellPadding,
                -0.2 * VIS.map_width - i * (cellWidth + cellPadding));

            VIS.label_ctx.rotate(-Math.PI / 2)
        });

        //
        //labels for rows title


        VIS.label_ctx.font = '50pt Arial';
        VIS.label_ctx.fillStyle = "#2318ff";
        VIS.label_ctx.textAlign = "right";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Ogirins",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width - 0.5 * (cellWidth + cellPadding)));

        //labels for columns
        VIS.label_ctx.fillStyle = "#ff6324";
        VIS.label_ctx.fillText("Destinations",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width - 1.5 * (cellWidth + cellPadding)));


        // labels for sum
        VIS.label_ctx.fillStyle = "#000000";
        VIS.label_ctx.font = '30pt Arial';
        VIS.label_ctx.textAlign = "right";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Origin Sum",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width + (26 + 0.5) * (cellWidth + cellPadding)));

        VIS.label_ctx.rotate(Math.PI / 2);

        VIS.label_ctx.font = '30pt Arial';
        VIS.label_ctx.textAlign = "left";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Destination Sum",
            VIS.map_width - 0.1 * VIS.map_width + cellPadding,
            -0.2 * VIS.map_width - 26 * (cellWidth + cellPadding));

        VIS.label_ctx.rotate(-Math.PI / 2)


        VIS.labeltexture.needsUpdate = true;
    }

    function initODMatrxiPlane(posODMatrix) {

        var labelcanvas = document.createElement("CANVAS");

        labelcanvas.width = VIS.map_length;
        labelcanvas.height = VIS.map_width;
        var devicePixelRatio = 1;

        VIS.label_ctx = labelcanvas.getContext('2d');
        VIS.label_ctx.scale(devicePixelRatio, devicePixelRatio);

        VIS.labeltexture = new THREE.Texture(labelcanvas);

        var canvas_material = new THREE.MeshBasicMaterial({
            map: VIS.labeltexture,
            side: THREE.DoubleSide,
            opacity: 0.9
        });

        var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
        var mesh = new THREE.Mesh(geometry, canvas_material);

        mesh.position.set(posODMatrix[0], posODMatrix[1], posODMatrix[2]);
        mesh.receiveShadow = true;

        return mesh;

    }

}

function initForceDirect3D() {

    var links = [];
    var nodes = [];

    initForce(draw);

    function initForce(callback) {
        var arrlength = graph.nodes.length;

        var width = VIS.map_length;
        var height = VIS.map_width;

        var max_overall = [];
        migrationmatrix.forEach(function(d, i) {
            if (i != 0) {
                max_overall.push(d3.max(d));
            }
        });

        var linerValueScale = d3.scaleLinear().domain([0, d3.max(max_overall)]).range([0, 20]);
        var margin = { top: 60, right: width * 0.02, bottom: 20, left: width * 0.02 },
            width = width - margin.left - margin.right,
            height = height - margin.top - margin.bottom;


        migrationmatrix.forEach(function(row, j) {
            row.forEach(function(flow, i) {
                if (flow) {
                    links.push({
                        source: citynameIndexMap[j],
                        target: citynameIndexMap[i],
                        value: linerValueScale(flow)
                    })
                }
            })
        });

        citynameIndexMap.forEach(function(city, i) {
            nodes.push({
                id: city
            })
        });

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(width / 2.2))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));


        setTimeout(callback, 200);
    }


    function draw() {

        nodes.forEach(function(d) {

            var color = VIS.color(d.id);

            var geometry = new THREE.SphereGeometry(50, 32, 32);
            var material = new THREE.MeshLambertMaterial({ color: color });
            var sphere = new THREE.Mesh(geometry, material);


            //console.log(d.x, d.y);
            sphere.position.x = d.x - VIS.map_length / 2;
            sphere.position.y = d.y - VIS.map_width / 2;

            objectGlSet.push(sphere);
            VIS.glScene.add(sphere);

        });


        links.forEach(function(d) {

            if (d.source.id == "Capital" || d.target.id == "Capital") {


                var direction = 1;

                if (d.target.id == "Capital") {
                    direction = -1;
                }


                var line = flowParts(d, direction);

                objectGlSet.push(line);
                VIS.glScene.add(line);
            }

        });

    }


    var material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        opacity: 0.9
    });

    var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0, 0);
    mesh.receiveShadow = true;


    objectGlSet.push(mesh);
    VIS.glScene.add(mesh);

    function flowParts(item, direction) {

        var origin = [item.source.x - VIS.map_length / 2,
                item.source.y - VIS.map_width / 2
            ],
            destination = [item.target.x - VIS.map_length / 2,
                item.target.y - VIS.map_width / 2
            ];

        var color = VIS.color(item.source.id);

        var width = item.value;

        if (direction == 1) {
            color = "#dd5336"
        } else {
            color = "#288fdd"
        }


        var radius = Math.sqrt((destination[1] - origin[1]) * (destination[1] - origin[1]) +
            (destination[0] - origin[0]) * (destination[0] - origin[0])) / 2;

        var path = new THREE.CurvePath();

        for (var i = 1; i < 51; i++) {

            var j = (i - 1) / 50;
            var k = i / 50;

            path.add(new THREE.LineCurve3(
                new THREE.Vector3(
                    origin[0] + j * destination[0] - j * origin[0],
                    origin[1] + j * destination[1] - j * origin[1],
                    radius * 2 * Math.sqrt(j - j * j)
                ),

                new THREE.Vector3(
                    origin[0] + k * destination[0] - k * origin[0],
                    origin[1] + k * destination[1] - k * origin[1],
                    radius * 2 * Math.sqrt(k - k * k)
                )));

        }

        var tubeGeometry = new THREE.TubeBufferGeometry(path, 20, width, 8, false);

        tubeGeometry.center();
        tubeGeometry.translate(0, 0, radius / 2);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshLambertMaterial({ color: color }));


        mesh.rotateOnAxis(new THREE.Vector3(destination[0] - origin[0], destination[1] - origin[1], -radius / 2).normalize(), Math.PI / 20);


        mesh.position.set((destination[0] + origin[0]) / 2, (destination[1] + origin[1]) / 2, 0);

        mesh.doubleSided = true;

        return mesh;
    }

}

function initForceDirect3D_Height() {

    var links = [];
    var nodes = [];

    initForce(draw);

    function initForce(callback) {
        var arrlength = graph.nodes.length;

        var width = VIS.map_length;
        var height = VIS.map_width;

        var max_overall = [];
        migrationmatrix.forEach(function(d, i) {
            if (i != 0) {
                max_overall.push(d3.max(d));
            }
        });

        var linerValueScale = d3.scaleLinear().domain([0, d3.max(max_overall)]).range([0, 20]);
        var margin = { top: 60, right: width * 0.02, bottom: 20, left: width * 0.02 },
            width = width - margin.left - margin.right,
            height = height - margin.top - margin.bottom;


        migrationmatrix.forEach(function(row, j) {
            row.forEach(function(flow, i) {
                if (flow) {
                    links.push({
                        source: citynameIndexMap[j],
                        target: citynameIndexMap[i],
                        value: linerValueScale(flow)
                    })
                }
            })
        });

        citynameIndexMap.forEach(function(city, i) {
            nodes.push({
                id: city
            })
        });

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(width / 2.2))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));


        setTimeout(callback, 200);
    }


    function draw() {

        nodes.forEach(function(d) {

            var color = VIS.color(d.id);

            var geometry = new THREE.SphereGeometry(50, 32, 32);
            var material = new THREE.MeshLambertMaterial({ color: color });
            var sphere = new THREE.Mesh(geometry, material);


            //console.log(d.x, d.y);
            sphere.position.x = d.x - VIS.map_length / 2;
            sphere.position.y = d.y - VIS.map_width / 2;

            objectGlSet.push(sphere);
            VIS.glScene.add(sphere);

        });


        links.forEach(function(d) {

            if (d.source.id == "Capital" || d.target.id == "Capital") {


                var direction = 1;

                if (d.target.id == "Capital") {
                    direction = -1;
                }

                var line = flowParts(d, direction);

                objectGlSet.push(line);
                VIS.glScene.add(line);
            }

        });

    }


    var material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        opacity: 0.9
    });

    var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, 0, 0);
    mesh.receiveShadow = true;


    objectGlSet.push(mesh);
    VIS.glScene.add(mesh);

    function flowParts(item, direction) {

        var origin = [item.source.x - VIS.map_length / 2,
                item.source.y - VIS.map_width / 2
            ],
            destination = [item.target.x - VIS.map_length / 2,
                item.target.y - VIS.map_width / 2
            ];

        var color = VIS.color(item.source.id);

        //var width = item.value;

        var width = 10;

        if (direction == 1) {
            color = "#dd5336"
        } else {
            color = "#288fdd"
        }

        var height = VIS.linerScaleValue2Z(migrationmatrix[item.source.index][item.target.index]);

        var spline = new THREE.CatmullRomCurve3(createCurveArray(origin, destination, 1, height * 2));


        var tubeGeometry = new THREE.TubeBufferGeometry(spline, 20, width, 8, false);


        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshLambertMaterial({ color: color }));

        mesh.doubleSided = true;

        return mesh;
    }

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

function initPointMap() {

    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");

            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            VIS.ctx.fillStyle = VIS.color(cityName);

            VIS.ctx.globalAlpha = 0.8;
            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }

    migrationmatrix.forEach(function(row, i) {

        row.forEach(function(cell, j) {


            if (cell) {

                if (citynameIndexMap[i] == "Capital") {
                    var mesh = getPiePiece(j, cell, 1);
                    objectGlSet.push(mesh);
                    VIS.glScene.add(mesh);
                } else if (citynameIndexMap[j] == "Capital") {
                    var mesh = getPiePiece(i, cell, -1);
                    objectGlSet.push(mesh);
                    VIS.glScene.add(mesh);
                }
            }
        });
    });

    function getPiePiece(posIndex, cell, direction) {


        var startAngle = 0,
            color;

        if (direction == 1) {
            color = "#dd5336";
            startAngle = 0;
        } else if (direction == -1) {
            color = "#288fdd";
            startAngle = Math.PI;
        }


        var radius = 80;

        var height = VIS.linerScaleValue2Z(cell);

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32,
            1, false, startAngle, Math.PI);
        geometry.rotateX(Math.PI / 2);


        var length = geometry.vertices.length;


        geometry.faces.push(new THREE.Face3(length - 2, length - 1, 0));
        geometry.faces.push(new THREE.Face3(0, length - 1, length / 2 - 1));

        geometry.faces.push(new THREE.Face3(length / 2 - 2, length - 3, length - 2));
        geometry.faces.push(new THREE.Face3(length - 3, length - 1, length - 2));


        geometry.computeVertexNormals();
        geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;

        var material = new THREE.MeshLambertMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        //cylinder.receiveShadow = true;

        var pos = VIS.PositionsOD[citynameIndexMap[posIndex]];
        cylinder.position.set(pos[0] + direction * 5, pos[1], height / 2);


        return cylinder;
    }

}

function init3DMatrixMap() {

    initCSSMaskUI();

    var citylistRank = citynameIndexMap.map(function(d) {

        //console.log(d, VIS.PositionsOD[d][1]);
        return {
            name: d,
            Y: VIS.PositionsOD[d][1]
        }

    });


    citylistRank.sort(function(x, y) {
        return d3.descending(x.Y, y.Y);
    })

    //console.log(citylistRank);
    createODMatrixWall();
    createMaps();

    function createODMatrixWall() {

        var posODPlane = [-VIS.map_width / 2, 0, VIS.map_width / 2];

        var cellWidth, cellHeight, cellPadding;
        var unit = 0.8 * VIS.map_width / migrationmatrix.length;
        cellWidth = cellHeight = unit * 0.8;
        cellPadding = unit * 0.2;

        //var matrixPos2d =[  posODPlane[0] - VIS.map_length/2 + (VIS.map_length - 0.8*VIS.map_width)/2 + unit/2,
        //    posODPlane[1] - VIS.map_width/2 + 0.1*VIS.map_width + unit/2];

        var matrixPos2d = [posODPlane[0] - VIS.map_length / 2 + (VIS.map_length - 0.8 * VIS.map_width) / 2 + unit / 2,
            posODPlane[1] - VIS.map_width / 2 + 0.1 * VIS.map_width + unit / 2
        ];


        var grids = getGrids();
        var basePlane = initODMatrxiPlane(posODPlane);


        objectGlSet.push(basePlane);
        VIS.glScene.add(basePlane);

        objectGlSet.push(grids);
        VIS.glScene.add(grids);

        createGridLabels();

        createLinks();


        function getGrids() {

            var group = new THREE.Group();

            group.name = "matrix_group";

            var color = "#288fdd";

            //console.log('citynameIndexMap',citynameIndexMap);

            citylistRank.forEach(function(rowName, j) {


                console.log(j, rowName.name, citynameIndexMap.indexOf(rowName.name))
                citylistRank.forEach(function(colName, i) {


                    var indexRow = citynameIndexMap.indexOf(rowName.name),
                        indexCol = citynameIndexMap.indexOf(colName.name);

                    //console.log(j, rowName.name,indexRow, i, colName.name,indexCol)


                    console.log(rowName.name, colName.name, migrationmatrix[indexRow][indexCol])

                    if (migrationmatrix[indexRow][indexCol]) {

                        var height = VIS.linerScaleValue2Z(migrationmatrix[indexRow][indexCol]);
                        //var material = new THREE.MeshBasicMaterial( {color: color} );

                        var material = new THREE.MeshLambertMaterial({ color: color });

                        var geometry = new THREE.BoxGeometry(cellWidth, cellHeight, height);
                        //var geometry = new THREE.BoxBufferGeometry( cellWidth, cellHeight, 0);

                        var cube = new THREE.Mesh(geometry, material);


                        cube.rotateX(Math.PI / 2);
                        cube.rotateY(Math.PI / 2);

                        cube.position.set(VIS.linerScaleValue2Z(migrationmatrix[indexRow][indexCol]) / 2 - VIS.map_width / 2,
                            VIS.map_width / 2 * 0.9 - i * unit - cellWidth,
                            VIS.map_width * 0.9 - j * unit - cellWidth / 2);


                        cube.name = i + "-" + j;
                        group.add(cube);

                    }


                })
            });


            return group;
        }


        function createLinks() {

            var group = new THREE.Group();


            citylistRank.forEach(function(d, i) {

                console.log(d.name);

                var posOnMap = VIS.PositionsOD[d.name],
                    posHeightOnMatrix = VIS.map_width * 0.9 - i * unit - cellWidth / 2,
                    posYonMatrix = VIS.map_width / 2 * 0.9 - i * unit - cellWidth;


                var color = VIS.color(d.name);
                var width = 10;


                linkOMapToMatrix();
                lineMatrixToDMap();

                function lineMatrixToDMap() {
                    var curve = new THREE.QuadraticBezierCurve3(
                        new THREE.Vector3(-VIS.map_width / 2, posYonMatrix, unit),
                        new THREE.Vector3(posOnMap[0], posOnMap[1], 0),
                        //interpoint,
                        new THREE.Vector3(posOnMap[0], posOnMap[1], 0)
                    );


                    var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

                    var mesh = new THREE.Mesh(tubeGeometry,
                        new THREE.MeshBasicMaterial({ color: color }));


                    mesh.doubleSided = true;

                    objectGlSet.push(mesh);
                    VIS.glScene.add(mesh);
                }


                function linkOMapToMatrix() {
                    var curve = new THREE.QuadraticBezierCurve3(
                        new THREE.Vector3(posOnMap[0], VIS.map_width / 2, posOnMap[1] + VIS.map_width / 2),
                        //interpoint,
                        new THREE.Vector3(posOnMap[0], VIS.map_width / 2, posOnMap[1] + VIS.map_width / 2),
                        new THREE.Vector3(-VIS.map_width / 2, VIS.map_width / 2 - unit, posHeightOnMatrix)
                    );


                    var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

                    var mesh = new THREE.Mesh(tubeGeometry,
                        new THREE.MeshBasicMaterial({ color: color }));


                    mesh.doubleSided = true;


                    objectGlSet.push(mesh);
                    VIS.glScene.add(mesh);
                }


            });


            //var meshS2T = flowParts(flow.source );
            //var meshT2S = flowParts(flow.target );

            //group.add( meshS2T );
            //group.add( meshT2S );
            return group;

            function flowParts(item) {

                var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
                    destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

                var color = VIS.color(citynameIndexMap[item.index]);
                var width = VIS.linerScaleWidth(item.value);

                //var interpoint =  getInterPoint();
                //console.log("interpoint", interpoint);

                var curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(origin[0], VIS.map_width / 2, origin[1] + VIS.map_width / 2),
                    //interpoint,
                    new THREE.Vector3(destination[0], destination[1], VIS.map_width / 2),
                    new THREE.Vector3(destination[0], destination[1], 1)
                );


                var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

                var mesh = new THREE.Mesh(tubeGeometry,
                    new THREE.MeshBasicMaterial({ color: color }));


                mesh.doubleSided = true;

                return mesh;

            }


        }


        function createGridLabels() {

            VIS.label_ctx.font = '30pt Arial';

            citylistRank.forEach(function(d, i) {
                //labels for rows
                VIS.label_ctx.fillStyle = "#2318ff";
                VIS.label_ctx.font = '30pt Arial';
                VIS.label_ctx.textAlign = "right";
                VIS.label_ctx.textBaseline = "middle";
                VIS.label_ctx.fillText(d.name,
                    0.2 * VIS.map_width - cellWidth,
                    (i + 1) * unit + 0.5 * cellWidth);

                VIS.label_ctx.rotate(Math.PI / 2);

                //labels for columns
                VIS.label_ctx.fillStyle = "#ff6324";
                VIS.label_ctx.font = '30pt Arial';
                VIS.label_ctx.textAlign = "left";
                VIS.label_ctx.textBaseline = "middle";
                VIS.label_ctx.fillText(d.name,
                    0.9 * VIS.map_width + cellPadding, -0.9 * VIS.map_width + i * unit - 0.5 * cellWidth);

                VIS.label_ctx.rotate(-Math.PI / 2)
            })


            VIS.label_ctx.font = '50pt Arial';
            VIS.label_ctx.fillStyle = "#2318ff";
            VIS.label_ctx.textAlign = "right";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText("Ogirins",
                0.2 * VIS.map_width - cellWidth,
                VIS.map_width - (0.1 * VIS.map_width - 0.5 * (cellWidth + cellPadding)));

            //labels for columns
            VIS.label_ctx.fillStyle = "#ff6324";
            VIS.label_ctx.fillText("Destinations",
                0.2 * VIS.map_width - cellWidth,
                VIS.map_width - (0.1 * VIS.map_width - 1.5 * (cellWidth + cellPadding)));


            // labels for sum
            VIS.label_ctx.fillStyle = "#000000";
            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "right";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText("Origin Sum",
                0.2 * VIS.map_width - cellWidth,
                VIS.map_width - (0.1 * VIS.map_width + (26 + 0.5) * (cellWidth + cellPadding)));

            VIS.label_ctx.rotate(Math.PI / 2);

            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "left";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText("Destination Sum",
                VIS.map_width - 0.1 * VIS.map_width + cellPadding,
                -0.2 * VIS.map_width - 26 * (cellWidth + cellPadding));

            VIS.label_ctx.rotate(-Math.PI / 2)


            VIS.labeltexture.needsUpdate = true;
        }

        function initODMatrxiPlane(posODMatrix) {

            var labelcanvas = document.createElement("CANVAS");

            labelcanvas.width = VIS.map_length;
            labelcanvas.height = VIS.map_width;
            var devicePixelRatio = 1;

            VIS.label_ctx = labelcanvas.getContext('2d');
            VIS.label_ctx.scale(devicePixelRatio, devicePixelRatio);

            VIS.labeltexture = new THREE.Texture(labelcanvas);

            var canvas_material = new THREE.MeshBasicMaterial({
                map: VIS.labeltexture,
                side: THREE.DoubleSide,
                opacity: 0.9
            });

            var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
            var mesh = new THREE.Mesh(geometry, canvas_material);


            mesh.rotateX(Math.PI / 2);
            mesh.rotateY(Math.PI / 2);
            mesh.position.set(posODMatrix[0], posODMatrix[1], posODMatrix[2]);


            mesh.receiveShadow = true;

            return mesh;

        }

    }


    function createMaps() {

        var path = d3.geoPath().projection(VIS.projection);

        var group = new THREE.Group();

        group.name = "group_glmap";

        dataIcelandGeoForGl.forEach(function(d, i) {

            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            var indexthisCity = citynameIndexMap.indexOf(cityName);

            var feature = path(d);

            var shape = transformSVGPath(feature);

            var height = VIS.linerScaleValue2Z(d3.sum(migrationmatrix[indexthisCity]));

            var extrudeSettings = {
                steps: 2,
                depth: 1,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 1
            };

            var color = d3.hsl(VIS.color(cityName));
            color.s = color.s * 0.4;
            color.l = color.l * 0.8;
            color = color.darker(0.8);
            var material = new THREE.MeshLambertMaterial({ color: color.hex(), transparent: true, opacity: 0.6 });


            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, 1);

            group.add(mesh);


            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);
            geometry.rotateX(Math.PI / 2);

            //var color = VIS.color(cityName);
            //var color = d3.color(VIS.color(cityName));
            //var material = new THREE.MeshLambertMaterial( { color: color.hex(), transparent:true, opacity:0.6} );

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, VIS.map_width);

            group.add(mesh);

        });


        objectGlSet.push(group);
        VIS.glScene.add(group);
    }
}

function initFlowSankeyMap() {


    initCSSMaskUI();
    initCSSMap();

    dataChord.forEach(function(flow, flow_index) {

        var flow = getMeshFromFlow(flow, 'SHOW_ALL_FLOWS', flow_index);
        objectGlSet.push(flow);
        VIS.glScene.add(flow);

    });
    VIS.texture.needsUpdate = true;

}

function initFlowMapDoubleO() {

    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");

            if (index != -1) {
                cityName = cityName.substr(0, index);
            }


            console.log(cityName);
            VIS.ctx.fillStyle = VIS.color(cityName);

            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }

    /*
    initCSSMaskUI();

    createMaps();
    */


    dataChord.forEach(function(flow) {

        var flow = getMeshFromFlow(flow);
        objectGlSet.push(flow);
        VIS.glScene.add(flow);

    });

    function createMaps() {

        var path = d3.geoPath().projection(VIS.projection);

        var group = new THREE.Group();

        group.name = "group_glmap";

        dataIcelandGeoForGl.forEach(function(d, i) {

            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            var indexthisCity = citynameIndexMap.indexOf(cityName);

            var feature = path(d);

            var shape = transformSVGPath(feature);

            var height = VIS.linerScaleValue2Z(d3.sum(migrationmatrix[indexthisCity]));

            var extrudeSettings = {
                steps: 2,
                depth: 1,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 1
            };

            var color = d3.hsl(VIS.color(cityName));
            color.s = color.s * 0.4;
            color.l = color.l * 0.8;
            color = color.darker(0.8);
            var material = new THREE.MeshLambertMaterial({ color: color.hex(), transparent: true, opacity: 0.6 });


            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, 1);

            group.add(mesh);


            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);
            geometry.rotateX(Math.PI / 2);

            //var color = VIS.color(cityName);
            //var color = d3.color(VIS.color(cityName));
            //var material = new THREE.MeshLambertMaterial( { color: color.hex(), transparent:true, opacity:0.6} );

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, VIS.map_width);

            group.add(mesh);

        });


        objectGlSet.push(group);
        VIS.glScene.add(group);
    }

}

function initFlowMapDoubleP() {

    initCSSMaskUI();

    createMaps();


    dataChord.forEach(function(flow) {

        var flow = getMeshFromFlow(flow);
        objectGlSet.push(flow);
        VIS.glScene.add(flow);

    });

    function createMaps() {

        var path = d3.geoPath().projection(VIS.projection);

        var group = new THREE.Group();

        group.name = "group_glmap";

        dataIcelandGeoForGl.forEach(function(d, i) {

            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            var indexthisCity = citynameIndexMap.indexOf(cityName);

            var feature = path(d);

            var shape = transformSVGPath(feature);

            var height = VIS.linerScaleValue2Z(d3.sum(migrationmatrix[indexthisCity]));

            var extrudeSettings = {
                steps: 2,
                depth: 1,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 1
            };

            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);

            //var color = VIS.color(cityName);


            var color = d3.hsl(VIS.color(cityName));


            color.s = color.s * 0.4;
            color.l = color.l * 0.8;
            color = color.darker(0.8);

            var material = new THREE.MeshLambertMaterial({ color: color.hex(), transparent: true, opacity: 0.6 });

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, 1);

            group.add(mesh);


            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);

            //var color = VIS.color(cityName);
            //var color = d3.color(VIS.color(cityName));
            //var material = new THREE.MeshLambertMaterial( { color: color.hex(), transparent:true, opacity:0.6} );

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, VIS.map_height);

            group.add(mesh);

        });


        objectGlSet.push(group);
        VIS.glScene.add(group);
    }

}

// NS3 to GS3-1
function initSymbolMapPie() {
    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            //console.log(cityName)

            VIS.ctx.fillStyle = VIS.color(cityName);
            VIS.ctx.globalAlpha = 0.9;

            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }


    migrationmatrix.forEach(function(row, i) {

        row.forEach(function(cell, j) {

            var mesh = getPiePiece(i, j, cell);
            objectGlSet.push(mesh);
            VIS.glScene.add(mesh);
        });
    });

    function getPiePiece(rowIndex, columnIndex, cell) {

        var startAngle = columnIndex * Math.PI / 4;

        var color = VIS.color(columnIndex);
        var radius = 80;


        var height = VIS.linerScaleValue2Z(cell);

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32,
            1, false, startAngle, Math.PI / 4);
        geometry.rotateX(Math.PI / 2);


        var length = geometry.vertices.length;


        geometry.faces.push(new THREE.Face3(length - 2, length - 1, 0));
        geometry.faces.push(new THREE.Face3(0, length - 1, length / 2 - 1));

        geometry.faces.push(new THREE.Face3(length / 2 - 2, length - 3, length - 2));
        geometry.faces.push(new THREE.Face3(length - 3, length - 1, length - 2));

        geometry.computeVertexNormals();
        geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;

        var material = new THREE.MeshLambertMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        //cylinder.receiveShadow = true;

        var pos = VIS.PositionsOD[citynameIndexMap[rowIndex]];
        cylinder.position.set(pos[0], pos[1], height / 2);

        return cylinder;
    }

}

function initSymbolMapPie2() {
    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");

            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            VIS.ctx.fillStyle = VIS.color(cityName);

            VIS.ctx.globalAlpha = 0.8;
            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }


    migrationmatrix.forEach(function(row, i) {


        var geometry = new THREE.CylinderGeometry(5, 5, 600, 32, 1);
        geometry.rotateX(Math.PI / 2);
        //var material = new THREE.MeshLambertMaterial( {color: VIS.color(i)} );

        var material = new THREE.MeshLambertMaterial({ color: "#000000" });
        var cylinder = new THREE.Mesh(geometry, material);
        var pos = VIS.PositionsOD[citynameIndexMap[i]];
        cylinder.position.set(pos[0], pos[1], 300);
        objectGlSet.push(cylinder);
        VIS.glScene.add(cylinder);


        row.forEach(function(cell, j) {

            if (i !== j) {
                var mesh = getPiePiece(i, j, cell, 1);
                objectGlSet.push(mesh);
                VIS.glScene.add(mesh);

                var mesh = getPiePiece(j, i, cell, -1);
                objectGlSet.push(mesh);
                VIS.glScene.add(mesh);
            }
        });


    });

    function getPiePiece(rowIndex, columnIndex, cell, direction) {


        var startAngle = columnIndex * Math.PI / 4;
        var color = VIS.color(columnIndex);
        var radius = 80;
        var height = VIS.linerScaleValue2Z(cell);

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32,
            1, false, startAngle, Math.PI / 4);
        geometry.rotateX(Math.PI / 2);
        var length = geometry.vertices.length;


        geometry.faces.push(new THREE.Face3(length - 2, length - 1, 0));
        geometry.faces.push(new THREE.Face3(0, length - 1, length / 2 - 1));

        geometry.faces.push(new THREE.Face3(length / 2 - 2, length - 3, length - 2));
        geometry.faces.push(new THREE.Face3(length - 3, length - 1, length - 2));

        geometry.computeVertexNormals();
        geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;

        var material = new THREE.MeshLambertMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        //cylinder.receiveShadow = true;

        var pos = VIS.PositionsOD[citynameIndexMap[rowIndex]];
        cylinder.position.set(pos[0], pos[1], height / 2 * direction + 400);


        return cylinder;
    }

}

function initSymbolMapPie3() {
    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            //console.log(cityName)

            VIS.ctx.fillStyle = VIS.color(cityName);
            VIS.ctx.globalAlpha = 0.9;

            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }

    migrationmatrix.forEach(function(row, i) {

        row.forEach(function(cell, j) {

            if (i != j) {


                var height1 = VIS.linerScaleValue2Z(migrationmatrix[i][j]);
                var height2 = VIS.linerScaleValue2Z(migrationmatrix[j][i]);


                //console.log( citynameIndexMap[i],'to', citynameIndexMap[j],height1,height2 );

                var mesh = getPieNew(i, j, height1, 1);
                objectGlSet.push(mesh);
                VIS.glScene.add(mesh);


                var mesh = getPieNew(i, j, height2, -1);
                objectGlSet.push(mesh);
                VIS.glScene.add(mesh);
            }


        });


    });


    function getPieNew(rowIndex, columnIndex, height, direction) {

        var color = VIS.color(columnIndex);
        var pos = VIS.PositionsOD[citynameIndexMap[rowIndex]];

        if (direction == 1) {
            color = VIS.color(rowIndex)
        }

        var path = new THREE.LineCurve3(
            new THREE.Vector3(pos[0], pos[1], 0),
            new THREE.Vector3(pos[0], pos[1], height)
        );

        var extrudeSettings = {
            steps: 20,
            bevelEnabled: false,
            extrudePath: path
        };

        var startAngle = columnIndex * Math.PI / 4;
        var endAngle = startAngle + Math.PI / 4 - 0.1;
        var radius = 60 - direction * 10;


        var shape = new THREE.Shape();
        shape.arc(0, 0, radius, startAngle, endAngle);
        //shape.moveTo(0,0);

        var shape2 = new THREE.Shape();
        shape2.arc(0, 0, radius + 20, endAngle, startAngle, true);

        shape.add(shape2);


        var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        var mesh = new THREE.Mesh(geometry,
            new THREE.MeshLambertMaterial({
                color: color
            }));

        return mesh;
    }

    function getPiePiece(rowIndex, columnIndex, cell, direction) {


        var startAngle = columnIndex * Math.PI / 4;

        var color = VIS.color(columnIndex);
        var radius = 80 - direction * 10;


        if (direction == 1) {
            color = VIS.color(rowIndex);
        }

        var height = VIS.linerScaleValue2Z(cell);

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32,
            1, false, startAngle, Math.PI / 4);
        geometry.rotateX(Math.PI / 2);


        var length = geometry.vertices.length;


        geometry.faces.push(new THREE.Face3(length - 2, length - 1, 0));
        geometry.faces.push(new THREE.Face3(0, length - 1, length / 2 - 1));

        geometry.faces.push(new THREE.Face3(length / 2 - 2, length - 3, length - 2));
        geometry.faces.push(new THREE.Face3(length - 3, length - 1, length - 2));


        geometry.computeVertexNormals();
        geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;

        var material = new THREE.MeshLambertMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        //cylinder.receiveShadow = true;

        var pos = VIS.PositionsOD[citynameIndexMap[rowIndex]];
        cylinder.position.set(pos[0], pos[1], height / 2);


        return cylinder;
    }

}

function initSymbolMapGeo() {
    initCSSMaskUI();
    //initCSSMap();

    var path = d3.geoPath().projection(VIS.projection);

    var group = new THREE.Group();

    group.name = "group_glmap";


    var projectionSmall = d3.geoStereographic().scale(4000)
        .center(VIS.icelandCenter)
        .translate([VIS.map_length / 2, VIS.map_width / 2]);;
    var pathSmall = d3.geoPath().projection(projectionSmall);


    dataIcelandGeoForGl.forEach(function(d, i) {

        var cityName = d.properties.VARNAME_1;
        var index = cityName.indexOf("|");


        if (index != -1) {
            cityName = cityName.substr(0, index);
        }

        var indexthisCity = citynameIndexMap.indexOf(cityName);

        var feature = path(d);

        var shape = transformSVGPath(feature);

        var height = VIS.linerScaleValue2Z(d3.sum(migrationmatrix[indexthisCity]));

        var extrudeSettings = {
            steps: 2,
            depth: height,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1
        };

        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(Math.PI);

        var color = VIS.color(cityName);

        var material = new THREE.MeshLambertMaterial({ color: color });

        var mesh = new THREE.Mesh(geometry, material);

        mesh.name = cityName;

        mesh.position.set(-VIS.map_length / 2, VIS.map_width / 2, height);

        group.add(mesh);
    });


    objectGlSet.push(group);
    VIS.glScene.add(group);


    citynameIndexMap.forEach(function(name, j) {

        var pos = VIS.PositionsOD[name];

        var height = VIS.linerScaleValue2Z(d3.sum(migrationmatrix[j]));


        dataIcelandGeoForGl.forEach(function(d, i) {

            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            var indexthisCity = citynameIndexMap.indexOf(cityName);

            var feature = pathSmall(d);

            var shape = transformSVGPath(feature);

            var height_t = VIS.linerScaleValue2Z(migrationmatrix[j][indexthisCity]);

            var extrudeSettings = {
                steps: 2,
                depth: height_t,
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 1
            };

            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.rotateX(Math.PI);

            var color = VIS.color(cityName);

            var material = new THREE.MeshLambertMaterial({ color: color });

            var mesh = new THREE.Mesh(geometry, material);

            mesh.name = cityName;

            mesh.position.set(pos[0] - VIS.map_length / 2, pos[1] + VIS.map_width / 2, height + height_t);

            group.add(mesh);
        });


        objectGlSet.push(group);
        VIS.glScene.add(group);


    })

}

// basic type
function initFlowMap() {

    initCSSMaskUI();
    initCSSMap();

    updateTexture();

    function updateTexture() {

        var path = d3.geoPath().projection(VIS.projection).context(VIS.ctx);
        dataIcelandGeo.forEach(function(d) {
            var cityName = d.properties.VARNAME_1;
            var index = cityName.indexOf("|");


            if (index != -1) {
                cityName = cityName.substr(0, index);
            }

            //console.log(cityName)

            VIS.ctx.fillStyle = VIS.color(cityName);
            VIS.ctx.globalAlpha = 0.9;

            VIS.ctx.beginPath();
            path(d);
            VIS.ctx.fill();
            VIS.ctx.stroke();
        });


        VIS.texture.needsUpdate = true;
    }


    dataChord.forEach(function(flow, flow_index) {

        if (flow.source.index == citynameIndexMap.indexOf("Capital") || flow.source.subindex == citynameIndexMap.indexOf("Capital")) {
            var flow = getMeshFromFlow(flow, 'Capital', citynameIndexMap.indexOf("Capital"));

            objectGlSet.push(flow);
            VIS.glScene.add(flow);
        }

    });

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


function initNet3D() {

    var nodesPos = [
        [500, 500, 500],
        [-500, 500, 500],
        [-500, -500, 500],
        [500, -500, 500],
        [500, 500, -500],
        [-500, 500, -500],
        [-500, -500, -500],
        [500, -500, -500]
    ];

    dataChord.groups.forEach(function(d) {

        var pos = nodesPos[d.index];

        var geometry = new THREE.SphereBufferGeometry(50, 32, 32);
        var material = new THREE.MeshLambertMaterial({ color: VIS.color(d.index) });
        var sphere = new THREE.Mesh(geometry, material);

        sphere.position.set(pos[0], pos[1], pos[2]);
        objectGlSet.push(sphere);
        VIS.glScene.add(sphere);

    });

    dataChord.forEach(function(flow) {


        var flowS2T = halfFlowMesh(flow.source);
        var flowT2S = halfFlowMesh(flow.target);

        objectGlSet.push(flowS2T);
        VIS.glScene.add(flowS2T);

        objectGlSet.push(flowT2S);
        VIS.glScene.add(flowT2S);

    });

    function halfFlowMesh(item) {

        var origin = nodesPos[item.index];
        var destination = nodesPos[item.subindex];


        var flowWidth = VIS.linerScaleWidth(item.value);

        var curve = new THREE.LineCurve3(
            new THREE.Vector3(origin[0], origin[1], origin[2]),
            new THREE.Vector3((origin[0] + destination[0]) / 2,
                (origin[1] + destination[1]) / 2,
                (origin[2] + destination[2]) / 2)
        );


        var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, flowWidth, 8, false);


        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshLambertMaterial({ color: VIS.color(item.index) }));


        mesh.doubleSided = true;

        return mesh;
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

function initCSSMap2ndP() {


    var face2nd = getTexturedMesh();
    objectGlSet.push(face2nd)
    VIS.glScene.add(face2nd);

    function getTexturedMesh() {

        var canvas_material = new THREE.MeshBasicMaterial({
            map: VIS.texture,
            side: THREE.DoubleSide,
            opacity: 0.9
        });

        var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
        //geometry.rotateX(Math.PI/2);
        var mesh = new THREE.Mesh(geometry, canvas_material);


        //mesh.position.set(0,VIS.map_width/2,VIS.map_width/2);
        mesh.position.set(0, 0, 1500);
        mesh.receiveShadow = true;
        mesh.name = "secondFace";
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

function initBaseMap2nd() {

    VIS.glScene.add(getTexturedMesh());

    function getTexturedMesh() {
        var canvas_material = new THREE.MeshBasicMaterial({
            map: VIS.texture,
            side: THREE.DoubleSide,
            opacity: 0.9
        });

        var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
        geometry.rotateX(Math.PI / 2);
        var mesh = new THREE.Mesh(geometry, canvas_material);


        mesh.position.set(0, VIS.map_width / 2, VIS.map_width / 2);
        mesh.receiveShadow = true;
        mesh.name = "secondFace";
        return mesh;
    }

}

function initODTriangle() {

    var posODPlane = [-VIS.map_length - 20, 0, 0];

    var cellWidth, cellHeight, cellPadding;
    var unit = 0.8 * VIS.map_width / citynameIndexMap.length;
    cellWidth = cellHeight = unit * 0.8;
    cellPadding = unit * 0.2;

    var matrixPos2d = [posODPlane[0] - VIS.map_length / 2 + (VIS.map_length - 0.8 * VIS.map_width) / 2 + unit / 2,
        posODPlane[1] - VIS.map_width / 2 + 0.1 * VIS.map_width + unit / 2
    ];

    VIS.glScene.add(initODMatrxiPlane(posODPlane));
    VIS.glScene.add(getGrids());
    createGridLabels();

    function getGrids() {

        var group = new THREE.Group();

        group.name = "triangle_group";

        for (var i = 0; i < 25; i++) {

            for (var j = 0; j < i; j++) {
                var cellO = migrationmatrix[i][j];

                if (cellO) {

                    var color = VIS.color(i);
                    var height = VIS.linerScaleValue2Z(cellO);
                    var material = new THREE.MeshBasicMaterial({ color: color });

                    var shape = new THREE.Shape();
                    shape.moveTo(-0.5 * cellWidth, -0.5 * cellWidth);
                    shape.lineTo(0.5 * cellWidth, 0.5 * cellWidth);
                    shape.lineTo(-0.5 * cellWidth, 0.5 * cellWidth);
                    shape.lineTo(-0.5 * cellWidth, -0.5 * cellWidth);

                    var extrudeSettings = {
                        steps: 1,
                        depth: height,
                        bevelEnabled: false
                    };


                    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                    var mesh = new THREE.Mesh(geometry, material);

                    mesh.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                        matrixPos2d[1] + i * (cellWidth + cellPadding),
                        0);
                    mesh.name = i + "-" + j;

                    group.add(mesh);

                }


                var cellD = migrationmatrix[j][i];

                if (cellD) {

                    var color = VIS.color(j);
                    var height = VIS.linerScaleValue2Z(cellD);
                    var material = new THREE.MeshBasicMaterial({ color: color });

                    var shape = new THREE.Shape();
                    shape.moveTo(0.5 * cellWidth, 0.5 * cellWidth);
                    shape.lineTo(-0.5 * cellWidth, -0.5 * cellWidth);
                    shape.lineTo(0.5 * cellWidth, -0.5 * cellWidth);
                    shape.lineTo(0.5 * cellWidth, 0.5 * cellWidth);

                    var extrudeSettings = {
                        steps: 1,
                        depth: height,
                        bevelEnabled: false
                    };

                    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    //var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );

                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(matrixPos2d[0] + j * (cellWidth + cellPadding),
                        matrixPos2d[1] + i * (cellWidth + cellPadding),
                        0);

                    mesh.name = j + "-" + i;

                    group.add(mesh);

                }

            }
        }

        return group;
    }

    function createGridLabels() {

        VIS.label_ctx.font = '30pt Arial';

        citynameIndexMap.forEach(function(d, i) {

            //labels for rows
            VIS.label_ctx.fillStyle = "#2318ff";
            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "right";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText(d,
                0.2 * VIS.map_width - cellWidth,
                VIS.map_width - (0.1 * VIS.map_width + (i + 0.5) * (cellWidth + cellPadding)));

            VIS.label_ctx.rotate(Math.PI / 2);

            //labels for columns
            VIS.label_ctx.fillStyle = "#ff6324";
            VIS.label_ctx.font = '30pt Arial';
            VIS.label_ctx.textAlign = "left";
            VIS.label_ctx.textBaseline = "middle";
            VIS.label_ctx.fillText(d,
                VIS.map_width - 0.1 * VIS.map_width + cellPadding,
                -0.2 * VIS.map_width - i * (cellWidth + cellPadding));

            VIS.label_ctx.rotate(-Math.PI / 2)
        });

        //
        //labels for rows title


        VIS.label_ctx.font = '50pt Arial';
        VIS.label_ctx.fillStyle = "#2318ff";
        VIS.label_ctx.textAlign = "right";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Origin",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width - 0.5 * (cellWidth + cellPadding)));

        //labels for columns
        VIS.label_ctx.fillStyle = "#ff6324";
        VIS.label_ctx.fillText("Destinations",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width - 1.5 * (cellWidth + cellPadding)));


        // labels for sum
        VIS.label_ctx.fillStyle = "#000000";
        VIS.label_ctx.font = '30pt Arial';
        VIS.label_ctx.textAlign = "right";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Origin Sum",
            0.2 * VIS.map_width - cellWidth,
            VIS.map_width - (0.1 * VIS.map_width + (26 + 0.5) * (cellWidth + cellPadding)));

        VIS.label_ctx.rotate(Math.PI / 2);

        VIS.label_ctx.font = '30pt Arial';
        VIS.label_ctx.textAlign = "left";
        VIS.label_ctx.textBaseline = "middle";
        VIS.label_ctx.fillText("Destination Sum",
            VIS.map_width - 0.1 * VIS.map_width + cellPadding,
            -0.2 * VIS.map_width - 26 * (cellWidth + cellPadding));

        VIS.label_ctx.rotate(-Math.PI / 2)


        VIS.labeltexture.needsUpdate = true;
    }

    function initODMatrxiPlane(posODMatrix) {

        var labelcanvas = document.createElement("CANVAS");

        labelcanvas.width = VIS.map_length;
        labelcanvas.height = VIS.map_width;
        var devicePixelRatio = 1;

        VIS.label_ctx = labelcanvas.getContext('2d');
        VIS.label_ctx.scale(devicePixelRatio, devicePixelRatio);

        VIS.labeltexture = new THREE.Texture(labelcanvas);

        var canvas_material = new THREE.MeshBasicMaterial({
            map: VIS.labeltexture,
            side: THREE.DoubleSide,
            opacity: 0.9
        });

        var geometry = new THREE.PlaneGeometry(VIS.map_length, VIS.map_width);
        var mesh = new THREE.Mesh(geometry, canvas_material);

        mesh.position.set(posODMatrix[0], posODMatrix[1], posODMatrix[2]);
        mesh.receiveShadow = true;

        return mesh;

    }

}

function updateFlowMap(selectedCity) {

    if ($('input[name="layercontrol"]:checked').val() == 'wall') {
        if (cylinderODSet.length < 2) {
            console.log("create ODs");
            var ODs = createCylinderOD();
            cylinderODSet.push(ODs);
            VIS.glScene.add(ODs);
        } else {
            console.log("cylinderODSet.length", cylinderODSet.length, cylinderODSet);
            console.log("ODs already exist");
        }
    } else {
        cylinderODSet.forEach(function(d) {
            if (d.type === "Group") {
                d.children.forEach(function(t) {
                    t.material.dispose();
                    t.geometry.dispose();
                });
                for (let i = d.children.length - 1; i >= 0; i--) {
                    d.remove(d.children[i]);
                }
            }
            VIS.glScene.remove(d);
        });
    }

    if ($('input[name="layercontrol"]:checked').val() == 'barChartFlowMap') {
        if (barODSet.length < 2) {
            var ODs = createBarsOD();
            barODSet.push(ODs);
            VIS.glScene.add(ODs);
        } else {

        }
    } else {
        barODSet.forEach(function(d) {
            if (d.type === "Group") {
                d.children.forEach(function(t) {
                    t.material.dispose();
                    t.geometry.dispose();
                });
                for (let i = d.children.length - 1; i >= 0; i--) {
                    d.remove(d.children[i]);
                }
            }
            VIS.glScene.remove(d);
        });
    }

    if ($('input[name="layercontrol"]:checked').val() == 'pieChartFlowMap') {
        if (pieODSet.length < 2) {
            var ODs = createPiesOD();
            pieODSet.push(ODs);
            VIS.glScene.add(ODs);
        } else {

        }
    } else {
        pieODSet.forEach(function(d) {
            if (d.type === "Group") {
                d.children.forEach(function(t) {
                    t.material.dispose();
                    t.geometry.dispose();
                });
                for (let i = d.children.length - 1; i >= 0; i--) {
                    d.remove(d.children[i]);
                }
            }
            VIS.glScene.remove(d);
        });
    }

    if ($('input[name="layercontrol"]:checked').val() == 'doubleFaces' ||
        $('input[name="layercontrol"]:checked').val() == 'doubleFacesV2' ||
        $('input[name="layercontrol"]:checked').val() == 'doubleFacesV3') {

        var face2nd = VIS.glScene.getObjectByName("secondFace");

        if (face2nd) {
            face2nd.visible = true;
        } else {
            initBaseMap2nd();
        }

    } else {

        var face2nd = VIS.glScene.getObjectByName("secondFace");

        if (face2nd) {
            face2nd.visible = false;
        }

    }

    if ($('input[name="layercontrol"]:checked').val() == 'flowGroupDirection') {
        if (cylinderODSet.length < 2) {
            var ODs = createBarsODDouble();
            cylinderODSetForGroupDirection.push(ODs);
            VIS.glScene.add(ODs);
        } else {
            console.log("cylinderODSet.length", cylinderODSet.length, cylinderODSet);
            console.log("ODs already exist");
        }
    } else {
        cylinderODSetForGroupDirection.forEach(function(d) {
            if (d.type === "Group") {
                d.children.forEach(function(t) {
                    t.material.dispose();
                    t.geometry.dispose();
                });
                for (let i = d.children.length - 1; i >= 0; i--) {
                    d.remove(d.children[i]);
                }
            }
            VIS.glScene.remove(d);
        });
        cylinderODSetForGroupDirection = [];
    }

    if ($('input[name="layercontrol"]:checked').val() == 'flowGroupNode') {
        if (cylinderODSet.length < 2) {
            var ODs = createBarsODDoubleNode();
            cylinderODSetForGroupNode.push(ODs);
            VIS.glScene.add(ODs);
        } else {
            console.log("cylinderODSet.length", cylinderODSet.length, cylinderODSet);
            console.log("ODs already exist");
        }
    } else {
        cylinderODSetForGroupNode.forEach(function(d) {
            if (d.type === "Group") {
                d.children.forEach(function(t) {
                    t.material.dispose();
                    t.geometry.dispose();
                });
                for (let i = d.children.length - 1; i >= 0; i--) {
                    d.remove(d.children[i]);
                }
            }
            VIS.glScene.remove(d);
        });
        cylinderODSetForGroupNode = [];
    }


    updateODPosition(selectedCity);
    updateTexture(selectedCity);
    updateFlows(selectedCity);
    //updateMatrix(selectedCity);
    //updateTriangle(selectedCity);

    function updateODPosition(selectedCity) {

        //console.log("curr", citySelectedCurr, "selected",selectedCity);

        //console.log(selectedCity);
        var height = 5;

        var glMapCitiesGroup = VIS.glScene.getObjectByName("group_glmap");

    }

    function updateTexture(selectedCity) {

        console.log("updateTexture");

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

    function updateMatrix(selectedCity) {

        VIS.tweenODMatrixGroup.removeAll();

        VIS.glScene.getObjectByName("matrix_group").children
            .forEach(function(cellMesh) {

                var str = cellMesh.name.split('-');
                var rowIndex = parseInt(str[0]),
                    colIndex = parseInt(str[1]);

                if (selectedCity == "ALL") {

                    var height = VIS.linerScaleValue2Z(migrationmatrix[rowIndex][colIndex]);

                    meshGrowUp(cellMesh,
                        height,
                        VIS.color(citynameIndexMap[rowIndex]));

                } else {

                    var height = VIS.linerScaleValue2Z(migrationmatrix[rowIndex][colIndex]);


                    if (rowIndex == citynameIndexMap.indexOf(selectedCity)) {
                        meshGrowUp(cellMesh, height, VIS.color(citynameIndexMap[colIndex]));

                    } else if (colIndex == citynameIndexMap.indexOf(selectedCity)) {
                        meshGrowUp(cellMesh, height, VIS.color(citynameIndexMap[rowIndex]));

                    } else {
                        meshGropDown(cellMesh, height, VIS.color(citynameIndexMap[rowIndex]));
                    }
                }


            });


        function meshGrowUp(mesh, height, color) {

            var x = mesh.position.x;
            var y = mesh.position.y;

            mesh.material.setValues({ color: color });
            mesh.material.needsUpdate = true;

            if (mesh.position.z == 0) {

                var timer = { x: 0 };

                var tween = new TWEEN.Tween(timer, VIS.tweenODMatrixGroup)
                    .to({ x: 1 }, 2000)
                    .onUpdate(function() {

                        mesh.geometry.vertices.forEach(function(d, i) {

                            if (i == 0 || i == 2 || i == 5 || i == 7) {

                                d.z = timer.x * height / 2;
                            } else {
                                d.z = -1 * timer.x * height / 2;
                            }
                        });

                        mesh.geometry.verticesNeedUpdate = true;
                        mesh.position.set(x, y, height / 2 * timer.x);

                    })
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .start();

            }


        }


        function meshGropDown(mesh, height, color) {

            var x = mesh.position.x;
            var y = mesh.position.y;
            var z = mesh.position.z;


            var timer = { x: 1 };

            var tween = new TWEEN.Tween(timer, VIS.tweenODMatrixGroup)
                .to({ x: 0 }, 1000)
                .onUpdate(function() {

                    mesh.geometry.vertices.forEach(function(d, i) {

                        if (i == 0 || i == 2 || i == 5 || i == 7) {

                            d.z = timer.x * height / 2;
                        } else {
                            d.z = -1 * timer.x * height / 2;
                        }

                    })

                    mesh.geometry.verticesNeedUpdate = true;
                    mesh.position.set(x, y, z * timer.x);
                    if (timer.x == 0) {
                        mesh.material.setValues({ color: "#ffffff" });
                        //cellMesh.material.setValues({color: VIS.color(dataOveriFlow.cities[rowIndex])});
                        mesh.material.needsUpdate = true;
                    }

                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();


        }


    }

    function updateTriangle(selectedCity) {

        VIS.tweenODTriangleGroup.removeAll();

        VIS.glScene.getObjectByName("triangle_group").children
            .forEach(function(cellMesh) {

                var str = cellMesh.name.split('-');
                var rowIndex = parseInt(str[0]),
                    colIndex = parseInt(str[1]);

                if (selectedCity == "ALL") {

                    var height = VIS.linerScaleValue2Z(dataOveriFlow.matrix[rowIndex][colIndex]);

                    meshGrowUp(cellMesh,
                        height,
                        VIS.color(dataOveriFlow.cities[rowIndex]));

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

            mesh.material.setValues({ color: color });
            mesh.material.needsUpdate = true;

            var timer = { x: 0 };

            if (mesh.geometry.vertices[3].z == 0) {
                var tween = new TWEEN.Tween(timer, VIS.tweenODTriangleGroup)
                    .to({ x: 1 }, 1000)
                    .onUpdate(function() {
                        mesh.geometry.vertices.forEach(function(d, i) {
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


        function meshGropDown(mesh, height, color) {

            var timer = { x: 1 };

            var tween = new TWEEN.Tween(timer, VIS.tweenODTriangleGroup)
                .to({ x: 0 }, 1000)
                .onUpdate(function() {
                    mesh.geometry.vertices.forEach(function(d, i) {

                        if (i > 2) {
                            d.z = timer.x * height;
                        }
                    })

                    mesh.geometry.verticesNeedUpdate = true;
                    if (timer.x == 0) {
                        mesh.material.setValues({ color: "#ffffff" });
                        //cellMesh.material.setValues({color: VIS.color(dataOveriFlow.cities[rowIndex])});
                        mesh.material.needsUpdate = true;
                    }

                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }


    }
}

function updateFlows(selectedCity) {

    if (selectedCity === "ALL") {
        draw3DFlows(SHOW_ALL_FLOWS);
    } else {
        draw3DFlows(dataOveriFlow.cities.indexOf(selectedCity));
    }

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

function draw3DFlows(choosen_index) {

    flowsSet.forEach(function(d) {
        if (d.type === "Group") {

            d.children.forEach(function(t) {
                t.material.dispose();
                t.geometry.dispose();
            });
            for (let i = d.children.length - 1; i >= 0; i--) {
                d.remove(d.children[i]);
            }
        }
        VIS.glScene.remove(d);

    });


    dataChord.forEach(function(flow, flow_index) {

        if (choosen_index === SHOW_ALL_FLOWS) {
            var flow = getMeshFromFlow(flow, choosen_index, flow_index);
            flowsSet.push(flow);
            VIS.glScene.add(flow);

        } else if (flow.source.index === choosen_index || flow.target.index === choosen_index) {
            var flow = getMeshFromFlow(flow, choosen_index, flow_index);
            flowsSet.push(flow);
            VIS.glScene.add(flow);
        }

    })

    update();

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



var ii = 0;

function updatePrismMap() {

    console.log(clock);


    var mesh = VIS.glScene.getObjectByName("group_map").children[21];

   

      if (ii <1) {
                console.log(mesh.geometry.vertices.map(d=>d.z));
            }


        ii++;

/*

    VIS.glScene.getObjectByName("group_map").children
        .forEach(function(cellMesh) {


          



        });




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