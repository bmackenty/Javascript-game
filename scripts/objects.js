class Object {

    /**
     * Create an object
     * @param {Array} options - The objects options
     */
    constructor(options) {
        if (options) {
            this.passable = options.passable != undefined ? options.passable : true;
        }

        // Default location values (these get updated in spawn())
        this.x = -1;
        this.y = -1;
    }

    /**
     * Spawn the object into the visible map
     * @param {Number} x - The x coordinates
     * @param {Number} y - The y coordinates
     * @returns {Object} The object spawned (this)
     */
    spawn(x, y) {
        this.x = x;
        this.y = y;

        return this;
    }

    /**
     * Method called after the object has spawned
     */
    afterSpawn() {

    }

    /**
     * The HTML to display the object
     * 
     * (default in case something fails or someone
     * forgets to specify it)
     * (why do i have a feeling this will happen)
     */
    get html() {
        return 'ERROR';
    }

    /**
     * The object type in a string
     * @deprecated Use instanceof instead of comparing the type
     */
    get type() {
        return 'default';
    }

    /**
     * Interact with the object
     */
    interact() {

    }

    /**
     * Do the object's turn
     */
    doTurn() {

    }
}

class Player extends Object {

    /**
     * Create the player
     * @param {String} name - The player's name
     */
    constructor(name) {
        super({})
        this.name = name;
        this.health = 100;
        this.strength = 5;
        this.inventory = [
            new Apple()
        ];
    }

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:blue" title="You."></i>';
    }

    get type() {
        return 'player';
    }

    /**
     * Adds a item to the player's inventory
     * @param {Object} item - The item object to add to the inventory
     * @param {Number} count - The amount of the item object to add to the inventory
     */
    addItemToInventory(item, count = 1) {
        if (item instanceof Item) {
            // Loop over the amount of times to add the item
            for (var i = 0; i < count; i++) {
                this.inventory.push(item); // Add item to inventory
            }
            // Update the stats display after changing the player's inventory
            game.updateStats();
            return;
        }

        // The item isn't of the Item class, FATAL
        console.log("FATAL: Attempting to add a non-item to a inventory! (item below)")
        console.log(item);
    }

    craftItem(recipe) {
        if (recipe.requirementsSatisfied(this.inventory)) {
			var itemsLeft = [...recipe.input];

			for (var iIndex in this.inventory) {
				for (var rIndex in itemsLeft) {
					if (this.inventory[iIndex].name == itemsLeft[rIndex].name) {
						itemsLeft.splice(rIndex, 1);
						this.inventory.splice(iIndex, 1);
					}
				}
			}

			this.addItemToInventory(recipe.output);
		} else {
			console.log(`FATAL: Attempting to craft item (${recipe.output.name}) player doesn't hvae the items for`)
		}
    }
}

class Enemy extends Object {

    /**
     * Create a new enemy (this should never be called directly, use inheritance)
     * @param {String} name - The name of the enemy
     * @param {Number} health - The health of the enemy
     * @param {Number} strength - The strength of the enemy (damage to deal)
     * @param {Number} sight - How far away the enemy can spot the player
     * @param {Array} drops - Array of Items that the enemy drops
     * @param {Float} strollChance - The chance in decimals that the enemy will move randomly
     */
    constructor(name, health, strength, sight, drops, strollChance) {
        super({
            passable: false
        });
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

    // This doesn't get specified here, use inheritance
    get type() {
        return 'default';
    }

    /**
     * Interact with the enemy
     * (attack or loot dead corpse)
     */
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
            game.alert(`Looted ${this.name}`, message);
        } else {
            var damageTaken = game.getPlayer().strength;
            this.takeDamage(damageTaken);

            if (this.isDead) {
                game.alert(`Killed ${this.name}`, `Dealt ${damageTaken} damage and killed ${this.name}`);
            } else {
                game.alert(`Attacked ${this.name}`, `Dealt ${damageTaken} damage (${this.health} health left)`);
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
        game.alert(`Attacked by ${this.name}`, `Recieved ${damage} damage (${game.getPlayer().health} heath left)`)
        return damage;
    }

    /**
     * Take damage and preform dead check (sksksksks)
     * @param {Number} damage The amount of damage to take
     */
    takeDamage(damage) {
        this.health -= damage;

        if (this.isDead)
            this.passable = true;
    }

    /**
     * Stroll randomly/move torwards the player/attack the player
     */
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
            this.lockedOntoPlayer = game.distance(this, game.getPlayer()) < this.sight;
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

        if (game.distance(this, game.getPlayer()) == 1) { // We are within 1 tile of the player (no need to move, just attack him)
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
    constructor(dead = false) {
        super("Spider", dead ? 0 : 10, 10, 7, [new String(), new Bone(), new Bone()], 0.15);
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

    /**
     * Create the bear
     */
    constructor() {
        super("Bear", 40, 10, 10, [new Leather(), new Leather(), new Leather(), new RawMeat(), new RawMeat()], 0.05);
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

    /**
     * Create a tree
     * @param {Number} type - The type of tree to create (see switch statment in get html())
     */
    constructor(type) {
        super({ passable: false });
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
     * Cut down the tree
     */
    interact() {
        game.getPlayer().addItemToInventory(new Wood())
        game.alert("Cut down tree", "You have cut down a tree for 1 wood");
        game.removeObject(this)
    }
}

class Mountain extends Object {

    /**
     * Create a mountain
     */
    constructor() {
        super({ passable: false });
    }

    get html() {
        return '<i class="fas fa-mountain fa-fw" style="color:grey"  title="A mountain"></i>';
    }

    get type() {
        return 'mountain';
    }
}