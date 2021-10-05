class Item {

    /**
     * Create an item
     * @param {String} name - The name of the item
     * @param {String} image - the image of the item
     * @param {String} description - The description of the item
     * @param {Object} wearable - Options for where the player can wear this item
     * @param {Object} smackable - Option if it is a weapon
     */
    constructor(name, image, description, smackable, wearable, stats) {
        this.name = name;
        this.image = image;
        this.description = description;
        this.id = Math.random(); // Used for item equipping

        this.smackable = smackable;
        this.wearable = wearable;
        this.stats = stats;
    }

    get html() {
        
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
        super("Apple","<img alt=\"Apple\" style=\"vertical-align: middle\" src=\"images/apple.png\"  width=\"25\" height=\"25\">", "An apple a day keeps MrMackenty away");
    }
}

class Wood extends Item {

    constructor() {
        super("Wood","<img alt=\"Wood\" style=\"vertical-align: middle\" src=\"images/wood.png\"  width=\"25\" height=\"25\">", "It's just a tree log");
    }
}

class Stick extends Item {

    constructor() {
        super("Stick","<img alt=\"Stick\" style=\"vertical-align: middle\" src=\"images/stick.png\"  width=\"25\" height=\"25\">", "Almight stick.",{
            smacky: true
        }, {
            damage: 1.25*(5/3)
        })
    }
}

class SharpenedStick extends Item {

    constructor() {
        super("Sharpened Stick","<img alt=\"Sharpened Stick\" style=\"vertical-align: middle\" src=\"images/sharpenedStick.png\"  width=\"25\" height=\"25\">",  "It's a stick, AND IT'S SHARPENED.",{
            smacky: true
        }, {
            damage: 1.75*(5/3)
        })
    }
}

class Bone extends Item {

    constructor() {
        super("Bone","<img alt=\"Bone\" style=\"vertical-align: middle\" src=\"images/bone.png\"  width=\"25\" height=\"25\">",  "Some being's bone.",{
            smacky: true
        }, {
            damage: 1.5*(5/3)
        })
    }
}

class String extends Item {

    constructor() {
        super("String","<img alt=\"String\" style=\"vertical-align: middle\" src=\"images/string.png\"  width=\"25\" height=\"25\">",  "Spiderman's hair.");
    }
}

class Leather extends Item {

    constructor() {
        super("Leather","<img alt=\"Leather\" style=\"vertical-align: middle\" src=\"images/leather.png\"  width=\"25\" height=\"25\">",  "Maybe you can make some clothes out of this...");
    }
}
class Fire extends Item{
    constructor() {
        super("Fire","first revolution of humankind")
    }
}

class RawMeat extends Item {

    constructor() {
        super("Raw Meat","<img alt=\"Raw Meat\" style=\"vertical-align: middle\" src=\"images/rawMeat.png\"  width=\"25\" height=\"25\">", "Not recommended to be eaten raw.",{
            smacky: true
        }, {
            damage: 1*(5/3)
        })
    }
}

class CookedMeat extends Item {

    constructor() {
        super("Cooked meat", "Best Food to eat");
    }

    interact() {
        game.getPlayer().health += 45;
        game.getPlayer().removeItem(this, 1);
        game.alert("Ate cooked meat", "You regenerated 40 health")
        return;
    }
}

class LeatherBoots extends Item {

    constructor() {
        super("Leather Boots", "<img alt=\"Leather Boots\" style=\"vertical-align: middle\" src=\"images/leatherBoots.png\"  width=\"25\" height=\"25\">", "Great for hiking, not so much for killing.", {
            shoes: true
        }, {
            defence: 0.1
        });
    }
}

class Berry extends Item {

    constructor() {
        super("Berry","<img alt=\"Berry\" style=\"vertical-align: middle\" src=\"images/berry.png\"  width=\"25\" height=\"25\">", "A ok food source.");
    }

    interact() {
        game.getPlayer().health += 10;
        game.getPlayer().removeItem(this, 1);
        game.alert("Ate an berry", "You regenerated 10 health")
        return;
    }
}

class Flint extends Item {

    constructor() {
        super("Flint","<img alt=\"Flint\" style=\"vertical-align: middle\" src=\"images/flint.png\"  width=\"25\" height=\"25\">",  "A special type of sharp rock.");
    }
}

class Leaf extends Item {

    constructor() {
        super("Leaf","<img alt=\"Leaf\" style=\"vertical-align: middle\" src=\"images/leaf.png\"  width=\"25\" height=\"25\">",  "A green not spikey funny object.")
    }
}

class SewingKit extends Item {
    
    constructor() {
        super("Sewing Kit","<img alt=\"Sewing Kit\" style=\"vertical-align: middle\" src=\"images/sewingKit.png\"  width=\"25\" height=\"25\">",  "A advanced item used in crafting for advanced clothing.")
    }
}

class FlintAxe extends Item {

    constructor() {
        super("Flint axe","<img alt=\"Flint Axe\" style=\"vertical-align: middle\" src=\"images/flintAxe.png\"  width=\"25\" height=\"25\">",  "It's not amazing, great, or good, but better than whatever you have.",{
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
        super("Jungle Hat","<img alt=\"Jungle Hat\" style=\"vertical-align: middle\" src=\"images/jungleHat.png\"  width=\"25\" height=\"25\">",  "IUNGLE BOIIIIIIIIII. FLY LIKE A BIRD, FLY THROUGH THE TREEEEES, SPEAK VIETNAMEEESE (only with this hat)", {
            hat: true
        }, {
            defence: 0.3
        })
    }
}
class BerryStew extends Item {
    
      constructor() {
        super("Berry Stew","<img alt=\"Bery Strew\" style=\"vertical-align: middle\" src=\"images/berryStew.png\"  width=\"25\" height=\"25\">",  "A good food source.");
    }

    interact() {
        game.getPlayer().health += 25;
        game.getPlayer().removeItem(this, 1);
        game.alert("Ate berry stew", "You regenerated 25 health")
        return;
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
