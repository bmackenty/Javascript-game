class Game {
    constructor() {
        this.objectArray = [] // Array of all the objects in the game
        this.viewportSize = [[0, 33], [0, 33]];
        this.currentTurn = 0;
        this.gameRunning = true;

        this.generateMap();
        this.registerListeners();
    }

    /**
     * Play a turn in the game
     */
    doTurn() {
        this.currentTurn++; // Update the turn number

        // Loop over all the objects in the game and 
        // alert them that the game has finished a turn
        for (var object of this.objectArray) {
            object.doTurn();
        }

        // Update the map and statistics after finishing the turn
        this.drawMap();
        this.updateStats();
    }

    /**
     * Gets the player
     * @returns {Object} The player object
     */
    getPlayer() {
        for (var object of this.objectArray) {
            if (object instanceof Player) {
                return object;
            }
        }

        // This should never happen! (The player is not removed anywhere in the code)
        console.log("FATAL: PLAYER NOT IN OBJECT LIST")
        return undefined;
    }

    /**
     * Attempt to move the player
     * @param {number} - xChange
     * @param {number} - yChange
     * @returns {boolean} Whether the player has successfully moved or not 
     * (reasons why player didn't move might include attempting to walk outside the map or into a impassable object)
     */
    movePlayer(xChange, yChange) {
        if (this.gameRunning) {
            var newX = this.getPlayer().x + xChange;
            var newY = this.getPlayer().y + yChange;

            // Interact with object at new location and
            // check if it's passable
            var objectAtLocation = game.objectAt(newX, newY)
            if (objectAtLocation) {
                if (objectAtLocation.passable == false) {
                    objectAtLocation.interact(newX, newY);
                    this.doTurn();
                    return false;
                }
                objectAtLocation.interact(newX, newY);
            }

            // If the player wants to move outside the map don't let him
            if (newX < 0 || gridSize[0] < newX)
                return false;
            if (newY < 0 || gridSize[1] < newY)
                return false;


            // After all the checks update the player's location
            this.getPlayer().x += xChange;
            this.getPlayer().y += yChange;

            this.doTurn();
            return true;
        }
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

        if ((playerX - this.viewportSize[0][0]) < borderViewDistance) {
            this.viewportSize[0][0]--;
            this.viewportSize[0][1]--;
            modifiedViewport = true;
        }

        if ((this.viewportSize[0][1] - playerX) <= borderViewDistance) {
            this.viewportSize[0][1]++;
            this.viewportSize[0][0]++;
            modifiedViewport = true;
        }

        if ((playerY - this.viewportSize[1][0]) < borderViewDistance) {
            this.viewportSize[1][0]--;
            this.viewportSize[1][1]--;
            modifiedViewport = true;
            
        }

        if ((this.viewportSize[1][1] - playerY) <= borderViewDistance) {
            this.viewportSize[1][1]++;
            this.viewportSize[1][0]++;
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
     * Adds an object to the game
     * @param {Object} object - The instance of the object (scroll down to OBJECTS)
     * @returns {Boolean} Whether the object has successfully been added
     */
    addObject(object) {
        // Check if there already is a object at the new location
        if (this.objectAt(object.x, object.y)) {
            return false;
        }
        this.objectArray.push(object)
        return true;
    }

    /**
     * Gets the object at a location
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Object} The object in the location
     */
    objectAt(x, y) {
        for (var object of this.objectArray) {
            if (object.x == x && object.y == y) {
                return object;
            }
        }
        return undefined;
    }

    /**
     * Move an object
     * @param {Object} object - The object to be moved
     * @param {Number} xChange - The translation to apply on x
     * @param {Number} yChange - The translation to apply on y
     * @returns {Boolean} Whether the object has moved successfully
     */
    moveObject(object, xChange, yChange) {
        var newX = object.x + xChange;
        var newY = object.y + yChange;

        // Check if there already is a object at the new location
        if (game.objectAt(newX, newY))
            return false;

        // If the object wants to move outside the map don't let them
        if (newX < 0 || gridSize[0] < newX)
            return false;
        if (newY < 0 || gridSize[1] < newY)
            return false;
        
        // After all the checks update the object's location
        object.x = newX;
        object.y = newY;
        return true;
    }

    /**
     * Remove an object from the game
     * @param {Object} object - The object to remove
     */
    removeObject(object) {
        this.objectArray = this.objectArray.filter((value) => value != object);
    }

    /**
     * Get the distance needed to travel from object1 to get to object2
     * @param {Object} object1 - The first object
     * @param {Object} object2 - The second object
     * @returns {Number} The distance needed to travel
     */
    distance(object1, object2) {
        return (Math.max(object1.x, object2.x) - Math.min(object1.x, object2.x)) + (Math.max(object1.y, object2.y) - Math.min(object1.y, object2.y))
    }

    /**
     * Returns a array with the different types of items in the array and the amount of times
     * that item is seen in the array. Useful for displaying statistics.
     * @returns {Array} A array of different items and their count in the format { name: ITEM_NAME, count: ITEM_COUNT }
     */
    itemsToBackpack(items) {
        var backpack = [];

        ItemsLoop:
        for (var item of items) { // Loop over all the items
            for (var packItem of backpack) { // Loop over all the items in the backpack
                if (packItem.name == item.name) {
                    // Item already in backpack, increase it's count
                    packItem.count++;
                    continue ItemsLoop;
                }
            }
            // Update not in backpack, add it
            backpack.push({ name: item.name, count: 1 })
        }

        return backpack;
    }

    /**
     * Generates the map terrain
     */
    generateMap() {
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
                    var treeType = Math.floor(Math.random() * 9); // Pick a random tree type from 1 - 8
                    this.addObject(new Tree(treeType).spawn(x, y)); 
                    continue;
                }
    
                if (randomNumber < 40.5) { // 0.5% chance we spawn a spider
                    this.addObject(new Spider(false).spawn(x, y));
                    continue;
                }
    
                if (randomNumber < 40.6) { // 0.1% chance we spawn a dead spider
                    this.addObject(new Spider(true).spawn(x, y));
                    continue;
                }
    
                if (randomNumber < 40.7) { // 0.1% chance we spawn a bear spider
                    this.addObject(new Bear(false).spawn(x, y));
                    continue;
                }
            }
        }

        // Find a random empty tile
        while (true) {
            // Generate a random x and y value
            var x = Math.floor(Math.random() * gridSize[0])
            var y = Math.floor(Math.random() * gridSize[1])

            if (!this.objectAt(x, y)) { // If there is no object at those coordinates
                this.addObject(new Player("").spawn(x, y)); // Spawn the player
                break;
            }
        }

        this.drawMap(); // Draw the map after generating it
        this.updateStats(); // Display statistics
    }

    /**
     * Draws the map for the user
     */
    drawMap() {
        if (this.gameRunning) {
            var mapHTML = "";
        
            // Update the viewport
            // (move the map view to follow the player when they walk to the edge of the map)
            this.updateViewport();
        
            // Loop over all the rows in the viewport
            for (var y = this.viewportSize[1][0]; y < this.viewportSize[1][1]; y++) {
                mapHTML+='<div class="map-row">' // Open row element
        
                // Loop over all the tiles in the row
                for (var x = this.viewportSize[0][0]; x < this.viewportSize[0][1]; x++) {
        
                    // If the tile is outside the map display a mountain
                    if ((x > gridSize[0] || x < 0) || (y > gridSize[1] || y < 0)) {
                        mapHTML+= '<div class="map-loc"><i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"  title=\"A mountain\"></i></div>';
                        continue;
                    }

                    // If the player is at that location, display him
                    if (this.getPlayer().x == x && this.getPlayer().y == y) {
                        mapHTML+=`<div class="map-loc">${this.getPlayer().html}</div>`
                        continue;
                    }
        
                    var object = this.objectAt(x, y)
        
                    if (object) { // If there is a object at those coordinates
                        // Display the object
                        mapHTML += `<div class="map-loc">${object.html}</div>`
                    } else { // No object here
                        // Display the three dots
                        mapHTML+='<div class="map-loc"><i class=\"fas fa-ellipsis-h fa-fw\" style=\"color:#D2B48C\"></i></div>';
                    }
                }
                mapHTML+='</div>' // Close row element
            }
        
            // Display mapHTML onto the visible <div> element
            document.getElementById("map").innerHTML = mapHTML;
        }
    }

    /**
     * Updates the statistics tab
     */
    updateStats() {
        var statsHTML = "";
    
        /*
        Add all the info to statsHTML
        */
    
        statsHTML += `<p style="text-align: center"><strong>TURN </strong>${this.currentTurn}</p>`
        statsHTML += `<p><strong>Health: </strong>${this.getPlayer().health}</p>`;
        statsHTML += "<p><strong>Inventory:</strong></p>";
    
        // Loop over all the items in the player's inventory and display them
        for (var item of this.itemsToBackpack(this.getPlayer().inventory)) {
           statsHTML+= `- ${item.name} (${item.count})`
           statsHTML+= `<br>`
        }
    
        // Display statsHTML onto the visible <div> element
        document.getElementById("stats").innerHTML = statsHTML;
    }
    
    alert(title, description) {
        var messageHTML = "";
    
        // We assign the message a random msgId so that later on in the code
        // we can refrence the msgId and scroll the message into the view
        var msgId = Math.floor(Math.random() * 1000000000)
    
        messageHTML += `<div class="message" id="msg-id-${msgId}">` // Open the message <div>
        messageHTML += `<div class="message-title">${title}</div>` // Display the message title
        messageHTML += `<div class="message-description">${description}</div>` // Display the message description
        messageHTML += '</div>' // Close the message <div>
    
        // Display messageHTML onto the visible <div> element
        document.getElementById("messages").innerHTML += messageHTML;
    
        // Scroll the message into view using the msgId assigned earlier
        document.getElementById(`msg-id-${msgId}`).scrollIntoView();
    }

    registerListeners() {
        document.addEventListener('keyup', (event) => { // Add a key listener
            var key = event.key; // The key pressed
    
            // MOVEMENT KEYS
            switch (key) {
                case "ArrowRight":
                    this.movePlayer(1, 0);
                    break;
                case "ArrowLeft":
                    this.movePlayer(-1, 0);
                    break;
                case "ArrowUp":
                    this.movePlayer(0, 1);
                    break;
                case "ArrowDown":
                    this.movePlayer(0, -1);
                    break;
            }
        })
    }

    // end the game once the player reaches 0 health
    // reset the innerhtml of the map and display "you died"
    endGame() {
        document.getElementById("map").innerHTML = "<p id='death-message'>Game Over</p>";

        this.gameRunning = false;
    }
}