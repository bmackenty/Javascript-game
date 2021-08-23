class Game {
    constructor() {
        this.objectList = []
    }

    /**
     * Gets the player
     * @returns {Object} The player object
     */
    getPlayer() {
        for (var object of this.objectList) {
            if (object.type == "player") {
                return object;
            }
        }

        // This should never happen! (The player is not removed anywhere in the code)
        console.log("FATAL: PLAYER NOT IN OBJECT LIST")
        return null;
    }

    /**
     * Attempts to move the player
     * @param {number} xChange
     * @param {number} yChange
     * @returns {boolean} Whether the player has successfully moved or not 
     * (reasons why player didn't move might include attempting to walk outside the map or into a impassable object)
     */
    movePlayer(xChange, yChange) {
        var newX = this.getPlayer().x + xChange;
        var newY = this.getPlayer().y + yChange;
        
        // Loop through all the objects at the location the
        // player wants to move to and check if they're passable
        for (var object of game.objectsAt(newX, newY)) {
            if (object.data.passable == false) {
                return false;
            }
        }

        // If the player wants to move outside the map don't let him
        if (newX < 0 || gridSize[0] < newX)
            return false;
        if (newY < 0 || gridSize[1] < newY)
            return false;


        // Finally, after checking everything, move the player
        this.getPlayer().x += xChange;
        this.getPlayer().y += yChange;

        // After moving the player draw the map again
        drawMap();

        return true; // Return true (player successfully moved)
    }

    /**
     * Updates the viewport based on player location
     */
    updateViewport() {
        var playerX = this.getPlayer().x;
        var playerY = this.getPlayer().y;
        var modifiedViewport = false;

        // Check if the player is within 3 tiles of the border of the viewport
        // If yes then move the viewport to follow the player

        if (Math.abs(playerX - viewportSize[0][0]) <= 3) {
            viewportSize[0][0]--;
            viewportSize[0][1]--;
            modifiedViewport = true;
        }

        if (Math.abs(playerX - viewportSize[0][1]) <= 3) {
            viewportSize[0][1]++;
            viewportSize[0][0]++;
            modifiedViewport = true;
        }

        if (Math.abs(playerY - viewportSize[1][0]) <= 3) {
            viewportSize[1][0]--;
            viewportSize[1][1]--;
            modifiedViewport = true;
            
        }

        if (Math.abs(playerY - viewportSize[1][1]) <= 3) {
            viewportSize[1][1]++;
            viewportSize[1][0]++;
            modifiedViewport = true;
        }

        /*
        Since this function only updates the viewport by 1 square we want to make sure that if
        the player is closer than 3 tiles to the border that the viewport is still the same
        (A situation where this happens is if the player spawns close to the border)
        */
        if (modifiedViewport)
            this.updateViewport();
    }

    /**
     * 
     * @param {String} objectType The object type in a string
     * @param {Number} x The x coordinate the object will be placed in
     * @param {Number} y The y coordinate the object will be placed in
     * @param {Object} object The instance of the object (scroll down to OBJECTS)
     */
    addObject(objectType, x, y, object) {
        this.objectList.push({
            type: objectType,
            x: x,
            y: y,
            data: object
        })
    }

    /**
     * Gets the most important object at a location
     * @param {Number} x 
     * @param {Number} y 
     * @returns The object with the highest zIndex in a certain location
     * (most important, gets displayed above the other objects)
     */
    objectAt(x, y) {
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

    /**
     * Get all the objects in a certain location
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Array} Array of objects at the location
     */
    objectsAt(x, y) {
        var objects = []
        for (var object of this.objectList) {
            if (object.x == x && object.y == y) {
                objects.push(object);
            }
        }
        return objects;
    }

    /**
     * Checks if there is a object with the objectType specificed
     * in a certain location
     * @param {String} objectType
     * @param {Number} x 
     * @param {Number} y 
     * @returns 
     */
    objectIsAt(objectType, x, y) {
        for (var object of this.objectsAt(x, y,)) {
            if (object.type == objectType) {
                return true;
            }
        }
        return false;
    }
}

/*
===== OBJECTS
*/

class Object {

    constructor(props) {
        if (props) {
            this.passable = props.passable != undefined ? props.passable : true;
        }
    }

    // Default html value, in case something fails
    // or someone forgets to specify it (why?!)
    get html() {
        return 'ERROR';
    }
}

class Player extends Object {

    constructor(name) {
        super()
        this.name = name;
        this.health = 100;
    }

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:red" title="You."></i>';
    }
}

class Tree extends Object {

    constructor(type) {
        super({ passable: true });
        this.type = type;
    }

    get html() {
        switch (this.type) {
            case 0:
                return '<i class="fas fa-tree fa-fw" style="color:#229954" title="A grue tree."></i>'
            case 1:
                return '<i class="fas fa-tree fa-fw" style="color:green" title="A tall tree."></i>';
            case 2:
                return '<i class="fas fa-tree fa-fw" style="color:#387A19" title="An oak tree."></i>';
            case 3:
                return '<i class="fas fa-tree fa-fw" style="color:#176F43" title="A spruce tree."></i>';
            case 4:
                return '<i class="fas fa-tree fa-fw" style="color:#50CE0D" title="A willow tree."></i>';
            case 5:
                return '<i class="fas fa-tree fa-fw" style="color:#285A0D" title="An ash tree."></i>';
            case 6:
                return '<i class="fas fa-tree fa-fw" style="color:#3A572A" title="A fir tree."></i>';
            case 7:
                return '<i class="fas fa-tree fa-fw" style="color:#42B306" title="A birch tree."></i>';
            case 8:
                return '<i class="fas fa-tree fa-fw" style="color:#2E4720" title="A yew tree."></i>';
            default:
                return '<i class="fas fa-tree fa-fw" style="color:#387A19" title="An oak tree."></i>';
        }
        
    }
}

class Mountain extends Object {

    constructor() {
        super({ passable: false });
    }

    get html() {
        return '<i class="fas fa-mountain fa-fw" style="color:grey"  title="A mountain"></i>';
    }
}





/*
===== MAP FUNCTIONS
*/

function generateMap() {
    // Loop over all the X and Y coordinates of the map
    for (var x = 0; x <= gridSize[0]; x++) {
        for (var y = 0; y <= gridSize[1]; y++) {

            /*
            This really needs to be done better but
            I really can't be bothered so unless
            MrMackenty does it first I have no reason
            to implement it
            */

            if (Math.random() < 0.4) { // 40% chance we spawn a tree
                game.addObject("tree", x, y, new Tree(Math.floor(Math.random() * 9))) // Pick a random tree type from 1 - 8
            }
        }
    }

    // Find a random empty tile
    while (true) {
        var x = Math.floor(Math.random() * gridSize[0])
        var y = Math.floor(Math.random() * gridSize[1])

        if (!game.objectAt(x, y)) {
            game.addObject("player", x, y, new Player());
            break;
        }
    }
    
    drawMap();
}

function drawMap() {
    var mapHTML = "";

    // Update the viewport
    // (move the map view to follow the player when they walk to the edge of the map)
    game.updateViewport();

    // Update the footer (stats, only health for now)
    updateFooter();

    // Loop over all the rows in the map
    for (var y = viewportSize[1][0]; y < viewportSize[1][1]; y++) {
        mapHTML+='<div class="map-row">' // Create the row element

        // Loop over all the tiles in the row
        for (var x = viewportSize[0][0]; x < viewportSize[0][1]; x++) {

            // If the tile is outside the map display a mountain
            if ((x > gridSize[0] || x < 0) || (y > gridSize[1] || y < 0)) {
                mapHTML+= '<div class="map-loc"><i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"  title=\"A mountain\"></i></div>';
                continue;
            }

            var object = game.objectAt(x, y)

            // If there is a object at those coordinates
            if (object) {
                // Display the object
                mapHTML += `<div class="map-loc">${object.data.html}</div>`
            } else {
                // Display the three dots
                mapHTML+='<div class="map-loc"><i class=\"fas fa-ellipsis-h fa-fw\" style=\"color:#D2B48C\"></i></div>';
            }
        }
        mapHTML+='</div>' // Close the row element
    }

    // Display the mapHTML onto the actual map
    document.getElementById("map").innerHTML = mapHTML;
}

function updateFooter() {
    var footerHTML = "";

    /*
    Add all the statistics to the footer
    */

    footerHTML += `Health: ${game.getPlayer().data.health}`

    document.getElementById("footer").innerHTML = footerHTML;
}

function registerListeners() {
    // Add a key listener
    document.addEventListener('keyup', (event) => {
        var key = event.key;

        // MOVEMENT KEYS
        switch (key) {
            case "ArrowRight":
                game.movePlayer(1, 0);
                break;
            case "ArrowLeft":
                game.movePlayer(-1, 0);
                break;
            case "ArrowUp":
                game.movePlayer(0, 1);
                break;
            case "ArrowDown":
                game.movePlayer(0, -1);
                break;
        }
    })
}

// CONFIG VARIABLES
var game = new Game();
var gridSize = [40, 40] // [X, Y]
var viewportSize = [[0, 33], [0, 33]];

// START THE GAME
generateMap(); // Map is automatically drawn when generated
registerListeners();