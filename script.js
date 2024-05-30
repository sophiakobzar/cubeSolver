var colors = ['blue', 'green', 'white', 'yellow', 'orange', 'red'],
    pieces = document.getElementsByClassName('piece');
	
var _2DCube;
class Sticker {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }
}

function mx(i, j) {
    return ([2, 4, 3, 5][j % 4 | 0] + i % 2 * ((j | 0) % 4 * 2 + 3) + 2 * (i / 2 | 0)) % 6;
}

function getAxis(face) {
    return String.fromCharCode('X'.charCodeAt(0) + face / 2); // X, Y or Z
}

function assembleCube() {
    function moveto(face) {
        id = id + (1 << face);
        pieces[i].children[face].appendChild(document.createElement('div'))
            .setAttribute('class', 'sticker ' + colors[face]);
        return 'translate' + getAxis(face) + '(' + (face % 2 * 4 - 2) + 'em)';
    }
    for (var id, x, i = 0; id = 0, i < 26; i++) {
        x = mx(i, i % 18);
        pieces[i].style.transform = 'rotateX(0deg)' + moveto(i % 6) +
            (i > 5 ? moveto(x) + (i > 17 ? moveto(mx(x, x + 2)) : '') : '');
        pieces[i].setAttribute('id', 'piece' + id);
    }
}

function getPieceBy(face, index, corner) {
    return document.getElementById('piece' +
        ((1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner));
}

function swapPieces(face, times) {
    for (var i = 0; i < 6 * times; i++) {
        var piece1 = getPieceBy(face, i / 2, i % 2),
            piece2 = getPieceBy(face, i / 2 + 1, i % 2);
        for (var j = 0; j < 5; j++) {
            var sticker1 = piece1.children[j < 4 ? mx(face, j) : face].firstChild,
                sticker2 = piece2.children[j < 4 ? mx(face, j + 1) : face].firstChild,
                className = sticker1 ? sticker1.className : '';
            if (className)
                sticker1.className = sticker2.className,
                    sticker2.className = className;
        }
    }
}

function animateRotation(face, cw, currentTime) {
    var k = .3 * (face % 2 * 2 - 1) * (2 * cw - 1),
        qubes = Array(9).fill(pieces[face]).map(function (value, index) {
            return index ? getPieceBy(face, index / 2, index % 2) : value;
        });
    (function rotatePieces() {
        var passed = Date.now() - currentTime,
            style = 'rotate' + getAxis(face) + '(' + k * passed * (passed < 300) + 'deg)';
        qubes.forEach(function (piece) {
            piece.style.transform = piece.style.transform.replace(/rotate.(\S+)/, style);
        });
        if (passed >= 300) {
            swapPieces(face, 3 - 2 * cw);
        } else {
            requestAnimationFrame(rotatePieces);
        }
    })();
}


function mousedown(md_e) {
    var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number),
        element = md_e.target.closest('.element'),
        face = [].indexOf.call((element || cube).parentNode.children, element);

    function mousemove(mm_e) {
        if (element) {
            var gid = /\d/.exec(document.elementFromPoint(mm_e.pageX, mm_e.pageY).id);
            if (gid && gid.input.includes('anchor')) {
                mouseup();
                var e = element.parentNode.children[mx(face, Number(gid) + 3)].hasChildNodes();
                animateRotation(mx(face, Number(gid) + 1 + 2 * e), e, Date.now());
            }
        } else {
            pivot.style.transform =
                'rotateX(' + (startXY[0] - (mm_e.pageY - md_e.pageY) / 2) + 'deg)' +
                'rotateY(' + (startXY[1] + (mm_e.pageX - md_e.pageX) / 2) + 'deg)';
        }
    }

    function mouseup() {
        document.body.appendChild(guide);
        scene.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        scene.addEventListener('mousedown', mousedown);
    }

    (element || document.body).appendChild(guide);
    scene.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    scene.removeEventListener('mousedown', mousedown);
}

function getCubeState() {
    // Initialize a 3D array to represent the cube
    var cubeState = new Array(6);
    for (var i = 0; i < 6; i++) {
        cubeState[i] = new Array(3);
        for (var j = 0; j < 3; j++) {
            cubeState[i][j] = new Array(3);
        }
    }

    // Iterate over each piece
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];

        // Iterate over each element of the piece
        for (var j = 0; j < piece.children.length; j++) {
            var element = piece.children[j];

            // If the element has a sticker (child div), get its color
            if (element.firstChild) {
                var color = element.firstChild.className.split(' ')[1];

                // Convert the color to a number for easier processing later
                var colorNum = colors.indexOf(color);

                // Update the cube state
                cubeState[j][i % 3][Math.floor(i / 3)] = colorNum;
            }
        }
    }

    return cubeState;
}

function solveLayer1(cubeState) {
    var solution = [];

    // Step 1: Solve the cross
    // This will depend on the current state of the cube.
    // You'll need to add moves to the solution to get a cross on the top face.
    // For now, let's assume that we need to rotate the Front face clockwise and then the Right face clockwise.
    solution.push('F');
    //solution.push('R');

    // Step 2: Position the corners
    // This will also depend on the current state of the cube.
    // You'll need to add more moves to the solution to get the corners in the right position.
    // For now, let's assume that we need to rotate the Up face clockwise.
    //solution.push('U');

    return solution;
}

function solveLayer2(cubeState) {
    // This is where you would implement your solving algorithm.
    // For now, let's just return a dummy solution.
    return [];
}
function solveLayer3(cubeState) {
    // This is where you would implement your solving algorithm.
    // For now, let's just return a dummy solution.
    return [];
}

function executeSolution(solution) {
    // Iterate over each move in the solution
    for (var i = 0; i < solution.length; i++) {
        // Get the current move
        var move = solution[i];

        // Determine the face to rotate and the direction
        var face, cw;
        switch (move) {
            case 'U':
                face = 0; // Up face
                cw = 1; // Clockwise
                break;
            case "U'":
                face = 0; // Up face
                cw = 0; // Counterclockwise
                break;
            case 'D':
                face = 1; // Down face
                cw = 1; // Clockwise
                break;
            case "D'":
                face = 1; // Down face
                cw = 0; // Counterclockwise
                break;
            case 'L':
                face = 2; // Left face
                cw = 1; // Clockwise
                break;
            case "L'":
                face = 2; // Left face
                cw = 0; // Counterclockwise
                break;
            case 'R':
                face = 3; // Right face
                cw = 1; // Clockwise
                break;
            case "R'":
                face = 3; // Right face
                cw = 0; // Counterclockwise
                break;
            case 'F':
                face = 4; // Front face
                cw = 1; // Clockwise
                break;
            case "F'":
                face = 4; // Front face
                cw = 0; // Counterclockwise
                break;
            case 'B':
                face = 5; // Back face
                cw = 1; // Clockwise
                break;
            case "B'":
                face = 5; // Back face
                cw = 0; // Counterclockwise
                break;
        }

        // Execute the move
        animateRotation(face, cw, Date.now());
    }
}

function solveCube() {
    // Get the current state of the cube
    var cubeState = getCubeState();

    // Solve each layer and execute the solution
    var solution1 = solveLayer1(cubeState);
    executeSolution(solution1);

    var solution2 = solveLayer2(cubeState);
    executeSolution(solution2);

    var solution3 = solveLayer3(cubeState);
    executeSolution(solution3);
}

document.ondragstart = function () { return false; }
window.addEventListener('load', function() {
    assembleCube();
});

scene.addEventListener('mousedown', mousedown);
document.getElementById('solveButton').addEventListener('click', solveCube);