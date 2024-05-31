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

function isCrossFormed(cubeState) {
    // Assuming the top face is at index 0
    var topFace = cubeState[0];

    // Check the edge positions (up, down, left, right) of the top face
    if (topFace[0][1] === topFace[1][1] && topFace[1][1] === topFace[2][1] && 
        topFace[1][0] === topFace[1][1] && topFace[1][2] === topFace[1][1]) {
        return true;
    }

    return false;
}

function areCornersCorrect(cubeState) {
    // Get the color of the center piece of the top face
    var topColor = cubeState[0][1][1];

    // Get the colors of the center pieces of the adjacent faces
    var frontColor = cubeState[1][1][1];
    var rightColor = cubeState[2][1][1];
    var backColor = cubeState[3][1][1];
    var leftColor = cubeState[4][1][1];

    // Check if the corner pieces match the center pieces
    if (cubeState[0][0][0] !== topColor || cubeState[1][0][2] !== frontColor || cubeState[4][0][0] !== leftColor ||  // Front-left corner
        cubeState[0][0][2] !== topColor || cubeState[1][0][0] !== frontColor || cubeState[2][0][2] !== rightColor ||  // Front-right corner
        cubeState[0][2][2] !== topColor || cubeState[2][0][0] !== rightColor || cubeState[3][0][2] !== backColor ||  // Back-right corner
        cubeState[0][2][0] !== topColor || cubeState[3][0][0] !== backColor || cubeState[4][0][2] !== leftColor) {  // Back-left corner
        return false;
    }

    return true;
}


function solveLayer1(cubeState) {
    var solution = [];

    // Step 1: Solve the cross
    var topColor = cubeState[0][1][1]; // Center color of the top face

    function applyMove(cubeState, move) {
        // Apply the move to the cube state (update cubeState)
        // For simplicity, we're just updating the solution list here
        solution.push(move);
    }

    function moveEdgeToTop(face, edgePos, targetPos) {
        // Example logic to move an edge piece to the top face
        // This is simplified and needs to be expanded for all possible positions

        if (face === 1) {
            if (edgePos[0] === 1 && edgePos[1] === 0) { // Left middle edge
                applyMove(cubeState, 'L');
                applyMove(cubeState, 'U');
                applyMove(cubeState, 'L\'');
            } else if (edgePos[0] === 1 && edgePos[1] === 2) { // Right middle edge
                applyMove(cubeState, 'R');
                applyMove(cubeState, 'U');
                applyMove(cubeState, 'R\'');
            }
            // Add other cases for face 1 edges here
        } else if (face === 2) {
            if (edgePos[0] === 0 && edgePos[1] === 1) { // Top middle edge
                applyMove(cubeState, 'U');
                applyMove(cubeState, 'B\'');
                applyMove(cubeState, 'U\'');
                applyMove(cubeState, 'B');
            }
            // Add other cases for face 2 edges here
        }
        // Add cases for other faces (3, 4, 5)
    }

    // Loop through the faces to find and move the edge pieces to form a cross on the top face
    for (var face = 1; face <= 5; face++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                if ((j === 1 || k === 1) && cubeState[face][j][k] === topColor) {
                    moveEdgeToTop(face, [j, k], [0, 1, 1]); // Example target position, needs actual target
                }
            }
        }
    }

    // Step 2: Position the corners
    function positionCorner(cornerPos, targetPos) {
        // Example logic to position a corner piece correctly
        // This needs to be expanded to handle all possible corner positions and rotations
        applyMove(cubeState, 'R');
        applyMove(cubeState, 'U');
        applyMove(cubeState, 'R\'');
        // Add actual logic for correct corner positioning
    }

    // Example of corner movements
    var cornerPositions = [
        [[0, 0, 0], [1, 2, 0]], // Example positions, replace with actual positions
        [[0, 0, 2], [1, 2, 2]],
        [[0, 2, 0], [1, 0, 0]],
        [[0, 2, 2], [1, 0, 2]]
    ];

    cornerPositions.forEach(function(pos) {
        positionCorner(pos[0], pos[1]);
    });

    return solution;
}

function solveLayer2(cubeState) {
    var solution = [];
    
    // The middle layer edges are placed between faces 1, 2, 3, and 4.
    
    // Find each middle layer edge piece and place it correctly
    for (var i = 1; i <= 4; i++) { // Faces 1 to 4
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                if ((j == 1 && k != 1) || (k == 1 && j != 1)) { // Only check edges
                    var edgePiece = cubeState[i][j][k];
                    // Move the edge piece to the middle layer
                    // This will involve checking the current position of the edge
                    // and using algorithms to move it to the correct middle layer position
                }
            }
        }
    }

    return solution;
}
function solveLayer3(cubeState) {
    var solution = [];
    
    // Step 1: Orient the last layer edges
    // This step involves using algorithms to orient the top edges correctly.
    
    // Step 2: Permute the last layer edges
    // Use algorithms to permute the edges correctly.

    // Step 3: Orient the last layer corners
    // Use algorithms to orient the top corners correctly.

    // Step 4: Permute the last layer corners
    // Finally, permute the corners to solve the cube.

    return solution;
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

    //var solution2 = solveLayer2(cubeState);
    //executeSolution(solution2);

    //var solution3 = solveLayer3(cubeState);
    //executeSolution(solution3);
}

document.ondragstart = function () { return false; }
window.addEventListener('load', function() {
    assembleCube();
});

scene.addEventListener('mousedown', mousedown);
document.getElementById('solveButton').addEventListener('click', solveCube);