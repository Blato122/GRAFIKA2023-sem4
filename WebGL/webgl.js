// shader:
const vertexShaderTxt = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`

// shader:
const fragmentShaderTxt = `
    precision mediump float;

    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0); // R, G, B, opacity
    }
`
// problem: "diagonal smear"
// https://stackoverflow.com/questions/60212615/how-to-properly-blend-colors-across-two-triangles-and-remove-diagonal-smear

let Triangle = function () {
// canvas color:
    let canvas = document.getElementById('main-canvas');
    let gl = canvas.getContext('webgl');

    if (!gl) {
        alert('webgl not supported');
    }

    gl.clearColor(0.5, 0.5, 0.9, 1.0); // R, G, B, opacity
    gl.clear(gl.COLOR_BUFFER_BIT);

// shaders:
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    //                 X              Y
    let aspect = canvas.width / canvas.height;

    // SQUARE
    let commonColor1 = Array.from({length: 3}, () => Math.random());
    let commonColor2 = Array.from({length: 3}, () => Math.random());
    let triangleVert = [
        // -1 <= X, Y >= 1
        // 0 -> middle
        -0.5, -0.5 * aspect,    commonColor1[0], commonColor1[1], commonColor1[2], 
        -0.5,  0.5 * aspect,    Math.random(), Math.random(), Math.random(),
         0.5,  0.5 * aspect,    commonColor2[0], commonColor2[1], commonColor2[2],
         
        -0.5, -0.5 * aspect,    commonColor1[0], commonColor1[1], commonColor1[2],
         0.5, -0.5 * aspect,    Math.random(), Math.random(), Math.random(), 
         0.5,  0.5 * aspect,    commonColor2[0], commonColor2[1], commonColor2[2],      
    ]


    // HEXAGON
    let x = 0;
    let y = 0;
    let r = 0.2;
    let yy = r * Math.sqrt(3) / 2;

    let commonColor3 = Array.from({length: 3}, () => Math.random());
    let hexagonVert = [
        x,              y * aspect,     Math.random(), Math.random(), Math.random(), // center
        x + (r / 2),    yy * aspect,    commonColor3[0], commonColor3[1], commonColor3[2],  // first
        x + r,          y * aspect,     Math.random(), Math.random(), Math.random(),
        x + (r / 2),    -yy * aspect,   Math.random(), Math.random(), Math.random(),
        x - (r / 2),    -yy * aspect,   Math.random(), Math.random(), Math.random(),
        x - r,          y * aspect,     Math.random(), Math.random(), Math.random(),
        x - (r / 2),    yy * aspect,    Math.random(), Math.random(), Math.random(),
        x + (r / 2),    yy * aspect,    commonColor3[0], commonColor3[1], commonColor3[2], // last (same as first)
    ];

    // DRAW SQUARE
    const triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVert), gl.STATIC_DRAW);

    const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        posAttrLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0,
    );

    gl.vertexAttribPointer(
        colorAttrLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT, // offset (after how many elements)
    );

    gl.enableVertexAttribArray(posAttrLocation);
    gl.enableVertexAttribArray(colorAttrLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 3 -> 6 if 2 triangles

    // DRAW HEXAGON
    const hexagonVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVert), gl.STATIC_DRAW);

    const posAttrLocation2 = gl.getAttribLocation(program, 'vertPosition');
    const colorAttrLocation2 = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        posAttrLocation2,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0,
    );

    gl.vertexAttribPointer(
        colorAttrLocation2,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT, // offset (after how many elements)
    );

    gl.enableVertexAttribArray(posAttrLocation2);
    gl.enableVertexAttribArray(colorAttrLocation2);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
} 
