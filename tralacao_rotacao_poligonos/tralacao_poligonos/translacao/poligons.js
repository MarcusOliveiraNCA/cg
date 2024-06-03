var gl;
var canvas;
var maxNumVertices = 200;
var cindex = 0;
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var index = 0;
var iniciar_selecao = false;
var currentPolygon = -1;
var program;
var pickingColors = [];
var poligonos_vertices = new Map();
var isDragging = false;
var uModelViewMatrixLoc;
var modelViewMatrix;
var coresEscolhidas = [];
var isRotating = false;
var previousMousePosition = { x: 0, y: 0 };
var rotationAngle = 0.0;
var bufferId;
var cBufferId;
var vertexPositions = [];
var rotationActive = false;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    var m = document.getElementById("mymenu");
    var a = document.getElementById("Button1");
    var b = document.getElementById("Button2");
    var r = document.getElementById("Button3");

    m.addEventListener("click", function () {
        cindex = m.selectedIndex;
    });

    a.addEventListener("click", function () {
        if (currentPolygon === -1) {
            numPolygons++;
            numIndices[numPolygons] = 0;
            start[numPolygons] = index;
            poligonos_vertices.set(numPolygons, [start[numPolygons], numIndices[numPolygons - 1]]);
            render();
        }
    });

    b.addEventListener("click", function () {
        iniciar_selecao = !iniciar_selecao;
        isDragging = false;
    });

    r.addEventListener("click", function () {
        rotationActive = !rotationActive;
        if (rotationActive) {
            startRotation();
        }
    });

    canvas.addEventListener("mousedown", function (event) {
        if (!iniciar_selecao) {
            t = vec2(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1);
            vertexPositions.push(t);
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

            t = vec4(colors[cindex]);
            coresEscolhidas.push(colors[cindex]);

            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));

            numIndices[numPolygons]++;
            index++;
            render();

        } else {
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            pickingColors = [];
            for (var i = 0; i < numPolygons; i++) {
                var color = vec4((i + 1) / 255.0, 0.0, 0.0, 1.0);
                for (var j = start[i]; j < start[i] + numIndices[i]; j++) {
                    pickingColors.push(color);
                }
            }

            renderPicking();

            var x = event.clientX;
            var y = canvas.height - event.clientY;

            var pixels = new Uint8Array(4);
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            render();

            var pickedColorIndex = pixels[0] - 1;
            if (pickedColorIndex >= 0 && pickedColorIndex < numPolygons) {
                currentPolygon = pickedColorIndex;
            } else {
                currentPolygon = -1;
            }
        }
    });

    canvas.addEventListener("mousemove", function (event) {
        if (isDragging && currentPolygon !== -1) {
            var rect = canvas.getBoundingClientRect();
            var dx = (event.clientX - previousMousePosition.x) / rect.width * 2;
            var dy = -(event.clientY - previousMousePosition.y) / rect.height * 2;

            // Atualizar a posição dos vértices do polígono selecionado
            for (var i = start[currentPolygon]; i < start[currentPolygon] + numIndices[currentPolygon]; i++) {
                vertexPositions[i][0] += dx;
                vertexPositions[i][1] += dy;
            }

            previousMousePosition = { x: event.clientX, y: event.clientY };
            render();
        } else if (isRotating && currentPolygon !== -1) {
            var deltaX = event.clientX - previousMousePosition.x;
            rotationAngle += deltaX * 0.7;
            previousMousePosition = { x: event.clientX, y: event.clientY };

            render();
        }
    });

    canvas.addEventListener("mouseup", function () {
        isDragging = false;
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    uModelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coresEscolhidas), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexPositions), gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    for (var i = 0; i < numPolygons; i++) {
        if (i === currentPolygon) {
            var centroid = calculateCentroid(currentPolygon);
            var translationMatrix = translate(centroid[0], centroid[1], 0.0);
            var rotationMatrix = rotate(rotationAngle, 0, 0, 1);
            var reverseTranslationMatrix = translate(-centroid[0], -centroid[1], 0.0);

            modelViewMatrix = mult(mult(translationMatrix, rotationMatrix), reverseTranslationMatrix);
            gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(modelViewMatrix));
        } else {
            gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(mat4()));
        }
        gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
    }

    requestAnimFrame(render);
}

function renderPicking() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pickingColors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexPositions), gl.STATIC_DRAW);

    var vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    for (var i = 0; i < numPolygons; i++) {
        gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(mat4()));
        gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
    }
}

function calculateCentroid(polygonIndex) {
    var centroid = vec2(0, 0);
    var startIdx = start[polygonIndex];
    var endIdx = startIdx + numIndices[polygonIndex];
    for (var i = startIdx; i < endIdx; i++) {
        centroid[0] += vertexPositions[i][0];
        centroid[1] += vertexPositions[i][1];
    }
    centroid[0] /= numIndices[polygonIndex];
    centroid[1] /= numIndices[polygonIndex];
    return centroid;
}

function startRotation() {
    if (!rotationActive) return;

    rotationAngle += 1.0;
    render();
    requestAnimationFrame(startRotation);
}


