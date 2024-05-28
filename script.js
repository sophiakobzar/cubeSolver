var colors = ['blue', 'green', 'white', 'yellow', 'orange', 'red'],
    pieces = document.getElementsByClassName('piece');
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
        if (passed >= 300)
            return swapPieces(face, 3 - 2 * cw);
        requestAnimationFrame(rotatePieces);
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

function parseCubeState() {
    const cubeState = Array(6).fill(null).map(() => Array(9).fill(''));
    const faceMap = {
        'left': 4,
        'right': 1,
        'top': 2,
        'bottom': 3,
        'back': 0,
        'front': 5
    };

    Array.from(pieces).forEach(piece => {
        const [x, y, z] = determinePieceIndex(piece);
        Array.from(piece.children).forEach(face => {
            if (face.firstChild) {
                const colorClass = face.firstChild.className.split(' ').pop();
                const colorCode = {
                    'white': 'W',
                    'orange': 'O',
                    'green': 'G',
                    'red': 'R',
                    'blue': 'B',
                    'yellow': 'Y'
                }[colorClass];
                
                const faceIndex = faceMap[face.className.split(' ')[1]];
                const stickerIndex = x + y * 3; // Convert x,y to a single index
				console.log(`face Index: ${faceIndex}`);
				console.log(`sticker Index: ${stickerIndex}`);
				
                // Print debug information
				//console.log(`Piece label: ${piece.dataset.label}`);
                //console.log(`Sticker index: ${stickerIndex}`);
                console.log(`Color: ${colorCode}`);
				//console.log(`Face index: ${faceIndex}`);
                //console.log(`Location: (${x}, ${y}, ${z})`);
                cubeState[faceIndex][stickerIndex] = new Sticker(colorCode, [x, y, z]);
            }
        });
    });
	//console.log(cubeState);
    return cubeState;
}


function determinePieceIndex(piece) {
    const index = Array.prototype.indexOf.call(pieces, piece);

    // Mapping piece index to face indices
    const pieceFaceIndices = {
        0: [0, 0, 0], 1: [1, 0, 0], 2: [2, 0, 0],
        3: [1, 1, 0], 4: [1, 1, 0], 5: [2, 1, 0],
        6: [0, 2, 0], 7: [1, 2, 0], 8: [2, 2, 0],

        9: [0, 0, 1], 10: [1, 0, 1], 11: [2, 0, 1],
        12: [0, 1, 1], 13: [1, 1, 1], 14: [2, 1, 1],
        15: [0, 2, 1], 16: [1, 2, 1], 17: [2, 2, 1],

        18: [0, 0, 2], 19: [1, 0, 2], 20: [2, 0, 2],
        21: [0, 1, 2], 22: [1, 1, 2], 23: [2, 1, 2],
        24: [0, 2, 2], 25: [1, 2, 2]
    };

    return pieceFaceIndices[index];
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
 function getCubeState() {
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
function solveCube() {
    console.log('Solve function called');
	const cubeState = parseCubeState();
	const importString = convertToImportString(cubeState);
    console.log("We get");
	console.log(importString);
	console.log("We needed");
	const cubeState2 = getCubeState();
	const importString2 = convertToImportString(cubeState2);
    console.log(importString2);
    return importString;
}

document.ondragstart = function () { return false; }
window.addEventListener('load', assembleCube);
scene.addEventListener('mousedown', mousedown);
document.getElementById('solveButton').addEventListener('click', solveCube);