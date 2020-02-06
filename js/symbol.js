/**
 * Created by Aero on 24/11/2018.
 */

function getMeshFromFlow(flow, choosen_index, flow_index, typeOf3DFlow) {


    var typeOf3DFlow = $('input[name="layercontrol"]:checked').val();

    //typeOf3DFlow = "tube";

    switch (typeOf3DFlow) {
        case 'line':
            return createSemiCircle(flow);

            break;

        case 'flow-map':
            //return createSemiCircleTubes(flow, choosen_index);
            //return createFlowBilateral(flow);
            return createFlowBilateral_3DHeight(flow);
            break;

        case 'flowmap-double-parallel':
            return createFlowBetweenTwoFacesP(flow, choosen_index);
            break;

        case 'flowmap-double-orthogonal':
            return createFlowBetweenTwoFacesO(flow, choosen_index);
            break;

        case 'sankey-map':
            return createFlowSankey(flow, flow_index);
            break;
        case 'sankey-map-2':
            return createFlowNodeGrouped(flow, flow_index);
            break;
        case 'sankey-map-3':
            return createFlowDirectionGrouped(flow, flow_index);
            break;

            /*

    case '3Dheight':
        return createTubes3DHeight(flow);
        break;

    case 'wall':
        return createFlowWall(flow);
        break;

    case 'doubleFaces':
        return createFlowTwoFaces(flow);
        break;
    case 'doubleFacesV2':
        return createFlowTwoFacesV2(flow, choosen_index);
        break;

    case 'doubleFacesV3':
        return createFlowTwoFacesV3(flow, choosen_index);
        break;

    case 'barChartFlowMap':
        return createFlowBars(flow);
        break;

    case 'pieChartFlowMap':
        return createFlowPies(flow);
        break;

    case 'flowGroupNode':
        return createFlowNodeGrouped(flow, flow_index);
        break;

    case 'flowGroupDirection':
        return createFlowDirectionGrouped(flow, flow_index);
        break;

    case 'floatingOD':
        return createFloatingODFlow(flow, choosen_index, flow_index);
        break;
        */

    }
}


function createFlowBilateral(flow) {

    console.log('running from createFlowBilateral()')
    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source, 1);
    var meshT2S = flowParts(flow.target, -1);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item, direction) {


        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);

        if (direction == 1) {

            color = "#dd5336"
        } else {
            color = "#288fdd"
        }


        var width = VIS.linerScaleWidth(item.value);

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

        //var tubeGeometry = new THREE.TubeBufferGeometry( path, 20, width, 8, false );
        var tubeGeometry = new THREE.TubeGeometry(path, 20, width, 8, false);

        tubeGeometry.center();
        tubeGeometry.translate(0, 0, radius / 2);

        var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshLambertMaterial({ color: color }));
        mesh.rotateOnAxis(new THREE.Vector3(destination[0] - origin[0], destination[1] - origin[1], -radius / 2).normalize(), Math.PI / 12);
        mesh.position.set((destination[0] + origin[0]) / 2, (destination[1] + origin[1]) / 2, 0);

        mesh.doubleSided = true;
        return mesh;

    }
}

function createFlowBilateral_3DHeight(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source, 1);
    var meshT2S = flowParts(flow.target, -1);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item, direction) {


        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);

        if (direction == 1) {

            color = "#dd5336"
        } else {
            color = "#288fdd"
        }


        var width = VIS.linerScaleWidth(item.value);

        var width = 15;

        var height = VIS.linerScaleValue2Z(item.value);

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


        var spline = new THREE.CatmullRomCurve3(createCurveArray_3DFlowHeight(origin,
            destination, 1, height * 2));



        //var tubeGeometry = new THREE.TubeBufferGeometry( path, 20, width, 8, false );
        var tubeGeometry = new THREE.TubeGeometry(spline, 64, width, 8, false);

        //tubeGeometry.center();
        //tubeGeometry.translate(0,0,radius/2);

        var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshLambertMaterial({ color: color }));


        //mesh.rotateOnAxis(new THREE.Vector3( destination[0]- origin[0], destination[1] - origin[1],-radius/2).normalize(), Math.PI/12);
        //mesh.position.set((destination[0] + origin[0])/2, (destination[1] + origin[1])/2,0);
        mesh.doubleSided = true;
        return mesh;

    }
}

function createFlowBetweenTwoFacesO(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
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


        function getInterPoint() {

            var x = (destination[0] + origin[0]) / 2,
                y1 = VIS.map_width / 2,
                z1 = origin[1] + VIS.map_width / 2,
                y2 = destination[1],
                z2 = 1;

            var y0 = (y1 + y2) / 2;
            var z0 = (z1 + z2) / 2;

            var r = Math.sqrt(Math.abs((y2 - y1) * (z2 - z1)));

            var y = y0 + r * Math.sin(Math.abs(z1 - z2));
            var z = z0 + r * Math.cos(Math.abs(y2 - y1));


            return new THREE.Vector3(x, y, z)
        }


        var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));


        mesh.doubleSided = true;

        return mesh;

    }

}

function createFlowBetweenTwoFacesP(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);



        var curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(origin[0], origin[1], VIS.map_height),
            new THREE.Vector3((origin[0] + destination[0]) / 2,
                (origin[1] + destination[1]) / 2,
                VIS.map_height / 2),
            new THREE.Vector3(destination[0], destination[1], 1)

        );


        var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));


        mesh.doubleSided = true;

        return mesh;

    }

}

function createFloatingODFlow(flow, choosen_index) {


    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var originZ = glMapZs[item.index],
            destinationZ = glMapZs[item.subindex];


        var origin3D = glMapPositions[item.index],
            destination3D = glMapPositions[item.subindex];

        //console.log(originZ, destinationZ);

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);

        var dreaction = 1;

        var tubeRadius = 4;

        var spline = new THREE.CatmullRomCurve3(
            //createCurveArrayZ( origin, originZ , destination, destinationZ,  dreaction,width, VIS.unitline3D/3)
            createCurveArray3D(origin, origin3D, destination, destination3D, dreaction, width, VIS.unitline3D / 3)

        );

        var tubeGeometry = new THREE.TubeBufferGeometry(spline, 20, tubeRadius, 8, false);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));

        mesh.doubleSided = true;

        return mesh;
    }


    function createCurveArrayZ(point_start, point_start_z, point_end, point_end_z, dreaction, step_Z, unit) {

        var interpoint = new THREE.Vector3((point_start[0] + point_end[0]) / 2,
            (point_start[1] + point_end[1]) / 2,
            (point_start_z + point_end_z) / 2);

        return [new THREE.Vector3(point_start[0], point_start[1], point_start_z),
            interpoint,
            new THREE.Vector3(point_end[0], point_end[1], point_end_z)
        ];

    }

    function createCurveArray3D(point_start, start3D, point_end, end3D, dreaction, step_Z, unit) {

        var interpoint = new THREE.Vector3((point_start[0] + point_end[0]) / 2,
            (start3D[1] + end3D[1]) / 2,
            (start3D[2] + end3D[2]) / 2);

        return [new THREE.Vector3(start3D[0], start3D[1], start3D[2]),
            interpoint,
            new THREE.Vector3(end3D[0], end3D[1], end3D[2])
        ];

    }


}

function createFlowNodeGrouped(flow, flow_index) {


    var group = new THREE.Group();

    createRibbon(flow, flow_index);

    //get Dominant color

    return group;

    function createRibbon(flow, flow_index) {

        var flow_C = dataChordC[flow_index];


        var resetAngle_O = dataChordC.groups[flow_C.source.index].startAngle;
        var resetAngle_D = dataChordC.groups[flow_C.target.index].startAngle;

        var origin = VIS.PositionsOD[citynameIndexMap[flow_C.source.index]],
            destination = VIS.PositionsOD[citynameIndexMap[flow_C.target.index]];


        // for source part
        var width = VIS.linerScaleAngle2Z(flow_C.source.endAngle - flow_C.source.startAngle);

        var Z_O_down = VIS.linerScaleAngle2Z(flow_C.source.startAngle - resetAngle_O);
        var Z_O_top = Z_O_down + width * flow.source.value / flow_C.source.value;

        var Z_D_down = VIS.linerScaleAngle2Z(flow_C.target.startAngle - resetAngle_D) +
            width * flow.target.value / flow_C.source.value;
        var Z_D_top = Z_D_down + width * flow.source.value / flow_C.source.value;


        var geometry = getGeometry(origin, Z_O_down, Z_O_top, destination, Z_D_down, Z_D_top);

        var material = new THREE.MeshBasicMaterial({
            color: VIS.color(citynameIndexMap[flow.source.index]),
            transparent: true,
            opacity: 0.8
        });

        var mesh = new THREE.Mesh(geometry, material);

        group.add(mesh);


        //for target part

        Z_O_down = VIS.linerScaleAngle2Z(flow_C.source.startAngle - resetAngle_O) +
            width * flow.source.value / flow_C.source.value;
        Z_O_top = Z_O_down + width * flow.target.value / flow_C.source.value;

        Z_D_down = VIS.linerScaleAngle2Z(flow_C.target.startAngle - resetAngle_D);
        Z_D_top = Z_D_down + width * flow.target.value / flow_C.source.value;

        var geometry = getGeometry(destination, Z_D_down, Z_D_top, origin, Z_O_down, Z_O_top);

        var material = new THREE.MeshBasicMaterial({
            color: VIS.color(citynameIndexMap[flow.target.index]),
            transparent: true,
            opacity: 0.8
        });

        var mesh = new THREE.Mesh(geometry, material);

        group.add(mesh);



        function getGeometry(origin, Z_O_down, Z_O_top, destination, Z_D_down, Z_D_top) {

            var Z_O = (Z_O_down + Z_O_top) / 2;
            var Z_D = (Z_D_down + Z_D_top) / 2;

            var dx = (destination[0] - origin[0]) / 4;
            var dy = (destination[1] - origin[1]) / 4;
            var dz = Z_D - Z_O;

            //------
            var geometry = new THREE.Geometry();


            var SplineBottom = new THREE.CatmullRomCurve3([
                new THREE.Vector3(origin[0], origin[1], Z_O_down),

                new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down + dz / 20),
                new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
                new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down - dz / 20),

                new THREE.Vector3(destination[0], destination[1], Z_D_down)
            ]);


            var SplineBottomPoints = SplineBottom.getPoints(50);


            var SplineTop = new THREE.CatmullRomCurve3([

                new THREE.Vector3(origin[0], origin[1], Z_O_top),
                new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top + dz / 20),
                new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
                new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top - dz / 20),
                new THREE.Vector3(destination[0], destination[1], Z_D_top)

            ]);

            var SplineTopPoints = SplineTop.getPoints(50);


            for (var i = 0; i < SplineBottomPoints.length; i++) {

                if (i > SplineBottomPoints.length - 2) {

                    geometry.vertices.push(
                        new THREE.Vector3(SplineBottomPoints[i].x,
                            SplineBottomPoints[i].y,
                            (SplineBottomPoints[i].z + SplineTopPoints[i].z) / 2)
                    );
                    geometry.vertices.push(
                        new THREE.Vector3(SplineBottomPoints[i].x,
                            SplineBottomPoints[i].y,
                            (SplineBottomPoints[i].z + SplineTopPoints[i].z) / 2)
                    );
                    //geometry.vertices.push(  (SplineBottomPoints[i]+SplineTopPoints[i]  )/2 );
                } else {
                    geometry.vertices.push(SplineBottomPoints[i]);
                    geometry.vertices.push(SplineTopPoints[i]);
                }


            }



            for (var i = 1; i < geometry.vertices.length / 2; i++) {

                geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
                geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

                geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
                geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

            }

            for (var i = 1; i < 51; i++) {

                geometry.faceVertexUvs[0].push([
                    new THREE.Vector2((i - 1) / 50, 0),
                    new THREE.Vector2((i - 1) / 50, 1),
                    new THREE.Vector2(i / 50, 1)
                ]);
                geometry.faceVertexUvs[0].push([
                    new THREE.Vector2((i - 1) / 50, 0),
                    new THREE.Vector2(i / 50, 1),
                    new THREE.Vector2(i / 50, 0)
                ]);

                geometry.faceVertexUvs[0].push([
                    new THREE.Vector2(i / 50, 1),
                    new THREE.Vector2((i - 1) / 50, 0),
                    new THREE.Vector2(i / 50, 0)
                ]);
                geometry.faceVertexUvs[0].push([
                    new THREE.Vector2(i / 50, 1),
                    new THREE.Vector2((i - 1) / 50, 1),
                    new THREE.Vector2((i - 1) / 50, 0)
                ]);
            }

            geometry.uvsNeedUpdate = true;


            return geometry;
        }


    }

}

function createFlowDirectionGrouped(flow, flow_index) {


    var group = new THREE.Group();


    //console.log(flow);

    var item_T = dataChordT[flow_index].source;
    createRibbon(flow.source, item_T);

    var item_T = dataChordT[flow_index].target;
    createRibbon(flow.target, item_T);

    return group;



    function createRibbon(item, item_T) {


        var padding = 5;

        var color = VIS.color(citynameIndexMap[item.index]);

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];


        var resetAngle_O = dataChord.groups[item.index].startAngle;

        var Z_O_down = VIS.linerScaleAngle2ZDouble(item.startAngle - resetAngle_O);
        var Z_O_top = VIS.linerScaleAngle2ZDouble(item.endAngle - resetAngle_O) - padding;



        //console.log(flow_T.source.value, flow.source.value);


        var resetAgnle_DBottom = dataChord.groups[item.subindex].endAngle -
            dataChord.groups[item.subindex].startAngle;

        var resetAngle_D = dataChordT.groups[item_T.index].startAngle;

        var Z_D_down = VIS.linerScaleAngle2ZDouble(item_T.startAngle - resetAngle_D) +
            VIS.linerScaleAngle2ZDouble(resetAgnle_DBottom);

        var Z_D_top = VIS.linerScaleAngle2ZDouble(item_T.endAngle - resetAngle_D) +
            VIS.linerScaleAngle2ZDouble(resetAgnle_DBottom) - padding;


        var Z_O = (Z_O_down + Z_O_top) / 2;
        var Z_D = (Z_D_down + Z_D_top) / 2;

        var dx = (destination[0] - origin[0]) / 4;
        var dy = (destination[1] - origin[1]) / 4;
        var dz = Z_D - Z_O;


        //------
        var geometry = new THREE.Geometry();


        var SplineBottom = new THREE.CatmullRomCurve3([
            new THREE.Vector3(origin[0], origin[1], Z_O_down),

            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down + dz / 20),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down - dz / 20),

            new THREE.Vector3(destination[0], destination[1], Z_D_down)
        ]);


        var SplineBottomPoints = SplineBottom.getPoints(50);


        var SplineTop = new THREE.CatmullRomCurve3([

            new THREE.Vector3(origin[0], origin[1], Z_O_top),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top + dz / 20),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top - dz / 20),
            new THREE.Vector3(destination[0], destination[1], Z_D_top)

        ]);

        var SplineTopPoints = SplineTop.getPoints(50);


        for (var i = 0; i < SplineBottomPoints.length; i++) {

            geometry.vertices.push(SplineBottomPoints[i]);
            geometry.vertices.push(SplineTopPoints[i]);
        }



        for (var i = 1; i < geometry.vertices.length / 2; i++) {

            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

        }

        for (var i = 1; i < 51; i++) {

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2(i / 50, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2(i / 50, 0)
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 0)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0)
            ]);
        }

        geometry.uvsNeedUpdate = true;


        //get Dominant color

        //var color = flow.source.value > flow.target.value
        //   ? VIS.color(citynameIndexMap[flow.source.index] )
        //   : VIS.color(citynameIndexMap[flow.target.index] );


        var material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });

        mesh = new THREE.Mesh(geometry, material);

        group.add(mesh);

    }

    function generateTexture(colorO, colorD) {

        var size = 512;

        // create canvas
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext('2d');

        // draw gradient
        context.rect(0, 0, size, size);

        var gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, colorO);
        gradient.addColorStop(1, colorD);
        context.fillStyle = gradient;
        context.fill();


        var texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;

    }
}

function createPiesOD() {

    var group = new THREE.Group();


    dataChord.groups.forEach(function(d) {

        //var height = VIS.linerScaleAngle2Z (d.endAngle - d.startAngle) ;
        var height = VIS.linerScaleAngle2Z(Math.PI / 7);

        var pos = VIS.PositionsOD[citynameIndexMap[d.index]];

        var color = VIS.color(citynameIndexMap[d.index]);

        //var radius = 20;
        var radius = 0.5;

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

        geometry.rotateX(Math.PI / 2);

        //var material = new THREE.MeshBasicMaterial( {color: color} );
        var material = new THREE.MeshBasicMaterial({ color: "#636363" });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height / 2);

        group.add(cylinder);
    });

    return group;
}

function createFlowPies(flow) {



    var origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]],
        destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];

    var angleO2D = (destination[1] - origin[1]) / (destination[0] - origin[0]);

    var angleO2D = Math.atan(angleO2D);

    var group = new THREE.Group();

    createFlow(flow.source, group);
    createFlow(flow.target, group);
    //var mesh_F = createFlow( flow );
    createRibbon(flow, group);

    return group;

    function createFlow(item, group) {

        var r_value = VIS.linerScaleValue2Z(item.value);

        if (r_value) {

            var radius = r_value / 3;

            var height = 10;

            var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
                destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

            var posZ_O = item.subindex * height * 2 + 1.5 * height,
                posZ_D = item.index * height * 2 + 1.5 * height;

            var material = new THREE.MeshBasicMaterial({
                color: VIS.color(citynameIndexMap[item.index])
                // color: "#2519dd"
            });

            var geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 32, 1, false,
                Math.PI * 0 + angleO2D - Math.PI / 2, Math.PI);
            geometry.rotateX(Math.PI / 2);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(origin[0], origin[1], posZ_O);
            group.add(mesh);


            var material = new THREE.MeshBasicMaterial({
                color: VIS.color(citynameIndexMap[item.index])
            });

            var geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 32, 1, false,
                Math.PI * 1 + angleO2D - Math.PI / 2, Math.PI);
            geometry.rotateX(Math.PI / 2);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(destination[0], destination[1], posZ_D);
            group.add(mesh);

        }


    }

    function createRibbon(flow, group) {

        var height = 10;
        var posZ_O = flow.target.index * height * 2 + 1.5 * height,
            posZ_D = flow.source.index * height * 2 + 1.5 * height;

        var origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]],
            destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];


        var height = 10;

        var Z_O_down = posZ_O - height / 2;
        var Z_O_top = posZ_O + height / 2;


        var Z_D_down = posZ_D - height / 2;
        var Z_D_top = posZ_D + height / 2;

        var dx = (destination[0] - origin[0]) / 4;
        var dy = (destination[1] - origin[1]) / 4;
        var dz = posZ_D - posZ_O;

        //------
        var geometry = new THREE.Geometry();


        var SplineBottom = new THREE.CatmullRomCurve3([
            new THREE.Vector3(origin[0], origin[1], Z_O_down),

            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down),

            new THREE.Vector3(destination[0], destination[1], Z_D_down)
        ]);


        var SplineBottomPoints = SplineBottom.getPoints(50);


        var SplineTop = new THREE.CatmullRomCurve3([

            new THREE.Vector3(origin[0], origin[1], Z_O_top),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top),
            new THREE.Vector3(destination[0], destination[1], Z_D_top)

        ]);

        var SplineTopPoints = SplineTop.getPoints(50);


        for (var i = 0; i < SplineBottomPoints.length; i++) {

            geometry.vertices.push(SplineBottomPoints[i]);
            geometry.vertices.push(SplineTopPoints[i]);
        }



        for (var i = 1; i < geometry.vertices.length / 2; i++) {

            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

        }

        for (var i = 1; i < 51; i++) {

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2(i / 50, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2(i / 50, 0)
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 0)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0)
            ]);
        }

        geometry.uvsNeedUpdate = true;


        //var material = new THREE.MeshBasicMaterial( { color: VIS.color(citynameIndexMap[item.index] ) } );
        var material = new THREE.MeshBasicMaterial({
            map: generateTexture(
                VIS.color(citynameIndexMap[flow.target.index]),
                VIS.color(citynameIndexMap[flow.source.index])),
            transparent: 0.6
        });

        //var material = new THREE.MeshBasicMaterial( { map: generateTexture(
        //        VIS.color(citynameIndexMap[item.index ] ),
        //        VIS.color(citynameIndexMap[item.subindex] )   ),  transparent: 1} );
        var mesh = new THREE.Mesh(geometry, material);



        //var mesh  = new THREE.Mesh( geometry, generateTexture(
        //                    VIS.color(citynameIndexMap[item.index] ) ,
        //                    VIS.color(citynameIndexMap[item.subindex] ) ) );

        group.add(mesh);
    }

    function generateTexture(colorO, colorD) {

        var size = 512;

        // create canvas
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext('2d');

        // draw gradient
        context.rect(0, 0, size, size);

        var gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, colorO);
        gradient.addColorStop(1, colorD);
        context.fillStyle = gradient;
        context.fill();


        var texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;
    }

}

function createFlowTwoFaces(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);



        var curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(origin[0], origin[1], 0),
            new THREE.Vector3(destination[0], destination[1],
                (destination[1] + VIS.map_width / 2)),
            new THREE.Vector3(destination[0], VIS.map_width / 2, (destination[1] + VIS.map_width / 2))
        );


        var tubeGeometry = new THREE.TubeBufferGeometry(curve, 20, width, 8, false);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));


        mesh.doubleSided = true;

        return mesh;

    }

}

function createFlowTwoFacesV2(flow, choosen_index) {

    var group = new THREE.Group();

    var origin, destination;

    if (choosen_index == flow.source.index) {

        origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]];
        destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];
    } else {
        origin = VIS.PositionsOD[citynameIndexMap[flow.target.index]];
        destination = VIS.PositionsOD[citynameIndexMap[flow.source.index]];
    }


    var curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(origin[0], origin[1], 0),
        new THREE.Vector3(destination[0], destination[1],
            (destination[1] + VIS.map_width / 2)),
        new THREE.Vector3(destination[0], VIS.map_width / 2, (destination[1] + VIS.map_width / 2))
    );

    var extrudeSettings = {
        steps: 20,
        bevelEnabled: false,
        extrudePath: curve
    };



    var radiusO2D = VIS.linerScaleWidth(flow.source.value);
    var shapeO2D = new THREE.Shape();
    shapeO2D.arc(0, 0, radiusO2D, 0, Math.PI);
    var geometry = new THREE.ExtrudeBufferGeometry(shapeO2D, extrudeSettings);
    var mesh = new THREE.Mesh(geometry,
        new THREE.MeshBasicMaterial({
            color: VIS.color(citynameIndexMap[flow.source.index])
        }));


    group.add(mesh);



    var radiusD2O = VIS.linerScaleWidth(flow.target.value);
    var shapeD2O = new THREE.Shape();

    shapeD2O.arc(0, 0, radiusD2O, Math.PI, 2 * Math.PI);
    var geometry = new THREE.ExtrudeBufferGeometry(shapeD2O, extrudeSettings);

    var mesh = new THREE.Mesh(geometry,
        new THREE.MeshBasicMaterial({
            color: VIS.color(citynameIndexMap[flow.target.index])
        }));

    group.add(mesh);


    return group;



}

function createFlowTwoFacesV3(flow, choosen_index) {


    var geometry = createRibbonGeometry(flow, choosen_index);


    /*
    var color = flow.source.value > flow.target.value
        ? VIS.color(citynameIndexMap[flow.source.index] )
        : VIS.color(citynameIndexMap[flow.target.index] );
        */


    var color = flow.source.index == choosen_index ?
        VIS.color(citynameIndexMap[flow.target.index]) :
        VIS.color(citynameIndexMap[flow.source.index]);

    var material = new THREE.MeshBasicMaterial({ color: color });

    mesh = new THREE.Mesh(geometry, material);

    return mesh;

    function createRibbonGeometry(flow, choosen_index) {


        var origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]],
            destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];


        var resetAngle_O = dataChord.groups[flow.source.index].startAngle;
        var resetAngle_D = dataChord.groups[flow.target.index].startAngle;


        var destinationOnFace = [destination[0], VIS.map_width / 2];


        var Z_O_down = VIS.linerScaleAngle2Z(flow.source.startAngle - resetAngle_O);
        var Z_O_top = VIS.linerScaleAngle2Z(flow.source.endAngle - resetAngle_O);




        var Z_D_thick = VIS.linerScaleAngle2Z(flow.target.endAngle - flow.target.startAngle);
        var Z_D_down = destination[1] + VIS.map_width / 2 - 0.5 * Z_D_thick;
        var Z_D_top = destination[1] + VIS.map_width / 2 + 0.5 * Z_D_thick;

        var Z_O = (Z_O_down + Z_O_top) / 2;
        var Z_D = (Z_D_down + Z_D_top) / 2;



        if (choosen_index == flow.source.index) {

            origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]];
            destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];
        } else {
            origin = VIS.PositionsOD[citynameIndexMap[flow.target.index]];
            destination = VIS.PositionsOD[citynameIndexMap[flow.source.index]];

            destinationOnFace = [destination[0], VIS.map_width / 2];

            resetAngle_O = dataChord.groups[flow.target.index].startAngle;
            Z_O_down = VIS.linerScaleAngle2Z(flow.target.startAngle - resetAngle_O);
            Z_O_top = VIS.linerScaleAngle2Z(flow.target.endAngle - resetAngle_O);


            Z_D_thick = VIS.linerScaleAngle2Z(flow.source.endAngle - flow.source.startAngle);
            Z_D_down = destination[1] + VIS.map_width / 2 - 0.5 * Z_D_thick;
            Z_D_top = destination[1] + VIS.map_width / 2 + 0.5 * Z_D_thick;

            Z_O = (Z_O_down + Z_O_top) / 2;
            Z_D = (Z_D_down + Z_D_top) / 2;


        }


        var dx = (destinationOnFace[0] - origin[0]) / 4;
        var dy = (destinationOnFace[1] - origin[1]) / 4;
        var dz = Z_D - Z_O;

        //------
        var geometry = new THREE.Geometry();


        var SplineBottom = new THREE.CatmullRomCurve3([
            new THREE.Vector3(origin[0], origin[1], Z_O_down),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down),

            new THREE.Vector3(destinationOnFace[0], destinationOnFace[1], Z_D_down)
        ]);


        var SplineBottomPoints = SplineBottom.getPoints(50);


        var SplineTop = new THREE.CatmullRomCurve3([

            new THREE.Vector3(origin[0], origin[1], Z_O_top),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top),
            new THREE.Vector3(destinationOnFace[0], destinationOnFace[1], Z_D_top)

        ]);

        var SplineTopPoints = SplineTop.getPoints(50);


        for (var i = 0; i < SplineBottomPoints.length; i++) {

            geometry.vertices.push(SplineBottomPoints[i]);
            geometry.vertices.push(SplineTopPoints[i]);
        }


        for (var i = 1; i < geometry.vertices.length / 2; i++) {

            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

        }

        for (var i = 1; i < 51; i++) {

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2(i / 50, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2(i / 50, 0)
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 0)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0)
            ]);
        }

        geometry.uvsNeedUpdate = true;


        return geometry;

    }

    function generateTexture(colorO, colorD) {

        var size = 512;

        // create canvas
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext('2d');

        // draw gradient
        context.rect(0, 0, size, size);

        var gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, colorO);
        gradient.addColorStop(1, colorD);
        context.fillStyle = gradient;
        context.fill();


        var texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;

    }
}

function createFlowBars(flow) {


    var group = new THREE.Group();

    createFlow(flow.source, group);
    createFlow(flow.target, group);
    //var mesh_F = createFlow( flow );



    return group;

    function createFlow(item, group) {

        var r_value = VIS.linerScaleAngle2Z(item.endAngle - item.startAngle);
        if (r_value) {

            var radius = r_value / 3;
            var height = 10;


            var material = new THREE.MeshBasicMaterial({
                color: VIS.color(citynameIndexMap[item.subindex])
            });

            var origin = VIS.PositionsOD[citynameIndexMap[item.index]];
            var posZ_O = item.subindex * height * 3 + height * 3;
            var geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 32);
            geometry.rotateX(Math.PI / 2);

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(origin[0], origin[1], posZ_O + height / 2);

            group.add(mesh);

            var destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];
            var posZ_D = item.index * height * 3 + height * 1.5;
            var geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 32);
            geometry.rotateX(Math.PI / 2);
            var material = new THREE.MeshBasicMaterial({
                color: VIS.color(citynameIndexMap[item.index])
            });

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(destination[0], destination[1], posZ_D + height / 2);

            group.add(mesh);



            var flow = createRibbon(item, posZ_O, posZ_D);

            group.add(flow);
        }




    }

    function createRibbon(item, posZ_O, posZ_D) {


        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];


        var height = 10;

        var Z_O_down = posZ_O - height / 2 + height / 2;
        var Z_O_top = posZ_O + height / 2 + height / 2;


        var Z_D_down = posZ_D - height / 2 + height / 2;
        var Z_D_top = posZ_D + height / 2 + height / 2;

        var dx = (destination[0] - origin[0]) / 4;
        var dy = (destination[1] - origin[1]) / 4;
        var dz = height;

        //------
        var geometry = new THREE.Geometry();


        var SplineBottom = new THREE.CatmullRomCurve3([
            new THREE.Vector3(origin[0], origin[1], Z_O_down),

            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down),

            new THREE.Vector3(destination[0], destination[1], Z_D_down)
        ]);


        var SplineBottomPoints = SplineBottom.getPoints(50);


        var SplineTop = new THREE.CatmullRomCurve3([

            new THREE.Vector3(origin[0], origin[1], Z_O_top),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top),
            new THREE.Vector3(destination[0], destination[1], Z_D_top)

        ]);

        var SplineTopPoints = SplineTop.getPoints(50);


        for (var i = 0; i < SplineBottomPoints.length; i++) {

            geometry.vertices.push(SplineBottomPoints[i]);
            geometry.vertices.push(SplineTopPoints[i]);
        }



        for (var i = 1; i < geometry.vertices.length / 2; i++) {

            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

        }

        for (var i = 1; i < 51; i++) {

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2(i / 50, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2(i / 50, 0)
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 0)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0)
            ]);
        }

        geometry.uvsNeedUpdate = true;


        //var material = new THREE.MeshBasicMaterial( { color: VIS.color(citynameIndexMap[item.index] ) } );
        var material = new THREE.MeshBasicMaterial({
            map: generateTexture(
                "#2318ff",
                "#ffb417"),
            transparent: 0.6
        });

        //var material = new THREE.MeshBasicMaterial( { map: generateTexture(
        //        VIS.color(citynameIndexMap[item.index ] ),
        //        VIS.color(citynameIndexMap[item.subindex] )   ),  transparent: 1} );
        var mesh = new THREE.Mesh(geometry, material);



        //var mesh  = new THREE.Mesh( geometry, generateTexture(
        //                    VIS.color(citynameIndexMap[item.index] ) ,
        //                    VIS.color(citynameIndexMap[item.subindex] ) ) );


        return mesh;

    }

    function generateTexture(colorO, colorD) {

        var size = 512;

        // create canvas
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext('2d');

        // draw gradient
        context.rect(0, 0, size, size);

        var gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, colorO);
        gradient.addColorStop(1, colorD);
        context.fillStyle = gradient;
        context.fill();


        var texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;
    }

}

function createBarsOD() {

    var group = new THREE.Group();


    dataChord.groups.forEach(function(d) {


        //var height = VIS.linerScaleAngle2Z (d.endAngle - d.startAngle) ;
        var height = VIS.linerScaleAngle2Z(Math.PI / 6);

        var pos = VIS.PositionsOD[citynameIndexMap[d.index]];

        var color = VIS.color(citynameIndexMap[d.index]);

        //var radius = 20;
        var radius = 2;

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

        geometry.rotateX(Math.PI / 2);

        //var material = new THREE.MeshBasicMaterial( {color: color} );
        var material = new THREE.MeshBasicMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height / 2);

        group.add(cylinder);
    });

    return group;
}

function createBarsODDouble() {

    var group = new THREE.Group();


    dataChord.groups.forEach(function(d, i) {

        //console.log(dataChordT.groups[i]);

        var height1 = VIS.linerScaleAngle2ZDouble(d.endAngle - d.startAngle);

        var pos = VIS.PositionsOD[citynameIndexMap[d.index]];

        var color = VIS.color(citynameIndexMap[d.index]);

        var radius = 15;

        var geometry = new THREE.CylinderGeometry(radius, radius, height1, 32);

        geometry.rotateX(Math.PI / 2);

        var material = new THREE.MeshBasicMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height1 / 2);

        group.add(cylinder);


        var height2 = VIS.linerScaleAngle2ZDouble(dataChordT.groups[i].endAngle - dataChordT.groups[i].startAngle);



        //var color = VIS.color(citynameIndexMap[d.index] );

        var radius = 5;

        var geometry = new THREE.CylinderGeometry(radius, radius, height2, 32);

        geometry.rotateX(Math.PI / 2);

        var material = new THREE.MeshBasicMaterial({ color: "#454545" });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height2 / 2 + height1);

        group.add(cylinder);


    });

    return group;
}

function createBarsODDoubleNode() {

    var group = new THREE.Group();


    dataChordC.groups.forEach(function(d, i) {

        //console.log(dataChordT.groups[i]);

        var height1 = VIS.linerScaleAngle2Z(d.endAngle - d.startAngle);

        var pos = VIS.PositionsOD[citynameIndexMap[d.index]];

        var color = VIS.color(citynameIndexMap[d.index]);

        var radius = 5;

        var geometry = new THREE.CylinderGeometry(radius, radius, height1, 32);

        geometry.rotateX(Math.PI / 2);

        var material = new THREE.MeshBasicMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height1 / 2);

        group.add(cylinder);

    });

    return group;
}

function createCylinderOD() {

    var group = new THREE.Group();


    dataChord.groups.forEach(function(d) {


        var height = VIS.linerScaleAngle2Z(d.endAngle - d.startAngle);

        var pos = VIS.PositionsOD[citynameIndexMap[d.index]];

        var color = VIS.color(citynameIndexMap[d.index]);

        var radius = 20;

        var geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

        geometry.rotateX(Math.PI / 2);

        var material = new THREE.MeshBasicMaterial({ color: color });
        var cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.set(pos[0], pos[1], height / 2);

        group.add(cylinder);
    });

    return group;
}

function createFlowSankey(flow) {


    var geometry = createRibbonGeometry(flow);

    //get gradient color
    //var color1 = VIS.color(citynameIndexMap[flow.source.index] );
    //var color2 = VIS.color(citynameIndexMap[flow.target.index] );
    //var texture = generateTexture(color2, color1);
    //var material = new THREE.MeshBasicMaterial( { map: texture } );


    //get Dominant color
    var color = flow.source.value > flow.target.value ?
        VIS.color(citynameIndexMap[flow.source.index]) :
        VIS.color(citynameIndexMap[flow.target.index]);

    var material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });

    mesh = new THREE.Mesh(geometry, material);

    return mesh;

    function createRibbonGeometry(flow) {


        var resetAngle_O = dataChord.groups[flow.source.index].startAngle;
        var resetAngle_D = dataChord.groups[flow.target.index].startAngle;

        var origin = VIS.PositionsOD[citynameIndexMap[flow.source.index]],
            destination = VIS.PositionsOD[citynameIndexMap[flow.target.index]];


        var Z_O_down = VIS.linerScaleAngle2Z(flow.source.startAngle - resetAngle_O);
        var Z_O_top = VIS.linerScaleAngle2Z(flow.source.endAngle - resetAngle_O);


        var Z_D_down = VIS.linerScaleAngle2Z(flow.target.startAngle - resetAngle_D);
        var Z_D_top = VIS.linerScaleAngle2Z(flow.target.endAngle - resetAngle_D);

        var Z_O = (Z_O_down + Z_O_top) / 2;
        var Z_D = (Z_D_down + Z_D_top) / 2;

        var dx = (destination[0] - origin[0]) / 4;
        var dy = (destination[1] - origin[1]) / 4;
        var dz = Z_D - Z_O;


        //------
        var geometry = new THREE.Geometry();


        var SplineBottom = new THREE.CatmullRomCurve3([
            new THREE.Vector3(origin[0], origin[1], Z_O_down),

            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_down + dz / 20),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_down + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_down - dz / 20),

            new THREE.Vector3(destination[0], destination[1], Z_D_down)
        ]);


        var SplineBottomPoints = SplineBottom.getPoints(50);


        var SplineTop = new THREE.CatmullRomCurve3([

            new THREE.Vector3(origin[0], origin[1], Z_O_top),
            new THREE.Vector3(origin[0] + dx, origin[1] + dy, Z_O_top + dz / 20),
            new THREE.Vector3(origin[0] + 2 * dx, origin[1] + 2 * dy, Z_O_top + dz / 2),
            new THREE.Vector3(origin[0] + 3 * dx, origin[1] + 3 * dy, Z_D_top - dz / 20),
            new THREE.Vector3(destination[0], destination[1], Z_D_top)

        ]);

        var SplineTopPoints = SplineTop.getPoints(50);


        for (var i = 0; i < SplineBottomPoints.length; i++) {

            geometry.vertices.push(SplineBottomPoints[i]);
            geometry.vertices.push(SplineTopPoints[i]);
        }



        for (var i = 1; i < geometry.vertices.length / 2; i++) {

            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i - 2, 2 * i));
            geometry.faces.push(new THREE.Face3(2 * i - 1, 2 * i, 2 * i + 1));

            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 1, 2 * i + 1));
            geometry.faces.push(new THREE.Face3(2 * i, 2 * i - 2, 2 * i - 1));

        }

        for (var i = 1; i < 51; i++) {

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2(i / 50, 1)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2(i / 50, 0)
            ]);

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0),
                new THREE.Vector2(i / 50, 0)
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i / 50, 1),
                new THREE.Vector2((i - 1) / 50, 1),
                new THREE.Vector2((i - 1) / 50, 0)
            ]);
        }

        geometry.uvsNeedUpdate = true;


        return geometry;

    }

    function generateTexture(colorO, colorD) {

        var size = 512;

        // create canvas
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // get context
        var context = canvas.getContext('2d');

        // draw gradient
        context.rect(0, 0, size, size);

        var gradient = context.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, colorO);
        gradient.addColorStop(1, colorD);
        context.fillStyle = gradient;
        context.fill();


        var texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;

    }
}

function createTubes3DHeight(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);

        var dreaction = 1;

        var tubeRadius = 4;

        var spline = new THREE.CatmullRomCurve3(createCurveArray(origin, destination, dreaction,
            width, VIS.unitline3D / 3));

        var tubeGeometry = new THREE.TubeBufferGeometry(spline, 20, tubeRadius, 8, false);

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));

        mesh.doubleSided = true;

        return mesh;
    }

}

function createSemiCircleTubes(flow) {

    var group = new THREE.Group();

    var meshS2T = flowParts(flow.source);
    var meshT2S = flowParts(flow.target);

    group.add(meshS2T);
    group.add(meshT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);

        var radius = Math.sqrt((destination[1] - origin[1]) * (destination[1] - origin[1]) +
            (destination[0] - origin[0]) * (destination[0] - origin[0])) / 2;


        var path = new THREE.CurvePath();


        for (var i = 1; i < 26; i++) {

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

        var mesh = new THREE.Mesh(tubeGeometry,
            new THREE.MeshBasicMaterial({ color: color }));


        mesh.doubleSided = true;

        return mesh;

    }
}

function createSemiCircle(flow) {

    var group = new THREE.Group();

    var lineS2T = flowParts(flow.source);
    var lineT2S = flowParts(flow.target);

    group.add(lineS2T);
    group.add(lineT2S);
    return group;

    function flowParts(item) {

        var origin = VIS.PositionsOD[citynameIndexMap[item.index]],
            destination = VIS.PositionsOD[citynameIndexMap[item.subindex]];

        var color = VIS.color(citynameIndexMap[item.index]);
        var width = VIS.linerScaleWidth(item.value);

        var radius = Math.sqrt((destination[1] - origin[1]) * (destination[1] - origin[1]) +
            (destination[0] - origin[0]) * (destination[0] - origin[0])) / 2;

        var points = [];

        for (var i = 0; i < 26; i++) {

            var k = i / 50;
            points.push(origin[0] + k * destination[0] - k * origin[0]); //x
            points.push(origin[1] + k * destination[1] - k * origin[1]); //y
            points.push(radius * 2 * Math.sqrt(k - k * k)); //z
            //points.push( radius * Math.sin(Math.PI *k ));   //z
        }

        var vertices = new Float32Array(points);

        var geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        var material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: width
        });

        return new THREE.Line(geometry, material);
    }

}

function createCurveArray(point_start, point_end, dreaction, step_Z, unit) {

    var interpoint = new THREE.Vector3((point_start[0] + point_end[0]) / 2,
        (point_start[1] + point_end[1]) / 2,
        dreaction * step_Z * unit);

    return [new THREE.Vector3(point_start[0], point_start[1], 0),
        interpoint,
        new THREE.Vector3(point_end[0], point_end[1], 0)
    ];

}


function createCurveArray_3DFlowHeight(point_start, point_end, direction, height) {

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