class Item {

    /**
     * Create a item
     * @param {String} name - The name of the item
     * @param {String} description - The description of the item
     * @param {Object} wearable - Options for where the player can wear this item
     * @param {Object} smackable - Option if it is a weapon
     */
    constructor(name, description, smackable, wearable, stats) {
        this.name = name;
        this.description = description;
        this.id = Math.random(); // Used for item equipping

        this.smackable = smackable;
        this.wearable = wearable
        this.stats = stats;
    }

    get shoesWearable() {
        return this.wearable.shoes
    }

    get hatWearable() {
        return this.wearable.hat
    }

    get smackySmackable() {
        return this.smackable.smacky
    }
}

class Recipe {
	
    /**
     * Create a crafting recipe
     * @param {Object} output - The object to give the player when crafting has been acomplished
     * @param {Array} input - The array of objects (or a single object) that are required and will be consumed when crafting the item
     */
	constructor(output, input) {
		this.output = output;
		this.input = input;
	}

    /**
     * Check if a list of items satisfies the requirements to craft the recipe
     * @param {Array} inventory - Array of items to check for
     * @returns {Boolean} Whether the items can craft the recepie
     */
	requirementsSatisfied(inventory) {
		var itemsLeft = [...this.input];

		for (var iIndex in inventory) {
			for (var rIndex in itemsLeft) {
				if (inventory[iIndex].name == itemsLeft[rIndex].name) {
					itemsLeft.splice(rIndex, 1)
				}
			}
		}

		return itemsLeft.length <= 0;
	}
}

class Apple extends Item {

    constructor() {
        super("Apple", "An apple a day keeps MrMackenty away");
    }
}

class Wood extends Item {

    constructor() {
        super("Wood", "It's just a tree log");
    }
}

class Stick extends Item {

    constructor() {
        super("Stick", "Almight stick.",{
            smacky: true
        }, {
            damage: 1.25*(5/3)
        })
    }
}

class SharpenedStick extends Item {

    constructor() {
        super("Sharpened Stick", "It's a stick, AND IT'S SHARPENED.",{
            smacky: true
        }, {
            damage: 1.75*(5/3)
        })
    }
}

class Bone extends Item {

    constructor() {
        super("Bone", "Some being's bone.",{
            smacky: true
        }, {
            damage: 1.5*(5/3)
        })
    }
}

class String extends Item {

    constructor() {
        super("String", "Spiderman's hair.");
    }
}

class Leather extends Item {

    constructor() {
        super("Leather", "Maybe you can make some clothes out of this...");
    }
}

class RawMeat extends Item {

    constructor() {
        super("Raw Meat", "Not recommended to be eaten raw.",{
            smacky: true
        }, {
            damage: 1*(5/3)
        })
    }
}

class LeatherBoots extends Item {

    constructor() {
        super("Leather Boots", "Great for hiking, not so much for killing.", {
            shoes: true
        }, {
            defence: 0.1
        });
    }
}

class Berry extends Item {

    constructor() {
        super("Berry", "A ok food source.");
    }

    interact() {
        game.getPlayer().health += 10;
        game.getPlayer().removeItem(this, 1);
        game.alert("Ate an apple", "You regenerated 10 health")
        return;
    }
}

class Flint extends Item {

    constructor() {
        super("Flint", "A special type of sharp rock.");
    }
}

class Leaf extends Item {

    constructor() {
        super("Leaf", "A green not spikey funny object.")
    }
}

class SewingKit extends Item {
    
    constructor() {
        super("Sewing Kit", "A advanced item used in crafting for advanced clothing.")
    }
}

class FlintAxe extends Item {

    constructor() {
        super("Flint axe", "It's not amazing, great, or good, but better than whatever you have.",{
            smacky: true
        }, {
            damage: 3
        })
    }
}

class MeshFilter extends Item {

    constructor() {
        super("Mesh filter", "Stops the flies from comming in")
    }
}

class JungleHat extends Item {
    
    constructor() {
        super("Jungle Hat", "IUNGLE BOIIIIIIIIII. FLY LIKE A BIRD, FLY THROUGH THE TREEEEES, SPEAK VIETNAMEEESE (only with this hat)", {
            hat: true
        }, {
            defence: 0.3
        })
    }
}


/**
 * List of weapons
 * Fist - 1
 * Stick - 1.25
 * Bone - 1.5
 * Sharpened Stick - 1.75
 * Flint Ace - 2
 * Meat - 1
 */