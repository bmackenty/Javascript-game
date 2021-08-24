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

        /*
        The reason why we use an areaPassable instead return the method in the for loop is
        we still want to not move the player if the player has interacted with the object and removed it
        (for example if a player cuts down the tree and it disappears we don't want him to move to the
        tree spot in the same turn)
        */
        var areaPassable = true;

        // Loop through all the objects at the location the
        // player wants to move to and check if they're passable
        for (var object of game.objectsAt(newX, newY)) {
            if (object.data.passable == false)
                areaPassable = false;
        }

        // Interact with all the objects the player is moving torwards
        for (var object of game.objectsAt(newX, newY)) {
            object.data.interact(newX, newY);
        }

        if (!areaPassable) {
            drawMap(); // Draw the map now to update interacted objects
            return false;
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

        // Check if the player is within X tiles of the border of the viewport
        // If yes then move the viewport to follow the player

        if ((playerX - viewportSize[0][0]) < borderViewDistance) {
            viewportSize[0][0]--;
            viewportSize[0][1]--;
            modifiedViewport = true;
        }

        if ((viewportSize[0][1] - playerX) <= borderViewDistance) {
            viewportSize[0][1]++;
            viewportSize[0][0]++;
            modifiedViewport = true;
        }

        if ((playerY - viewportSize[1][0]) < borderViewDistance) {
            viewportSize[1][0]--;
            viewportSize[1][1]--;
            modifiedViewport = true;
            
        }

        if ((viewportSize[1][1] - playerY) <= borderViewDistance) {
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
     * Adds an object to the objectList array
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
                case "spider":
                    if (currentZIndex < 5) {
                        currentZIndex = 5;
                        objectToDisplay = object;
                    }
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

    removeObjectsAt(objectType, x, y) { // TODO: There needs to be a option to remove a object from within the object
        this.objectList = this.objectList.filter((value) => {
            return (value.type != objectType) || (x != value.x || y != value.y);
        })
    }

    objectCount(objectType) {
        var count = 0;
        for (var object of this.objectList) {
            if (object.type == objectType) {
                count++;
            }
        }
        return count;
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

    // Default html value, in case something fails or someone
    // forgets to specify it (why do i have a feeling this will happen)
    get html() {
        return 'ERROR';
    }

    interact() {
        return false;
    }
}

class Player extends Object {

    constructor(name) {
        super()
        this.name = name;
        this.health = 100;
        this.strength = 5;
        this.inventory = [
            new Apple()
        ];
    }

    /**
     * Adds a item to the player's inventory
     * @param {Object} item The item object to add to the inventory
     * @param {Number} count The amount of the item object to add to the inventory (default is 1)
     */
    addItemToInventory(item, count = 1) {
        if (item instanceof Item) {
            // Loop over the amount of times to add the item
            for (var i = 0; i < count; i++) {
                this.inventory.push(item); // Add item to inventory
            }
            // Update the stats display after changing the player's inventory
            updateStats();
            return;
        }

        // The item isn't of the Item class, FATAL
        console.log("FATAL: Attempting to add a non-item to a inventory! (item below)")
        console.log(item);
    }

    /**
     * Returns a array with the different types of items in the player inventory and the amount of times
     * that item is seen in the player inventory. Useful for displaying in statistics
     * @returns {Array} A array of different items and their count in the format { name: ITEM_NAME, count: ITEM_COUNT }
     */
    get backpack() {
        var backpack = [];

        inventoryLoop:
        for (var item of this.inventory) {
            for (var packItem of backpack) {
                if (packItem.name == item.name) {
                    packItem.count++;
                    continue inventoryLoop;
                }
            }
            backpack.push({ name: item.name, count: 1 })
        }

        return backpack;
    }

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:red" title="You."></i>';
    }
}

class Spider extends Object {
    constructor(health) {
        super({
            passable: false
        });
        this.health = health;
        this.strength = 10;
    }

    get html() {
        if (this.isDead) {
            return '<i class="fas fa-solid fa-spider fa-fw" style="color:lightgray" title="A Spider."></i>';
        }
        return '<i class="fas fa-solid fa-spider fa-fw" style="color:red" title="A Spider."></i>';
    }

    interact(x, y) { // TODO: Make the spider automatically attack the player per turn if it can
        if (this.isDead) {
            var boneCollected = Math.floor((Math.random() * 2) + 1);

            game.getPlayer().data.addItemToInventory(new String());
            game.getPlayer().data.addItemToInventory(new Bone(), boneCollected);
            game.removeObjectsAt('spider', x, y);

            addMessage("Looted dead spider", `Found 1 string and ${boneCollected} bone`);
        } else {
            var spiderDamage = game.getPlayer().data.strength;
            this.takeDamage(spiderDamage, x, y);

            if (this.isDead) {
                addMessage("Killed Spider", `Dealt: ${spiderDamage} damage and killed the spider`);
            } else {
                var playerDamage = this.attackPlayer(); // Only let the spider fight back if it has survived the turn
                addMessage("Attacked Spider", `Dealt: ${spiderDamage} damage (${this.health} health left) and recieved ${playerDamage} damage`);
            }
        }
    }

    /**
     * Attack the player
     * @returns {Number} The amount of damage dealt to the player
     */
    attackPlayer() {
        game.getPlayer().data.health -= this.strength;
        return this.strength;
    }

    /**
     * Take damage and check if the spider is dead
     * @param {Number} damage The amount of damage to take
     */
    takeDamage(damage, x, y) {
        this.health -= damage;

        if (this.isDead) {
            this.passable = true;
        }
    }

    get isDead() {
        return this.health <= 0;
    }
}

class Tree extends Object {

    constructor(type) {
        super({ passable: false });
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

    /**
     * 
     * @param {Number} x The x coordinate of the tree that is being interacted
     * @param {Number} y The y coordinate of the tree that is being interacted
     */
    interact(x, y) {

        game.getPlayer().data.addItemToInventory(new Wood())
        addMessage("Cut down tree", "You have cut down a tree for 1 wood");
        game.removeObjectsAt("tree", x, y)
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
===== ITEMS
*/
class Item {

    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

class Apple extends Item {

    constructor() {
        super("Apple", "An apple a day keeps MrMackenty away")
    }
}

class Wood extends Item {

    constructor() {
        super("Wood", "It's just a tree log")
    }
}

class Bone extends Item {

    constructor() {
        super("Bone", "Some being's bone")
    }
}

class String extends Item {

    constructor() {
        super("String", "How did you get this?")
    }
}




/*
===== MAP AND STATS FUNCTIONS
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
                continue;
            }

            if (Math.random() < 0.005) { // 2% chance we spawn a spider
                game.addObject("spider", x, y, new Spider(10))
                continue;
            }

            if (Math.random() < 0.005) { // 2% chance we spawn a spider
                game.addObject("spider", x, y, new Spider(10))
            }
        }
    }

    // Find a random empty tile
    while (true) {
        var x = Math.floor(Math.random() * gridSize[0])
        var y = Math.floor(Math.random() * gridSize[1])

        if (!game.objectAt(x, y)) {
            game.addObject("player", x, y, new Player()); // TODO MOVE VIEWPORT INTO PLAYER AT GAME START
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

    // Update all the tabs
    updateStats();

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

function updateStats() {
    var statsHTML = "";

    /*
    Add all the info to the stats tab
    */

    statsHTML += `<p><strong>Health: </strong>${game.getPlayer().data.health}</p>`;
    statsHTML += "<p><strong>Inventory:</strong></p>"

    // Loop over all the items in the player's inventory
    // and display them
    for (var item of game.getPlayer().data.backpack) {
       statsHTML+= `- ${item.name} (${item.count})`
       statsHTML+= `<br>`
    }

    document.getElementById("stats").innerHTML = statsHTML;
}

function addMessage(title, description) {
    var messageHTML = "";

    // We assign the message a random msgId so that later on in the code
    // we can refrence the msgId and scroll the message into the view
    var msgId = Math.floor(Math.random() * 1000000000)

    messageHTML += `<div class="message" id="msg-id-${msgId}">`
    messageHTML += `<div class="message-title">${title}</div>`
    messageHTML += `<div class="message-description">${description}</div>`
    messageHTML += '</div>'

    document.getElementById("messages").innerHTML += messageHTML;

    // Scroll the message into view using them msgId assigned earlier
    document.getElementById(`msg-id-${msgId}`).scrollIntoView();
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
var borderViewDistance = 3;
var viewportSize = [[0, 33], [0, 33]];

// START THE GAME
generateMap(); // Map is automatically drawn when generated
registerListeners();