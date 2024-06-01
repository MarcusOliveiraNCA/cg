var canvas;
var gl;
var pointsIndividuais = [];
var pointsLinhas = [];
var pointsPoligono = [];
var program1;
var program2;
var program3;
var bufferId1;
var bufferId2;
var bufferId3;
var colorBufferId1;
var colorBufferId2;
var colorBufferId3;
var vPosition;
var vColor;
var option = 0;
var pointSize = 10.0;

var theta;
var thetaLoc;
var baricentroLoc;
var baricentroLoc2;
var baricentros = [];
var scrollSpeed = 0.5; 
var delta = 0.5;

var tColor = vec4(1.0, 1.0, 1.0, 1.0);
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var indexPoligono = 0;
var indexPonto = 0;
var indexLinha = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    var menu = document.getElementById("menuFuncao");
    var menuColor = document.getElementById("menuColor");
    var button = document.getElementById("Button1");

    menu.addEventListener("click", function() {
        option = menu.selectedIndex;
    });

    theta = 0;

    menuColor.addEventListener("click", function() {
        var cindex = menuColor.selectedIndex;
        switch (cindex) {
            case 0: tColor = vec4(1.0, 1.0, 1.0, 1.0); break;
            case 1: tColor = vec4(0.0, 0.0, 0.0, 1.0); break;
            case 2: tColor = vec4(1.0, 0.0, 0.0, 1.0); break;
            case 3: tColor = vec4(0.0, 1.0, 0.0, 1.0); break;
            case 4: tColor = vec4(0.0, 0.0, 1.0, 1.0); break;
            case 5: tColor = vec4(1.0, 0.71, 0.76, 1.0); break;
        }
    });

    button.addEventListener("click", function(){
        numPolygons++;
        numIndices[numPolygons] = 0;
        start[numPolygons] = indexPoligono;
        render();
    });

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("click", function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = 2 * (event.clientX - rect.left) / canvas.width - 1;
        var y = 2 * (rect.bottom - event.clientY) / canvas.height - 1;
        var t = vec2(x, y);

        switch (option) {
            case 0:
                pointsIndividuais.push(t);
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
                gl.bufferSubData(gl.ARRAY_BUFFER, 8 * indexPonto, flatten(t));

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId1);
                gl.bufferSubData(gl.ARRAY_BUFFER, 16 * indexPonto, flatten(tColor));

                indexPonto++;
                render();
                break;
            case 1:
                pointsLinhas.push(t);
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
                gl.bufferSubData(gl.ARRAY_BUFFER, 8 * indexLinha, flatten(t));

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId2);
                gl.bufferSubData(gl.ARRAY_BUFFER, 16 * indexLinha, flatten(tColor));

                indexLinha++;
                render();
                break;
            case 2:
                pointsPoligono.push(t);
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferId3);
                gl.bufferSubData(gl.ARRAY_BUFFER, 8 * indexPoligono, flatten(t));

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId3);
                gl.bufferSubData(gl.ARRAY_BUFFER, 16 * indexPoligono, flatten(tColor));

                numIndices[numPolygons]++;
                indexPoligono++;
                break;
        }
    });

    canvas.addEventListener("wheel", function(event) { 
        delta = event.deltaY < 0 ? 1 : -1; 
        event.preventDefault(); 
    });

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Configuração do programa de pontos
    program1 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program1);

    bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    colorBufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    // Configuração do programa de linhas
    program2 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program2);

    bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    colorBufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    // Configuração do programa de poligonos
    program3 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program3);

    bufferId3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId3);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    colorBufferId3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId3);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    thetaLoc = gl.getUniformLocation(program3, "theta");
    baricentroLoc = gl.getUniformLocation(program3, "t");
    baricentroLoc2 = gl.getUniformLocation(program3, "t2");
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += delta * scrollSpeed;

    if (pointsIndividuais.length > 0) {
        gl.useProgram(program1);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
        vPosition = gl.getAttribLocation(program1, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId1);
        vColor = gl.getAttribLocation(program1, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        gl.drawArrays(gl.POINTS, 0, indexPonto);
    }

    if (pointsLinhas.length > 0) {
        gl.useProgram(program2);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
        vPosition = gl.getAttribLocation(program2, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId2);
        vColor = gl.getAttribLocation(program2, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        gl.drawArrays(gl.LINES, 0, indexLinha);
    }

    if (numPolygons > 0) {
        gl.useProgram(program3);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId3);
        vPosition = gl.getAttribLocation(program3, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId3);
        vColor = gl.getAttribLocation(program3, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        calcularBaricentros();
        gl.uniform1f(thetaLoc, theta);
        for (var i = 0; i < numPolygons; i++) {
            var baricentro = baricentros[i];
            gl.uniform2fv(baricentroLoc, baricentro);
            gl.uniform2fv(baricentroLoc2, baricentro);
            gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
        }
    }

    requestAnimFrame(render);
}

function flatten(a) {
    return new Float32Array(a.reduce((acc, val) => acc.concat(val), []));
}

function calcularBaricentros() {
    baricentros = [];
    for (var i = 0; i < numPolygons; i++) {
        var vertices = pointsPoligono.slice(start[i], start[i] + numIndices[i]);
        var baricentro = calcularBaricentro(vertices);
        baricentros.push(baricentro);
    }
}

function calcularBaricentro(vertices) {
    var Cx = 0, Cy = 0;
    var numVertices = vertices.length;

    for (var i = 0; i < numVertices; i++) {
        Cx += vertices[i][0];
        Cy += vertices[i][1];
    }

    return [Cx / numVertices, Cy / numVertices];
}
