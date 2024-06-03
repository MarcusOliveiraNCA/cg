var canvas;
var gl;
var pointsIndividuais = [];
var pointsLinhas = [];
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

var t;
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
    var desenhar = document.getElementById("buttonDraw");
    var clear = document.getElementById("buttonClear");

    menu.addEventListener("click", function() {
        option = menu.selectedIndex;
    });

    menuColor.addEventListener("click", function() {
        cindex = menuColor.selectedIndex;
        if (cindex == 0) {
            tColor = vec4(1.0, 1.0, 1.0, 1.0);
        } else if (cindex == 1) {
            tColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else if (cindex == 2) {
            tColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else if (cindex == 3) {
            tColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else if (cindex == 4) {
            tColor = vec4(0.0, 0.0, 1.0, 1.0);
        } else if (cindex == 5) {
            tColor = vec4(1.0, 0.71, 0.76, 1.0);
        }
        console.log(tColor);
    });

    desenhar.addEventListener("click", function(){
        numPolygons++;
        numIndices[numPolygons] = 0;
        start[numPolygons] = indexPoligono;
        render();
    });

    clear.addEventListener("click", function(){
        pointsIndividuais = [];
        pointsLinhas = [];
        numPolygons = 0;
        numIndices = [];
        numIndices[0] = 0;
        start = [0];
        indexPoligono = 0;
        indexPonto = 0;
        indexLinha = 0;
        render();
    });


    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("click", function(event){
        if(option == 0){
            var rect = canvas.getBoundingClientRect();
            var x = 2 * (event.clientX - rect.left) / canvas.width - 1;
            var y = 2 * (rect.bottom - event.clientY) / canvas.height - 1;
            var t = vec2(x, y);

            pointsIndividuais.push(t);
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*indexPonto, flatten(t));

            gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId1 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*indexPonto, flatten(tColor));

            indexPonto++;
            render()
        }else if(option == 1){
            var rect = canvas.getBoundingClientRect();
            var x = 2 * (event.clientX - rect.left) / canvas.width - 1;
            var y = 2 * (rect.bottom - event.clientY) / canvas.height - 1;
            var t = vec2(x, y);
            
            pointsLinhas.push(t);
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*indexLinha, flatten(t));
            
            gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId2 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*indexLinha, flatten(tColor));

            indexLinha++;
            render()
        }else if(option == 2){
            var rect = canvas.getBoundingClientRect();
            var x = 2 * (event.clientX - rect.left) / canvas.width - 1;
            var y = 2 * (rect.bottom - event.clientY) / canvas.height - 1;
            var t = vec2(x, y);

            gl.bindBuffer( gl.ARRAY_BUFFER, bufferId3 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*indexPoligono, flatten(t));

            gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId3 );
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*indexPoligono, flatten(tColor));

            numIndices[numPolygons]++;
            indexPoligono++;
        }
        

    } );


    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Configuração do programa de pontos
    program1 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program1);

    bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    // vPosition = gl.getAttribLocation(program1, "vPosition");
    // gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);

    colorBufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    // vColor = gl.getAttribLocation(program1, "vColor");
    // gl.vertexAttribPointer(vColor, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);


    // Configuração do programa de linhas
    program2 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program2);

    bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    // vPosition = gl.getAttribLocation(program2, "vPosition");
    // gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);

    colorBufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    // vColor = gl.getAttribLocation(program2, "vColor");
    // gl.vertexAttribPointer(vColor, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);


    // Configuração do programa de poligonos
    program3 = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program3);

    bufferId3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId3);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * 1000, gl.STATIC_DRAW);

    // vPosition = gl.getAttribLocation(program3, "vPosition");
    // gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);

    colorBufferId3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId3);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 1000, gl.STATIC_DRAW);

    // vColor = gl.getAttribLocation(program3, "vColor");
    // gl.vertexAttribPointer(vColor, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);
    

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

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
        // if(pointsLinhas.length % 2 == 0){
            gl.drawArrays(gl.LINES, 0, indexLinha);
        // }else{
        //     gl.drawArrays(gl.LINES, 0, pointsLinhas.length-1);
        // }
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
        for(var i=0; i<numPolygons; i++) {
            gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
        }
    }

    requestAnimFrame(render);
}

function flatten(a) {
    return new Float32Array(a.reduce((acc, val) => acc.concat(val), []));
}