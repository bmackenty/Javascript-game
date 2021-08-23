class Game {
    constructor() {
        this.objectList = []
    }

    getPlayer() {
        for (var object of this.objectList) {
            if (object.type == "player") {
                return object;
            }
        }
        console.log("FATAL: PLAYER NOT IN OBJECT LIST")
        return null;
    }

    movePlayer(xChange, yChange) {
        var newX = this.getPlayer().x + xChange;
        var newY = this.getPlayer().y + yChange;
        
        if (game.objectIsAt("mountain", newX, newY))
            return false;
        if (newX < 0 || gridSize[0] < newX)
            return false;
        if (newY < 0 || gridSize[1] < newY)
            return false;

        this.getPlayer().x += xChange;
        this.getPlayer().y += yChange;

        drawMap();

        return true;
    }

    updateViewport() {
        var playerX = this.getPlayer().x;
        var playerY = this.getPlayer().y;

        if (Math.abs(playerX - viewportSize[0][0]) <= 3) {
            viewportSize[0][0]--;
            viewportSize[0][1]--;
        }

        if (Math.abs(playerX - viewportSize[0][1]) <= 3) {
            viewportSize[0][1]++;
            viewportSize[0][0]++;
        }

        if (Math.abs(playerY - viewportSize[1][0]) <= 3) {
            viewportSize[1][0]--;
            viewportSize[1][1]--;
            
        }

        if (Math.abs(playerY - viewportSize[1][1]) <= 3) {
            viewportSize[1][1]++;
            viewportSize[1][0]++;
        }
    }

    addObject(objectType, x, y, object) {
        this.objectList.push({
            type: objectType,
            x: x,
            y: y,
            data: object
        })
    }

    objectAt(x, y) { // TODO Add some kind of player z-index
        var objects = this.objectsAt(x, y)
        var objectToDisplay;
        var currentZIndex = 0;
        for (var object of objects) {
            switch (object.type) {
                case "tree":
                    if (currentZIndex < 1) {
                        currentZIndex = 1;
                        objectToDisplay = object;
                    }
                    break;
                case "mountain":
                    if (currentZIndex < 8) {
                        currentZIndex = 8;
                        objectToDisplay = object;
                    }
                    break;
                case "player":
                    if (currentZIndex < 10) {
                        currentZIndex = 10;
                        objectToDisplay = object;
                    }
                    break;
            }
        }

        return objectToDisplay;
    }

    objectsAt(x, y) {
        var objects = []
        for (var object of this.objectList) {
            if (object.x == x && object.y == y) {
                objects.push(object);
            }
        }
        return objects;
    }

    objectIsAt(objectType, x, y) {
        for (var object of this.objectsAt(x, y,)) {
            if (object.type == objectType) {
                return true;
            }
        }
        return false;
    }
}

class Player {
    constructor(name) {
        this.name = name;
    }

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:red" title="You."></i>';
    }
}

class Tree {
    constructor(type) {
        this.type = type;
    }

    get html() {
        switch (this.type) {
            case 0:

        }
        return '<i class="fas fa-tree fa-fw" style="color:#229954" title="A grue tree."></i>'
    }
}

class Mountain {
    get html() {
        return '<i class="fas fa-mountain fa-fw" style="color:grey"  title="A mountain"></i>';
    }
}

function move(direction) {
    switch (direction) {
        case "l":
            game.movePlayer(-1, 0);
            break;
        case "r":
            game.movePlayer(1, 0);
            break;
        case "u":
            game.movePlayer(0, 1);
            break;
        case "d":
            game.movePlayer(0, -1);
            break;
    }
} 

function drawMap() {
    var mapHTML = "";
    game.updateViewport();

    console.log("tile: outside?");
    console.log("current player position: " + game.getPlayer().x + ":" + game.getPlayer().y)
    console.log(tileOutsideMap(6, 2))

    for (var y = viewportSize[1][0]; y < viewportSize[1][1]; y++) {
        mapHTML+='<div class="map-row">'
        for (var x = viewportSize[0][0]; x < viewportSize[0][1]; x++) {
            if (tileOutsideMap(x, y)) {
                mapHTML+= '<div class="map-loc"><i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"  title=\"A mountain\"></i></div>';
                continue;
            }

            var object = game.objectAt(x, y)
            if (object) {
                mapHTML += `<div class="map-loc">${object.data.html}</div>`
            } else {
                mapHTML+='<div class="map-loc"><i class=\"fas fa-ellipsis-h fa-fw\" style=\"color:#D2B48C\"></i></div>';
            }
        }
        mapHTML+='</div>'
    }

    document.getElementById("main_map").innerHTML = mapHTML;
}

// Helper function for drawMap()
function tileOutsideMap(x, y) {
    return (x > gridSize[0] || x < 0) || (y > gridSize[1] || y < 0)
}

function generateMap() {
    for (var x = 0; x < gridSize[0]; x++) {
        for (var y = 0; y < gridSize[1]; y++) {
            if (Math.random() > 0.5) {
                game.addObject("tree", x, y, new Tree())
            }
        }
    }

    game.addObject("player", startingPos[0], startingPos[1], new Player());
}

function registerListeners() {
    document.addEventListener('keyup', (event) => {
        if (event.defaultPrevented)
            return;

        var key = event.key;

        switch (key) {
            case "ArrowRight":
                move("r")
                break;
            case "ArrowLeft":
                move("l")
                break;
            case "ArrowUp":
                move("u")
                break;
            case "ArrowDown":
                move("d")
                break;
        }
    })
}

/*
End of functions
*/

var startingPos = [10, 10]
var game = new Game();
var gridSize = [40, 40] // [X, Y]
var viewportSize = [[0, 33], [0, 33]];

generateMap();
drawMap();
registerListeners();