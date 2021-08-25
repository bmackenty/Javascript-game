class Recipe {
	
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