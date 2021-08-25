class Item {

    /**
     * Create a item
     * @param {String} name - The name of the item
     * @param {String} description - The description of the item
     */
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

class LeatherBoots extends Item {

    constructor() {
        super("Leather Boots", "Great for hiking, not so much for killing");
    }
}