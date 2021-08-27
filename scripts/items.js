class Item {

    /**
     * Create a item
     * @param {String} name - The name of the item
     * @param {String} description - The description of the item
     * @param {Object} wearable - Options for where the player can wear this item
     */
    constructor(name, description, wearable = {}) {
        this.name = name;
        this.description = description;
        this.id = Math.random(); // Used for item equipping

        this.wearable = wearable
    }

    get shoesWearable() {
        return this.wearable.shoes
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
        super("Stick", "Almight stick.");
    }
}

class SharpenedStick extends Item {

    constructor() {
        super("Sharpened Stick", "It's a stick, AND IT'S SHARPENED.")
    }
}

class Bone extends Item {

    constructor() {
        super("Bone", "Some being's bone.");
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
        super("Raw Meat", "Not recommended to be eaten raw.");
    }
}

class LeatherBoots extends Item {

    constructor() {
        super("Leather Boots", "Great for hiking, not so much for killing.", {
            shoes: true
        });
    }
}

class Berry extends Item {

    constructor() {
        super("Berry", "A ok food source.");
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
        super("Flint axe", "It's not amazing, great, or good, but better than whatever you have.")
    }
}

class MeshFilter extends Item {

    constructor() {
        super("Mesh filter", "Stops the flies from comming in")
    }
}

class JungleHat extends Item {
    
    constructor() {
        super("Jungle Hat", "IUNGLE BOIIIIIIIIII. FLY LIKE A BIRD, FLY THROUGH THE TREEEEES, SPEAK VIETNAMEEESE (only with this hat)")
    }
}