class Game {
    constructor() {
        this.objectList = []
    }

    doTurn() {
        // Loop over all the objects in the game and 
        // alert them that the game has finished a turn
        for (var object of this.objectList) {
            object.doTurn(object.x, object.y);
        }

        // Redraw the map after doing everybody's turn
        drawMap();
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
     * @param {number} - xChange
     * @param {number} - yChange
     * @returns {boolean} - Whether the player has successfully moved or not 
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
            if (object.passable == false)
                areaPassable = false;
        }

        // Interact with all the objects the player is moving torwards
        for (var object of game.objectsAt(newX, newY)) {
            object.interact(newX, newY);
        }

        if (!areaPassable) {
            // Do turn
            this.doTurn();
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

        // Do turn
        this.doTurn();

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
     * @param {String} objectType - The object type in a string
     * @param {Number} x - The x coordinate the object will be placed in
     * @param {Number} y - The y coordinate the object will be placed in
     * @param {Object} object - The instance of the object (scroll down to OBJECTS)
     */
    addObject(object) {
        this.objectList.push(object)
    }

    /**
     * Gets the most important object at a location
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Object} - The object with the highest zIndex in a certain location
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
                case "bear":
                    if (currentZIndex < 5) {
                        currentZIndex = 5;
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
     * @returns {Array} - Array of objects at the location
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

    moveObject(object, xChange, yChange) {
        var newX = object.x + xChange;
        var newY = object.y + yChange;

        // Check if there are already any objects in the new location
        if (game.objectsAt(newX, newY).length > 0)
            return false;

        // If the object wants to move outside the map don't let them
        if (newX < 0 || gridSize[0] < newX)
            return false;
        if (newY < 0 || gridSize[1] < newY)
            return false;
        
        object.x = newX;
        object.y = newY;

        return true
    }

    removeObject(object) { // TODO: There needs to be a option to remove a object from within the object

        this.objectList = this.objectList.filter((value) => {
            return (value != object);
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

    distance(x, y, x2, y2) {
        return (Math.max(x, x2) - Math.min(x, x2)) + (Math.max(y, y2) - Math.min(y, y2))
    }

    /**
     * Returns a array with the different types of items in the array and the amount of times
     * that item is seen in the array. Useful for displaying statistics
     * @returns {Array} - A array of different items and their count in the format { name: ITEM_NAME, count: ITEM_COUNT }
     */
    itemsToBackpack(items) {
        var backpack = [];

        inventoryLoop:
        for (var item of items) {
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
}













/*
===== OBJECTS
*/

class Object {

    constructor(props, x, y) {
        if (props) {
            this.passable = props.passable != undefined ? props.passable : true;
        }

        this.x = x;
        this.y = y;
    }

    // Default html value, in case something fails or someone
    // forgets to specify it (why do i have a feeling this will happen)
    get html() {
        return 'ERROR';
    }

    // Default type value
    // (also should be declared every time)
    get type() {
        return 'default';
    }

    interact() {
        return false;
    }

    doTurn() {
        return false;
    }
}

class Player extends Object {

    constructor(name, x, y) {
        super({}, x, y)
        this.name = name;
        this.health = 100;
        this.strength = 5;
        this.inventory = [
            new Apple()
        ];
    }

    /**
     * Adds a item to the player's inventory
     * @param {Object} item - The item object to add to the inventory
     * @param {Number} count - The amount of the item object to add to the inventory (default is 1)
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

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:blue" title="You."></i>';
    }

    get type() {
        return 'player';
    }
}

class Enemy extends Object {

    /**
     * Create a new enemy (this should never be called directly, use child classes)
     * @param {String} name - The name of the enemy
     * @param {Number} health - The health of the enemy
     * @param {Number} strength - The strength of the enemy (damage to deal)
     * @param {Number} sight - How far away the enemy can spot the player
     * @param {Array} drops - Array of Items that the enemy drops
     * @param {Float} strollChance - The chance in decimals that the enemy will move randomly
     */
    constructor(name, health, strength, sight, drops, strollChance, x, y) {
        super({
            passable: false
        }, x, y);
        this.name = name;
        this.health = health;
        this.strength = strength;
        this.sight = sight;
        this.drops = drops;
        this.strollChance = strollChance;

        this.randomMoveCooldown = 0;
        this.lockedOntoPlayer = false;
    }

    get isDead() {
        return this.health <= 0;
    }

    get html() {
        if (this.isDead) {
            return this.deadHtml;
        }
        return this.aliveHtml;
    }

    get aliveHtml() {
        return 'ERROR';
    }

    get deadHtml() {
        return 'ERROR';
    }

    // This doesn't get specified here
    // Specify it in the child classes
    get type() {
        return 'default';
    }

    interact() {
        if (this.isDead) {
            var backpack = game.itemsToBackpack(this.drops);
            var message = "Found ";

            // Add all the drops to the player inventory
            for (var drop of this.drops) {
                game.getPlayer().addItemToInventory(drop);
            }
            
            // Formatting message to display to the player (don't touch unless you lose brain cells yes)
            for (var drop of backpack) {
                if (backpack[backpack.length - 1] == drop) { // Last item?
                    message+= `${drop.count} ${drop.name}`;
                } else if (backpack[backpack.length - 2] == drop) { // Second last item?
                    if (backpack.length == 2) {
                        message+= `${drop.count} ${drop.name} and `;
                    } else {
                        message+= `${drop.count} ${drop.name}, and `;
                    }
                } else {
                    message+= `${drop.count} ${drop.name}, `;
                }
            }

            // Delete the enemey
            game.removeObject(this);
            addMessage(`Looted ${this.name}`, message);
        } else {
            var damageTaken = game.getPlayer().strength;
            this.takeDamage(damageTaken);

            if (this.isDead) {
                addMessage(`Killed ${this.name}`, `Dealt ${damageTaken} damage and killed ${this.name}`);
            } else {
                addMessage(`Attacked ${this.name}`, `Dealt ${damageTaken} damage (${this.health} health left)`);
            }
        }
    }

    /**
     * Attack the player
     * @returns {Number} The amount of damage dealt to the player
     */
    attackPlayer() {
        var damage = this.strength;

        game.getPlayer().health -= damage;
        addMessage(`Attacked by ${this.name}`, `Recieved ${damage} damage (${game.getPlayer().health} heath left)`)
        return damage;
    }

    /**
     * Take damage and check if the enemy is dead
     * @param {Number} damage The amount of damage to take
     */
    takeDamage(damage) {
        this.health -= damage;

        if (this.isDead)
            this.passable = true;
    }

    doTurn() {
        if (!this.isDead) { // Enemies can't move when dead (UNLESS)
            if (this.lockedOntoPlayer) {
                this.moveTorwardsPlayer(this.x, this.y)
            } else {
                if (Math.random() < this.strollChance) { // X chance the enemy will move randomly
                    var moveAmount = Math.random() > 0.5 ? 1 : -1 // The amount to move (1 or -1)
                    var movePlane = Math.random() > 0.5 ? 0 : 1 // The plane in which to move in (0 is x, 1 is y)

                    // If movePlane is equal to X set the variable to moveAmount, else set variable to 0
                    var moveX = movePlane == 0 ? moveAmount : 0
                    var moveY = movePlane == 1 ? moveAmount : 0

                    var spiderMovedSuccessfully = game.moveObject(this, moveX, moveY)

                    if (!spiderMovedSuccessfully) { // Enemy failed to move (obstacle in the way)
                        game.moveObject(this, -moveX, -moveY) // Try to move in the oppposite direction
                    }
                }
            }

            // If the player is within X (sight) tiles of the spider lock onto the player
            this.lockedOntoPlayer = game.distance(this.x, this.y, game.getPlayer().x, game.getPlayer().y) < this.sight;
        }
    }

    /**
     * Move torwards the player
     * 
     * DO NOT TOUCH UNLESS YOU AREN'T AFRAID OF LOSING BRAINCELLS
     * 
     * this is what i call a broke man's a* algorithm
     * 
     * @param {Number} x - X coordinate of the spider
     * @param {Number} y - Y coordainte of the spider
     */
    moveTorwardsPlayer(x, y) {
        // Distance needed to travel to get to the player
        var distanceX = game.getPlayer().x - x
        var distanceY = game.getPlayer().y - y

        // console.log(`need to travel ${distanceX}:${distanceY} to get to the player`)

        if (distanceX == 0 && distanceY == 0) // We are already at the player? This should never happen...
            return;

        if (game.distance(game.getPlayer().x, game.getPlayer().y, x, y) == 1) { // We are within 1 tile of the player (no need to move, just attack him)
            this.attackPlayer()
            return;
        }

        // Move the spider torwards the player
        if (distanceX == 0) { // We only need to move up or down to get torwards the player
            // console.log('moving the spider up or down torwards ellia ' + (distanceY > 0 ? 1 : -1))
            if (!game.moveObject(this, 0, distanceY > 0 ? 1 : -1)) {
               // Obstacle is in the way

               // Try moving randomly left or right to see if no more obstacle
               game.moveObject(this, Math.random() > 0.5 ? 1 : -1, 0)
            }
        } else if (distanceY == 0) { // We only need to move left or right to get torwards the player
            // console.log('moving the spider left or right torwards the player' + (distanceX > 0 ? 1 : -1))
            if (!game.moveObject(this, distanceX > 0 ? 1 : -1, 0)) {
                // Obstacle is in the way

                // Try moving randomly up or down to see if no more obstacle
               game.moveObject(this, 0, Math.random() > 0.5 ? 1 : -1)
            }
        } else {
            // We choose to randomly move diagonally or horizontally to get the the player
            var movePlane = Math.random() > 0.5 ? 0 : 1 // The plane in which to move in (0 is x, 1 is y)

            var moveX = movePlane == 0 ? (distanceX > 0 ? 1 : -1) : 0
            var moveY = movePlane == 1 ? (distanceY > 0 ? 1 : -1) : 0

            if (!game.moveObject(this, moveX, moveY)) {
                // Obstacle is in the way

                // Try switching the planes to see if we can move
                game.moveObject(this, moveY, moveX)
            }
        }
    
        if (distanceX + distanceY == 1) { // We are within 1 tile of the player (attack him)
            this.attackPlayer()
        }
    }
}

class Spider extends Enemy {

    /**
     * Create a spider
     * @param {Boolean} dead - Controls whether the spider spawns dead or not
     */
    constructor(dead = false, x, y) {
        super("Spider", dead ? 0 : 10, 10, 7, [new String(), new Bone(), new Bone()], 0.15, x, y);
    }

    get aliveHtml() {
        return '<i class="fas fa-solid fa-spider fa-fw" style="color:red" title="A Spider."></i>';
    }

    get deadHtml() {
        return '<i class="fas fa-solid fa-spider fa-fw" style="color:lightgray" title="A Spider."></i>';
    }

    get type() {
        return 'spider';
    }
}

class Bear extends Enemy {

    constructor( x, y) {
        super("Bear", 40, 10, 10, [new Leather(), new Leather(), new Leather(), new RawMeat(), new RawMeat()], 0.05, x, y);
    }

    get aliveHtml() {
        return '<i class="fas fa-solid fa-paw fa-fw" style="color:brown" title="A Bear."></i>';
    }

    get deadHtml() {
        return '<i class="fas fa-solid fa-paw fa-fw" style="color:lightgray" title="A Bear."></i>';
    }

    get type() {
        return 'bear';
    }
}

class Tree extends Object {

    constructor(type, x, y) {
        super({ passable: false }, x, y);
        this.treeType = type;
    }

    get html() {
        switch (this.treeType) {
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

    get type() {
        return 'tree';
    }

    /**
     * 
     * @param {Number} x The x coordinate of the tree that is being interacted
     * @param {Number} y The y coordinate of the tree that is being interacted
     */
    interact() {

        game.getPlayer().addItemToInventory(new Wood())
        addMessage("Cut down tree", "You have cut down a tree for 1 wood");
        game.removeObject(this)
    }
}

class Mountain extends Object {

    constructor(x, y) {
        super({ passable: false }, x, y);
    }

    get html() {
        return '<i class="fas fa-mountain fa-fw" style="color:grey"  title="A mountain"></i>';
    }

    get type() {
        return 'mountain';
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

class Leather extends Item {

    constructor() {
        super("Leather", "Maybe you can make some clothes out of this...")
    }
}

class RawMeat extends Item {

    constructor() {
        super("Raw Meat", "Not recommended to be eaten raw")
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

            var randomNumber = (Math.random() * 100) + 1 // Get a random number from 1-100 (with decimals)
            if (randomNumber < 40) { // 40% chance we spawn a tree
                game.addObject(new Tree(Math.floor(Math.random() * 9), x, y)) // Pick a random tree type from 1 - 8
                continue;
            }

            if (randomNumber < 40.5) { // 0.5% chance we spawn a spider
                game.addObject(new Spider(false, x, y));
                continue;
            }

            if (randomNumber < 40.6) { // 0.1% chance we spawn a dead spider
                game.addObject(new Spider(true, x, y))
                continue;
            }

            if (randomNumber < 40.7) { // 0.1% chance we spawn a bear spider
                game.addObject(new Bear(false, x, y))
                continue;
            }
        }
    }

    // Find a random empty tile
    while (true) {
        var x = Math.floor(Math.random() * gridSize[0])
        var y = Math.floor(Math.random() * gridSize[1])

        if (!game.objectAt(x, y)) {
            game.addObject(new Player("", x, y));
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
                mapHTML += `<div class="map-loc">${object.html}</div>`
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

    statsHTML += `<p><strong>Health: </strong>${game.getPlayer().health}</p>`;
    statsHTML += "<p><strong>Inventory:</strong></p>"

    // Loop over all the items in the player's inventory
    // and display them
    for (var item of game.itemsToBackpack(game.getPlayer().inventory)) {
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