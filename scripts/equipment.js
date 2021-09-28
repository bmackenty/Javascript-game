class EquipmentSlot {
    
    constructor(slotName) {
        this.slotName = slotName;
    }

    get formattedSlotName() {
        return this.slotName.charAt(0).toUpperCase() + this.slotName.slice(1)
    }

    get html() {
        var equipped;
        if (game && game.getPlayer().getItemSlot(this.slotName))
            equipped = game.getPlayer().getItemSlot(this.slotName)

        var slotHTML = "";
        slotHTML +=  `<div id="${this.slotName}" class="inv-slot" ondrop="equipItem('${this.slotName}', event)" onclick="unequipItem('${this.slotName}', event)" ondragover="allowDrop(event)" equipped="${equipped ? equipped.id : "undefined"}">`;
        slotHTML += `${this.formattedSlotName}:`;
        slotHTML += `<p id="${this.slotName}-text" class="inv-drop">${equipped ? equipped.name : ""}</p>`;
        slotHTML += `</div>`;
        
        return slotHTML;
    }
}

/*
Equipment element methods
*/

function allowDrop(e) {
    e.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("item", ev.target.getAttribute("data-item"));
    ev.dataTransfer.setData("name", ev.target.innerHTML);
    ev.dataTransfer.setData("shoes", ev.target.getAttribute("shoes"));
    ev.dataTransfer.setData("hat", ev.target.getAttribute("hat"));
    ev.dataTransfer.setData("smacky", ev.target.getAttribute("smacky"));
}

function equipItem(slotType, e) {
    e.preventDefault();
    var itemId = e.dataTransfer.getData("item");
    if (e.dataTransfer.getData(slotType) == "true") {
        document.getElementById(slotType).setAttribute("equipped", itemId);
        e.dataTransfer.getData(slotType)
        game.updateEquipment();
    }
}

function unequipItem(slotType, e) {
    document.getElementById(slotType).setAttribute("equipped", undefined);
    e.target.innerHTML = "";
    game.updateEquipment();
}