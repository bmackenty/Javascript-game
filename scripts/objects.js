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

        this.afterSpawn();
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
        this.hp = 100;
        this.maxHp = 100;
        this.strength = 5;
        this.inventory = [
            new Apple(),
        ];
      
        this.achievements = [
            new A_Played(),
            new A_Survivor(),
            new A_SpiderHunter(),
            new A_BeastSlayer(),
            new A_Deforestation(),
        ];

        this.recipeList = [
            new Recipe(new LeatherBoots(), [new Leather(), new Leather(), new String()]),
            new Recipe(new BerryStew(), [new Berry(), new Berry()]),
            new Recipe(new SewingKit, [new String(), new String(), new String(), new SharpenedStick()]),
            new Recipe(new MeshFilter(), [new String(), new String(), new String(), new SewingKit()]),
            new Recipe(new SharpenedStick(), [new Wood(), new Stick(), new Stick(), new Flint()]),
            new Recipe(new FlintAxe(), [new Wood(), new Wood(), new Flint()]),
            new Recipe(new JungleHat(), [new SewingKit(), new SewingKit(), new MeshFilter(), new Leaf(), new Leaf(), new Leaf(), new Leaf(), new Leaf()])
        ]

        this.skillSet = {
            combat: {
                xp: 0,
                /**
                 * Get the xp required to achieve a specific level
                 * @param {Number} level - The level to check the amount of xp required for
                 * @returns {Number} Amount of xp required to get that to that level
                 */
                levelingFormula: (level) => {
                    return Math.round((level**1.6) + (level*6.5));
                }
            }
        }

        this.equipmentSlots = [
            new EquipmentSlot("shoes"),
            new EquipmentSlot("hat")
        ]
    }

    get html() {
        return '<i class="fas fa-child fa-fw" style="color:blue" title="You."></i>';
    }

    get type() {
        return 'player';
    }

    // Keep this method here for future items that do more damage
    get attack() {
        var combatBonus = ((this.getSkillLevel("combat")*0.9)**1.4)
        return Math.round(this.strength + combatBonus);
    }

    /**
     * Get the player's health
     * @description This method is used to preform calculations on the players health.
     * The player's HP variable should not be accessed directly, instead use this method
     * (If you want to find out more about these coding practices read about getters and setters)
     */
     get health() {
        // If the player is alive display his health
        // Otherwise display the "DEAD" text
        return this.isAlive ? this.hp : "DEAD";
    }

    /**
     * Set the player's health
     * @param {Number} newHealth - The new amount of health
     * @returns {Boolean} Whether the player has reached the health cap
     */
    set health(newHealth) {

        if (this.isAlive) {
            // Check for max health
            if (newHealth > this.maxHp) {
                this.health = this.maxHp
                return true;
            }

            // Set the health
            this.hp = newHealth;

            // Check if the health set kills the player
            if (!this.isAlive) {
                game.endGame(); // End the game (player dead)

            return false;
            }
        }
    }

    /**
     * Make the player take a certain amount of damage after all calculations
     * @param {Number} damage - The amount of damage to take
     * @returns {Number} The final damage the player takes
     */
     takeDamage(damage) {
        this.defenceMultiplier = 1;
        for (var wearingItem of this.getAllWearingItems()) {
            if (wearingItem.stats) {
                this.defenceMultiplier -= wearingItem.stats.defence
            }
        }
        var finalDamage = damage*Math.max(0, this.defenceMultiplier)
        this.health -= finalDamage;
        return finalDamage;
    }

    /**
     * Get the specified skill's level
     * @param {String} skillName - The name of the skill
     * @returns {Number} The level of the specified skill
     */
    getSkillLevel(skillName) {
        var currentLevel = 0;

        while (true) {
            if (this.skillSet[skillName].xp > this.skillSet[skillName].levelingFormula(currentLevel + 1)) { // If the player has enough xp for the next level
                currentLevel++; // Increase the current level by one
            } else {
                break; // Else exit the loop and return the current level
            }
        }
        return currentLevel;
    }

    /**
     * Get the amount of xp required to get the next level in a skill
     * @param {String} skillName - The name of the skill
     * @returns {Number} The amount of xp points required to progress to the next level
     */
    getXpToNextLevel(skillName) {
        var currentXp = this.skillSet[skillName].xp;
        var currentLevel = this.getSkillLevel(skillName)
        return this.skillSet[skillName].levelingFormula(currentLevel + 1) - currentXp;
    }
    
    /**
     * Adds xp to a specific player skill
     * @param {String} skillName - The name of the skill
     * @param {Number} xpAmount - The amount of xp to add to the skill
     */
    addSkillXp(skillName, xpAmount) {
        this.skillSet[skillName].xp += xpAmount;
    }

    /**
     * Check whether the player is alive
     * (We can do funny stuff with this later)
     */
    get isAlive() {
        return this.hp > 0;
    }

    /**
     * Adds a item to the player's inventory
     * @param {Object} item - The item object to add to the inventory
     * @param {Number} count - The amount of the items to add
     */
     addItem(item, count = 1) {
        if (item instanceof Item) {
            // Loop over the amount of times to add the item
            for (var i = 0; i < count; i++) {
                this.inventory.push(item); // Add item to inventory
            }
            // Update the stats display after changing the player's inventory
            game.updateStats();
            game.updateEquipment();
            return;
        }

        // The item isn't of the Item class, FATAL
        console.log("FATAL: Attempting to add a non-item to a inventory! (item below)")
        console.log(item);
    }
  
    /**
     * Removes a item from the player's inventory
     * @param {Object} item - The item object to remove from the inventory
     * @param {*} count - The amount of items to remove
     */
    removeItem(item, count = 1) {
        if (item instanceof Item) {
            for (var iIndex in this.inventory) { // Loop over all the items in the player's inventory
                if (this.inventory[iIndex].name == item.name) { // If the looped item is the same as the item to remove
                    if (count-- >= 1) { // If count (before removing one) is bigger than one
                        this.inventory.splice(iIndex, 1) // Remove item
                    }
                }
            }

            // Update the stats display after changing the player's inventory
            game.updateStats();
            game.updateEquipment();
            return;
        }

        // The item isn't of the Item class, FATAL
        console.log("FATAL: Attempting to remove a non-item from a inventory! (item below)")
        console.log(item);
    }

    /**
     * Get the count of a specific item in the player inventory
     * @param {Object} item - The item class to look for.
     * @returns {Number} The amount of times the item appears in the inventory
     */
     getItemCount(itemToFind) {
        let amount = 0;
        for (var item of this.inventory) {
            if (item instanceof itemToFind) {
                amount++;
            }
        }
        return amount;
    }

    /**
     * Get the item object associated with a item id
     * @param {Number} id - The id to look for
     * @returns {Object} The item object
     */
    getItem(id) {
        for (var item of this.inventory) {
            if (item.id == id) {
                return item;
            }
        }
        
        return undefined;
    }

    /**
     * Crafts the recipe for the player (removes the required items and gives the output)
     * @param {Object} recipe - The recipe to craft
     */
    craftItem(recipe) {
        if (game.running) {
            if (recipe.requirementsSatisfied(this.inventory)) {
                var itemsLeft = [...recipe.input];

                for (var rIndex in itemsLeft) {
                    for (var iItem of this.inventory) {
                        if (iItem.name == itemsLeft[rIndex].name) {
                            this.removeItem(iItem);
                            break;
                        }
                    }
                }

                this.addItem(recipe.output);
            } else {
                console.log(`FATAL: Attempting to craft item (${recipe.output.name}) player doesn't hvae the items for`);
            }
        }
    }

    /**
     * Get the item in a equipment slot
     * @param {String} slot - The name of the item slot
     * @returns {Object} The item object in the slot
     */
    getItemSlot(slot) {
        var itemSlot = document.getElementById(slot);
        if (itemSlot) { // If the item slot is a valid slot
            var itemId = itemSlot.getAttribute("equipped"); // Get the id from the attribute
            if (!itemId || itemId == "undefined") // No item is equipped
                return undefined;
            var item = this.getItem(itemId); // Get the item

            if (!item) { // The item doesn't exist (got used up in crafting or somewhere else)
                console.log(`WARNING: Invalid item equipped, somewhere in the code we don't update the equipment! (${itemId})`)
                game.updateEquipment(); // Update the equipment
            }

            return item;
        }
        console.log("item slot is undefined")
    }

    /**
     * Check if the user is currently wearing a item on any item slot
     * @param {Number} id - The id to check for
     * @returns {Boolean} Whether the item is being currently worn
     */
    currentlyWearingItem(id) {
        for (var element of document.getElementsByClassName("inv-slot")) {
            if (element.getAttribute("equipped") == id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all the items the player is currently wearing
     * @returns {Array} The items
     */
    getAllWearingItems() {
        var wearing = [];
        for (var item of this.inventory) {
            if (this.currentlyWearingItem(item.id)) {
                wearing.push(item)
            }
        }

        return wearing;
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
    constructor(name, health, strength, sight, drops, strollChance, combatXpGain) {
        super({
            passable: false
        });
        this.name = name;
        this.health = health;
        this.strength = strength;
        this.sight = sight;
        this.drops = drops;
        this.strollChance = strollChance;
        this.combatXpGain = combatXpGain;

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
                game.getPlayer().addItem(drop);
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
            var damageTaken = game.getPlayer().attack;
            this.takeDamage(damageTaken);

            if (this.isDead) {
                game.alert(`Killed ${this.name}`, `Dealt ${damageTaken} damage and killed ${this.name} (gained ${this.combatXpGain} combat xp)`);
                game.getPlayer().addSkillXp("combat", this.combatXpGain);
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
        var damage = game.getPlayer().takeDamage(this.strength);
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
    
        if (game.distance(this, game.getPlayer()) == 1) { // We are within 1 tile of the player (attack him)
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
        super("Spider", dead ? 0 : 10, 10, 7, [new String(), new Bone(), new Bone()], 0.15, 7);
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
        super("Bear", 40, 10, 10, [new Leather(), new Leather(), new Leather(), new RawMeat(), new RawMeat()], 0.05, 30);
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

class Dragon extends Enemy {
    /**
     * Create the bear
     */
    constructor() {
        super("Dragon", 200, 30, 2, [new TearOfDragon()], 0,100);
    }

    get aliveHtml() {
        return '<i class="fas fa-dragon" style="color:purple" title="A Dragon."></i>';
    }

    get deadHtml() {
        return '<i class="fas fa-dragon" style="color:lightgray" title="A Dragon."></i>';
    }

    get type() {
        return 'Dragon';
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
        var woodDrop = Math.floor((Math.random() * 2) + 1);
        var stickDrop = Math.floor(Math.random() * 3)

        game.getPlayer().addItem(new Wood(), woodDrop);
        game.getPlayer().addItem(new Stick(), stickDrop);
        game.alert("Cut down tree", `You have cut down a tree for ${woodDrop} wood and ${stickDrop} stick`);
        game.removeObject(this)
    }
}

class BerryBush extends Object {

    constructor() {
        super({ passable: true})
        this.turnsToRipe = 0;
    }

    get html() {
        if (this.turnsToRipe <= 0) {
            return `<svg aria-hidden="true" style="height: 16px; width: 20px; color: red;" focusable="false" data-prefix="fab" data-icon="raspberry-pi" class="svg-inline--fa fa-raspberry-pi fa-w-13" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 407 512"><path fill="currentColor" d="M372 232.5l-3.7-6.5c.1-46.4-21.4-65.3-46.5-79.7 7.6-2 15.4-3.6 17.6-13.2 13.1-3.3 15.8-9.4 17.1-15.8 3.4-2.3 14.8-8.7 13.6-19.7 6.4-4.4 10-10.1 8.1-18.1 6.9-7.5 8.7-13.7 5.8-19.4 8.3-10.3 4.6-15.6 1.1-20.9 6.2-11.2.7-23.2-16.6-21.2-6.9-10.1-21.9-7.8-24.2-7.8-2.6-3.2-6-6-16.5-4.7-6.8-6.1-14.4-5-22.3-2.1-9.3-7.3-15.5-1.4-22.6.8C271.6.6 269 5.5 263.5 7.6c-12.3-2.6-16.1 3-22 8.9l-6.9-.1c-18.6 10.8-27.8 32.8-31.1 44.1-3.3-11.3-12.5-33.3-31.1-44.1l-6.9.1c-5.9-5.9-9.7-11.5-22-8.9-5.6-2-8.1-7-19.4-3.4-4.6-1.4-8.9-4.4-13.9-4.3-2.6.1-5.5 1-8.7 3.5-7.9-3-15.5-4-22.3 2.1-10.5-1.3-14 1.4-16.5 4.7-2.3 0-17.3-2.3-24.2 7.8C21.2 16 15.8 28 22 39.2c-3.5 5.4-7.2 10.7 1.1 20.9-2.9 5.7-1.1 11.9 5.8 19.4-1.8 8 1.8 13.7 8.1 18.1-1.2 11 10.2 17.4 13.6 19.7 1.3 6.4 4 12.4 17.1 15.8 2.2 9.5 10 11.2 17.6 13.2-25.1 14.4-46.6 33.3-46.5 79.7l-3.7 6.5c-28.8 17.2-54.7 72.7-14.2 117.7 2.6 14.1 7.1 24.2 11 35.4 5.9 45.2 44.5 66.3 54.6 68.8 14.9 11.2 30.8 21.8 52.2 29.2C159 504.2 181 512 203 512h1c22.1 0 44-7.8 64.2-28.4 21.5-7.4 37.3-18 52.2-29.2 10.2-2.5 48.7-23.6 54.6-68.8 3.9-11.2 8.4-21.3 11-35.4 40.6-45.1 14.7-100.5-14-117.7zm-22.2-8c-1.5 18.7-98.9-65.1-82.1-67.9 45.7-7.5 83.6 19.2 82.1 67.9zm-43 93.1c-24.5 15.8-59.8 5.6-78.8-22.8s-14.6-64.2 9.9-80c24.5-15.8 59.8-5.6 78.8 22.8s14.6 64.2-9.9 80zM238.9 29.3c.8 4.2 1.8 6.8 2.9 7.6 5.4-5.8 9.8-11.7 16.8-17.3 0 3.3-1.7 6.8 2.5 9.4 3.7-5 8.8-9.5 15.5-13.3-3.2 5.6-.6 7.3 1.2 9.6 5.1-4.4 10-8.8 19.4-12.3-2.6 3.1-6.2 6.2-2.4 9.8 5.3-3.3 10.6-6.6 23.1-8.9-2.8 3.1-8.7 6.3-5.1 9.4 6.6-2.5 14-4.4 22.1-5.4-3.9 3.2-7.1 6.3-3.9 8.8 7.1-2.2 16.9-5.1 26.4-2.6l-6 6.1c-.7.8 14.1.6 23.9.8-3.6 5-7.2 9.7-9.3 18.2 1 1 5.8.4 10.4 0-4.7 9.9-12.8 12.3-14.7 16.6 2.9 2.2 6.8 1.6 11.2.1-3.4 6.9-10.4 11.7-16 17.3 1.4 1 3.9 1.6 9.7.9-5.2 5.5-11.4 10.5-18.8 15 1.3 1.5 5.8 1.5 10 1.6-6.7 6.5-15.3 9.9-23.4 14.2 4 2.7 6.9 2.1 10 2.1-5.7 4.7-15.4 7.1-24.4 10 1.7 2.7 3.4 3.4 7.1 4.1-9.5 5.3-23.2 2.9-27 5.6.9 2.7 3.6 4.4 6.7 5.8-15.4.9-57.3-.6-65.4-32.3 15.7-17.3 44.4-37.5 93.7-62.6-38.4 12.8-73 30-102 53.5-34.3-15.9-10.8-55.9 5.8-71.8zm-34.4 114.6c24.2-.3 54.1 17.8 54 34.7-.1 15-21 27.1-53.8 26.9-32.1-.4-53.7-15.2-53.6-29.8 0-11.9 26.2-32.5 53.4-31.8zm-123-12.8c3.7-.7 5.4-1.5 7.1-4.1-9-2.8-18.7-5.3-24.4-10 3.1 0 6 .7 10-2.1-8.1-4.3-16.7-7.7-23.4-14.2 4.2-.1 8.7 0 10-1.6-7.4-4.5-13.6-9.5-18.8-15 5.8.7 8.3.1 9.7-.9-5.6-5.6-12.7-10.4-16-17.3 4.3 1.5 8.3 2 11.2-.1-1.9-4.2-10-6.7-14.7-16.6 4.6.4 9.4 1 10.4 0-2.1-8.5-5.8-13.3-9.3-18.2 9.8-.1 24.6 0 23.9-.8l-6-6.1c9.5-2.5 19.3.4 26.4 2.6 3.2-2.5-.1-5.6-3.9-8.8 8.1 1.1 15.4 2.9 22.1 5.4 3.5-3.1-2.3-6.3-5.1-9.4 12.5 2.3 17.8 5.6 23.1 8.9 3.8-3.6.2-6.7-2.4-9.8 9.4 3.4 14.3 7.9 19.4 12.3 1.7-2.3 4.4-4 1.2-9.6 6.7 3.8 11.8 8.3 15.5 13.3 4.1-2.6 2.5-6.2 2.5-9.4 7 5.6 11.4 11.5 16.8 17.3 1.1-.8 2-3.4 2.9-7.6 16.6 15.9 40.1 55.9 6 71.8-29-23.5-63.6-40.7-102-53.5 49.3 25 78 45.3 93.7 62.6-8 31.8-50 33.2-65.4 32.3 3.1-1.4 5.8-3.2 6.7-5.8-4-2.8-17.6-.4-27.2-5.6zm60.1 24.1c16.8 2.8-80.6 86.5-82.1 67.9-1.5-48.7 36.5-75.5 82.1-67.9zM38.2 342c-23.7-18.8-31.3-73.7 12.6-98.3 26.5-7 9 107.8-12.6 98.3zm91 98.2c-13.3 7.9-45.8 4.7-68.8-27.9-15.5-27.4-13.5-55.2-2.6-63.4 16.3-9.8 41.5 3.4 60.9 25.6 16.9 20 24.6 55.3 10.5 65.7zm-26.4-119.7c-24.5-15.8-28.9-51.6-9.9-80s54.3-38.6 78.8-22.8 28.9 51.6 9.9 80c-19.1 28.4-54.4 38.6-78.8 22.8zM205 496c-29.4 1.2-58.2-23.7-57.8-32.3-.4-12.7 35.8-22.6 59.3-22 23.7-1 55.6 7.5 55.7 18.9.5 11-28.8 35.9-57.2 35.4zm58.9-124.9c.2 29.7-26.2 53.8-58.8 54-32.6.2-59.2-23.8-59.4-53.4v-.6c-.2-29.7 26.2-53.8 58.8-54 32.6-.2 59.2 23.8 59.4 53.4v.6zm82.2 42.7c-25.3 34.6-59.6 35.9-72.3 26.3-13.3-12.4-3.2-50.9 15.1-72 20.9-23.3 43.3-38.5 58.9-26.6 10.5 10.3 16.7 49.1-1.7 72.3zm22.9-73.2c-21.5 9.4-39-105.3-12.6-98.3 43.9 24.7 36.3 79.6 12.6 98.3z"></path></svg>`;
        }
        return `<svg aria-hidden="true" style="height: 16px; width: 20px; color: gray;" focusable="false" data-prefix="fab" data-icon="raspberry-pi" class="svg-inline--fa fa-raspberry-pi fa-w-13" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 407 512"><path fill="currentColor" d="M372 232.5l-3.7-6.5c.1-46.4-21.4-65.3-46.5-79.7 7.6-2 15.4-3.6 17.6-13.2 13.1-3.3 15.8-9.4 17.1-15.8 3.4-2.3 14.8-8.7 13.6-19.7 6.4-4.4 10-10.1 8.1-18.1 6.9-7.5 8.7-13.7 5.8-19.4 8.3-10.3 4.6-15.6 1.1-20.9 6.2-11.2.7-23.2-16.6-21.2-6.9-10.1-21.9-7.8-24.2-7.8-2.6-3.2-6-6-16.5-4.7-6.8-6.1-14.4-5-22.3-2.1-9.3-7.3-15.5-1.4-22.6.8C271.6.6 269 5.5 263.5 7.6c-12.3-2.6-16.1 3-22 8.9l-6.9-.1c-18.6 10.8-27.8 32.8-31.1 44.1-3.3-11.3-12.5-33.3-31.1-44.1l-6.9.1c-5.9-5.9-9.7-11.5-22-8.9-5.6-2-8.1-7-19.4-3.4-4.6-1.4-8.9-4.4-13.9-4.3-2.6.1-5.5 1-8.7 3.5-7.9-3-15.5-4-22.3 2.1-10.5-1.3-14 1.4-16.5 4.7-2.3 0-17.3-2.3-24.2 7.8C21.2 16 15.8 28 22 39.2c-3.5 5.4-7.2 10.7 1.1 20.9-2.9 5.7-1.1 11.9 5.8 19.4-1.8 8 1.8 13.7 8.1 18.1-1.2 11 10.2 17.4 13.6 19.7 1.3 6.4 4 12.4 17.1 15.8 2.2 9.5 10 11.2 17.6 13.2-25.1 14.4-46.6 33.3-46.5 79.7l-3.7 6.5c-28.8 17.2-54.7 72.7-14.2 117.7 2.6 14.1 7.1 24.2 11 35.4 5.9 45.2 44.5 66.3 54.6 68.8 14.9 11.2 30.8 21.8 52.2 29.2C159 504.2 181 512 203 512h1c22.1 0 44-7.8 64.2-28.4 21.5-7.4 37.3-18 52.2-29.2 10.2-2.5 48.7-23.6 54.6-68.8 3.9-11.2 8.4-21.3 11-35.4 40.6-45.1 14.7-100.5-14-117.7zm-22.2-8c-1.5 18.7-98.9-65.1-82.1-67.9 45.7-7.5 83.6 19.2 82.1 67.9zm-43 93.1c-24.5 15.8-59.8 5.6-78.8-22.8s-14.6-64.2 9.9-80c24.5-15.8 59.8-5.6 78.8 22.8s14.6 64.2-9.9 80zM238.9 29.3c.8 4.2 1.8 6.8 2.9 7.6 5.4-5.8 9.8-11.7 16.8-17.3 0 3.3-1.7 6.8 2.5 9.4 3.7-5 8.8-9.5 15.5-13.3-3.2 5.6-.6 7.3 1.2 9.6 5.1-4.4 10-8.8 19.4-12.3-2.6 3.1-6.2 6.2-2.4 9.8 5.3-3.3 10.6-6.6 23.1-8.9-2.8 3.1-8.7 6.3-5.1 9.4 6.6-2.5 14-4.4 22.1-5.4-3.9 3.2-7.1 6.3-3.9 8.8 7.1-2.2 16.9-5.1 26.4-2.6l-6 6.1c-.7.8 14.1.6 23.9.8-3.6 5-7.2 9.7-9.3 18.2 1 1 5.8.4 10.4 0-4.7 9.9-12.8 12.3-14.7 16.6 2.9 2.2 6.8 1.6 11.2.1-3.4 6.9-10.4 11.7-16 17.3 1.4 1 3.9 1.6 9.7.9-5.2 5.5-11.4 10.5-18.8 15 1.3 1.5 5.8 1.5 10 1.6-6.7 6.5-15.3 9.9-23.4 14.2 4 2.7 6.9 2.1 10 2.1-5.7 4.7-15.4 7.1-24.4 10 1.7 2.7 3.4 3.4 7.1 4.1-9.5 5.3-23.2 2.9-27 5.6.9 2.7 3.6 4.4 6.7 5.8-15.4.9-57.3-.6-65.4-32.3 15.7-17.3 44.4-37.5 93.7-62.6-38.4 12.8-73 30-102 53.5-34.3-15.9-10.8-55.9 5.8-71.8zm-34.4 114.6c24.2-.3 54.1 17.8 54 34.7-.1 15-21 27.1-53.8 26.9-32.1-.4-53.7-15.2-53.6-29.8 0-11.9 26.2-32.5 53.4-31.8zm-123-12.8c3.7-.7 5.4-1.5 7.1-4.1-9-2.8-18.7-5.3-24.4-10 3.1 0 6 .7 10-2.1-8.1-4.3-16.7-7.7-23.4-14.2 4.2-.1 8.7 0 10-1.6-7.4-4.5-13.6-9.5-18.8-15 5.8.7 8.3.1 9.7-.9-5.6-5.6-12.7-10.4-16-17.3 4.3 1.5 8.3 2 11.2-.1-1.9-4.2-10-6.7-14.7-16.6 4.6.4 9.4 1 10.4 0-2.1-8.5-5.8-13.3-9.3-18.2 9.8-.1 24.6 0 23.9-.8l-6-6.1c9.5-2.5 19.3.4 26.4 2.6 3.2-2.5-.1-5.6-3.9-8.8 8.1 1.1 15.4 2.9 22.1 5.4 3.5-3.1-2.3-6.3-5.1-9.4 12.5 2.3 17.8 5.6 23.1 8.9 3.8-3.6.2-6.7-2.4-9.8 9.4 3.4 14.3 7.9 19.4 12.3 1.7-2.3 4.4-4 1.2-9.6 6.7 3.8 11.8 8.3 15.5 13.3 4.1-2.6 2.5-6.2 2.5-9.4 7 5.6 11.4 11.5 16.8 17.3 1.1-.8 2-3.4 2.9-7.6 16.6 15.9 40.1 55.9 6 71.8-29-23.5-63.6-40.7-102-53.5 49.3 25 78 45.3 93.7 62.6-8 31.8-50 33.2-65.4 32.3 3.1-1.4 5.8-3.2 6.7-5.8-4-2.8-17.6-.4-27.2-5.6zm60.1 24.1c16.8 2.8-80.6 86.5-82.1 67.9-1.5-48.7 36.5-75.5 82.1-67.9zM38.2 342c-23.7-18.8-31.3-73.7 12.6-98.3 26.5-7 9 107.8-12.6 98.3zm91 98.2c-13.3 7.9-45.8 4.7-68.8-27.9-15.5-27.4-13.5-55.2-2.6-63.4 16.3-9.8 41.5 3.4 60.9 25.6 16.9 20 24.6 55.3 10.5 65.7zm-26.4-119.7c-24.5-15.8-28.9-51.6-9.9-80s54.3-38.6 78.8-22.8 28.9 51.6 9.9 80c-19.1 28.4-54.4 38.6-78.8 22.8zM205 496c-29.4 1.2-58.2-23.7-57.8-32.3-.4-12.7 35.8-22.6 59.3-22 23.7-1 55.6 7.5 55.7 18.9.5 11-28.8 35.9-57.2 35.4zm58.9-124.9c.2 29.7-26.2 53.8-58.8 54-32.6.2-59.2-23.8-59.4-53.4v-.6c-.2-29.7 26.2-53.8 58.8-54 32.6-.2 59.2 23.8 59.4 53.4v.6zm82.2 42.7c-25.3 34.6-59.6 35.9-72.3 26.3-13.3-12.4-3.2-50.9 15.1-72 20.9-23.3 43.3-38.5 58.9-26.6 10.5 10.3 16.7 49.1-1.7 72.3zm22.9-73.2c-21.5 9.4-39-105.3-12.6-98.3 43.9 24.7 36.3 79.6 12.6 98.3z"></path></svg>`;
    }

    /**
     * Collect the berry from the berry bush if it's ripe (every 35 turns)
     */
    interact() {
        if (this.turnsToRipe <= 0) {
            var leafDrop = Math.floor(Math.random() * 3)
            game.getPlayer().addItem(new Berry());
            game.getPlayer().addItem(new Leaf(), 2);
            game.alert("Looted berry bush", `Found 1 berry and ${leafDrop} leaf`);
            this.turnsToRipe = 150;
        }
    }

    /**
     * Every turn remove a turn from the ripe counter
     */
    doTurn() {
        this.turnsToRipe--;
    }
}

class FlintBlock extends Object {

    /**
     * Create a flint block
     */
    constructor() {
        super({ passable: true})
    }

    get html() {
        return '<svg xmlns="http://www.w3.org/2000/svg" style="height: 16px; width: 20px;" viewBox="0 0 512 512"><path d="M0 0h512v512H0z" fill="#ffffff" fill-opacity="1"/><g class="" style="" transform="translate(7,1)"><path d="M407 38.31c-83.1 16.32-65.1 11.63-142.4 3.2-35.3 39.72-55.2 46.16-79.6 55.38-15.2 34.21-32.3 77.31-83.8 98.41-9.05 73.1-34.15 127.5-74.58 163.6 19.12 30.9 20.69 63.5 19.64 96.1 46.79-6.3 71.54 9.6 102.94 18.7 48.2-52.3 112.9-88.8 196.2-107.9 41.1-92.5 127.9-82.1 140-94-23.8-43.7-7.2-94.5-19.8-136.9-3.9-13.1-11.9-25-20.9-36.61-29.3 12.91-43.8 26.91-52 42.51-8.5 15.9-10.3 35-11.7 57.8 8.4-1.2 16.6-1.5 24.1-1.1 9 .5 17.3 2.1 24.1 4.2l-5.2 17.2c-21.3-6.5-64.1-6.7-95.8 26.2l-13-12.6c14.7-15.1 31.2-24.4 47.5-29.6 1.5-25.4 2.7-48.9 14-70.5 9.9-18.7 27.1-34.81 56.4-48.58-11.6-14.56-22.6-29.18-26.1-45.51zm-89.9 48.84l17.2 5.04c-18.7 64.01-56 104.51-104.1 129.11 2.6 24.6 1.8 46-1.7 64.3 11.5-4.3 22.9-6.3 34-6.4 5.9 0 11.7.5 17.5 1.4 22.8 3.8 44.3 14.1 65.1 25.2l-8.4 15.8c-20.4-10.8-40.3-20.1-59.7-23.2-18.1-3-35.7-1.1-54.9 10.2-8.1 21.8-20.8 38.2-36.6 50-10.1 7.6-21.3 13.4-33 17.7-18.7 16-28.2 41.3-26.9 62.8l-18 1c-1.1-18.6 3.8-38.5 14.4-55.6-17.8 3.2-35.75 4.2-52.54 4.3l-.12-18c36.76-.2 77.36-5.5 105.36-26.6 26.3-19.7 43.7-53.1 38.2-115-13.9 5.8-28.5 10.4-43.8 14.1l-4.2-17.4c73.1-17.7 127.7-55.4 152.2-138.75z" fill="#000000" fill-opacity="1"/></g></svg>'
    }

    /**
     * Collect the flint block
     */
    interact() {
        game.getPlayer().addItem(new Flint());
        game.alert("Collected flint", "You picked up 1 flint from the ground")
        game.removeObject(this);
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
