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

    // Update the 2D cube state and log it
    update2DCube(face, times % 2 === 1); // times % 2 === 1 indicates a 90-degree rotation
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

function convertToImportString(cubeState) {
    const rows = [];

    // Top face (index 2)
    for (let i = 0; i < 3; i++) {
        rows.push(cubeState[2].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
    }

    // Middle part: Left, Front, Right, Back faces (indices 0, 5, 1, 4)
    for (let i = 0; i < 3; i++) {
        const row = [];
        row.push(cubeState[0].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
        row.push(cubeState[5].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
        row.push(cubeState[1].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
        row.push(cubeState[4].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
        rows.push(row.join(','));
    }

    // Bottom face (index 3)
    for (let i = 0; i < 3; i++) {
        rows.push(cubeState[3].slice(i * 3, i * 3 + 3).map(sticker => sticker.color).join(','));
    }

    return rows.join('\n');
}
 function getInitialCubeState() {
    return [
        [ // Left face (index 0)
            { color: 'O' }, { color: 'O' }, { color: 'O' },
            { color: 'O' }, { color: 'O' }, { color: 'O' },
            { color: 'O' }, { color: 'O' }, { color: 'O' }
        ],
        [ // Right face (index 1)
			{ color: 'R' }, { color: 'R' }, { color: 'R' },
            { color: 'R' }, { color: 'R' }, { color: 'R' },
            { color: 'R' }, { color: 'R' }, { color: 'R' }
        ],
        [ // Top face (index 2)
            { color: 'W' }, { color: 'W' }, { color: 'W' },
            { color: 'W' }, { color: 'W' }, { color: 'W' },
            { color: 'W' }, { color: 'W' }, { color: 'W' }
        ],
        [ // Bottom face (index 3)
            { color: 'Y' }, { color: 'Y' }, { color: 'Y' },
            { color: 'Y' }, { color: 'Y' }, { color: 'Y' },
            { color: 'Y' }, { color: 'Y' }, { color: 'Y' }
        ],
        [ // Back face (index 4)
            { color: 'B' }, { color: 'B' }, { color: 'B' },
            { color: 'B' }, { color: 'B' }, { color: 'B' },
            { color: 'B' }, { color: 'B' }, { color: 'B' }
        ],
        [ // Front face (index 5)
            { color: 'G' }, { color: 'G' }, { color: 'G' },
            { color: 'G' }, { color: 'G' }, { color: 'G' },
            { color: 'G' }, { color: 'G' }, { color: 'G' }
        ]
    ];
}

function update2DCube(face, clockwise) {
    const faceMap = {
        0: [2, 3, 4, 5], // Left face affects top, bottom, back, and front faces
        1: [2, 5, 3, 4], // Right face affects top, front, bottom, and back faces
        2: [0, 5, 1, 4], // Top face affects left, front, right, and back faces
        3: [0, 4, 1, 5], // Bottom face affects left, back, right, and front faces
        4: [2, 0, 3, 1], // Back face affects top, left, bottom, and right faces
        5: [2, 1, 3, 0]  // Front face affects top, right, bottom, and left faces
    };

    const rowMap = {
        0: [[6, 3, 0], [8, 5, 2]], // Left face row positions
        1: [[8, 5, 2], [6, 3, 0]], // Right face row positions
        2: [[0, 1, 2], [0, 1, 2]], // Top face row positions
        3: [[6, 7, 8], [6, 7, 8]], // Bottom face row positions
        4: [[0, 3, 6], [8, 5, 2]], // Back face row positions
        5: [[8, 7, 6], [0, 3, 6]]  // Front face row positions
    };

    function rotateFace(faceArray, cw) {
        const rotated = new Array(9);
        const map = cw ? [6, 3, 0, 7, 4, 1, 8, 5, 2] : [2, 5, 8, 1, 4, 7, 0, 3, 6];
        for (let i = 0; i < 9; i++) {
            rotated[i] = faceArray[map[i]];
        }
        return rotated;
    }

    // Rotate the main face
    _2DCube[face] = rotateFace(_2DCube[face], clockwise);

    // Update the adjacent rows
    const adjacentFaces = faceMap[face];
    const currentRows = adjacentFaces.map((adjFace, i) => {
        const row = rowMap[face][i % 2];
        return row.map(index => _2DCube[adjFace][index]);
    });

    if (clockwise) {
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const row = rowMap[face][i % 2];
            row.forEach((index, j) => {
                _2DCube[adjacentFaces[next]][index] = currentRows[i][j];
            });
        }
    } else {
        for (let i = 3; i >= 0; i--) {
            const next = (i + 1) % 4;
            const row = rowMap[face][i % 2];
            row.forEach((index, j) => {
                _2DCube[adjacentFaces[next]][index] = currentRows[i][j];
            });
        }
    }

    // Log the updated 2D cube state
    console.log('Updated _2DCube state:', _2DCube);
}


function solveCube() {
    console.log('Solve function called');
}

document.ondragstart = function () { return false; }
window.addEventListener('load', function() {
    assembleCube();
     _2DCube = getInitialCubeState();
	 console.log(_2DCube)
});

scene.addEventListener('mousedown', mousedown);
document.getElementById('solveButton').addEventListener('click', solveCube);