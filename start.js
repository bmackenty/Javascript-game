/*

This is a javascript implementation of a simple ascii art RPG game

TODO: smart terrain generation
TODO: player object
TODO: inventory
TODO: skills
TODO: moving around
TODO: edge of the world : how to deal with it? 
TODO: item name generator
TODO: a wilderness zone
TODO: a town zone
TODO: a space zone (really  - I have big plans for interplanetary travel)
TODO: a combat zone
TODO: a store zone (buy / sell)
TODO: a character sheet zone
TODO: a quest zone (give/receive quests)
TODO: maybe a crafting zone to craft stuff
TODO: an event zone, so after X number of turns we can trigger events
TODO: animals 
TODO: NPC's
TODO: put listener into a function claled main_game_loop. 
HINT: throw new Error("Something went badly wrong!");
LEARNED: about shallow copies. Thanks stackoverflow

*/

const main_map = document.getElementById('main_map');
var turn = 0;
var grid = [];
var terrain;
var destination_terrain = 1;
var player = {};
var foo = [];
var array_for_map = [];

function initialize() {
console.log('function initialize start');
  player = {
    score: 0,
    name: "Player",
    level: 1,
    rank: "ready to be eaten",
    kingdom: "None",
    reputation: "huh?",
    skills: [["not dying",1], ["running away",10]],
    location_X: 0,
    location_Y: 0,
    location_Z: 0,
    health: 100,
    magic: 100,
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    dexterity: 10,
    constitution: 10,
    charisma: 10,
    luck: 10,
    region: "newbie",
    inventory: {
                    weapon_1: {
                        name: 'The feeble axe of butterfly death!',
                        category: 'weapon',
                        damage: 20,
                        cursed: 0,
                        material: 'wood',
                        plus_to_hit: 0,
                        plus_to_damage: 0,
                        level: 1,
                        type: 'axe',
                        cost: 5,
                        equipped: 'no' 
                    },

                    weapon_2: {
                        name: 'The feeble axe of mosquito death!',
                        category: 'weapon',
                        damage: 20,
                        cursed: 0,
                        material: 'wood',
                        plus_to_hit: 0,
                        plus_to_damage: 0,
                        level: 1,
                        type: 'axe',
                        cost: 5,
                        equipped: 'no'
                    },
                    weapon_3: {
                        name: 'The strong axe of killing small things!',
                        category: 'weapon',
                        damage: 20,
                        cursed: 0,
                        material: 'wood',
                        plus_to_hit: 0,
                        plus_to_damage: 0,
                        level: 1,
                        type: 'axe',
                        cost: 5,
                        equipped: 'no'
                    },
                    thing_1: {
                        name: 'Incredible potion of doing nothing',
                        category: 'potion',
                        damage: 0,
                        cursed: 0,
                        material: 'glass',
                        plus_to_hit: 0,
                        plus_to_damage: 0,
                        level: 1,
                        type: 'potion',
                        cost: 2,
                        equipped: 'no'
                    }

                }

        }
        update_footer(player);
        update_messages(player);
        document.getElementById('messages').innerHTML = "Welcome.";
        console.log('function initialize end');
        return player;
} 

function make_random_terrain() {
    console.log('function make random terrain start');
    // the stuff below generates an array which is then eventually translated into terrain
    var counter = 1;
    while ( counter <= 1189 ) {
    // the line below creates some random terrain. totally random, TODO: this needs to be smart.
    terrain = Math.floor(Math.random() * 5)+1;
    grid.push(terrain);
    counter += 1;
    }
    console.log('function make random terrain end');
    return grid;
}

function starting_map() {
    console.log('function starting map start');
    grid.splice(0, 30, 7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7);
    // grid.splice(1, 0, 7);
    // grid.splice(2, 0, 7);
    // grid.splice(3, 0, 7);
    // grid.splice(4, 0, 7);
    grid.splice(34, 0, 7);
    grid.splice(67, 0, 7);
    grid.splice(101, 0, 7);
    grid.splice(135, 0, 7);

    // make player starting location. It's just TOTALLY for testing. Also, we should track the current player location for
    // reasons. 
    grid.splice(60, 0, 6);
    console.log('function starting map end');
}

function draw_map(array_for_map) {
   var temp_grid = array_for_map.slice(0);
    var counter = 0;
    var arrayLength = array_for_map.length;
    for (var i = 0; i < arrayLength; i++) {

    if (array_for_map[i] === 1 || array_for_map[i] === 2 || array_for_map[i] === 3){
        // this is plain, open terrain
        array_for_map[i] = "<i class=\"fas fa-ellipsis-h fa-fw\" style=\"color:#D2B48C\"></i>";
    } else if (array_for_map[i] === 4) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:green\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"A tree.\"></i>";
    } else if (array_for_map[i] === 5) {
        // this is a mountain or hill
        array_for_map[i] = "<i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"A mountain\"></i>";
    } else if (array_for_map[i] === 6) {
        // this is the player object
        array_for_map[i] = "<i class=\"fas fa-child fa-fw\" style=\"color:red\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"You.\"></i>";
    } else if (array_for_map[i] === 7) {
        // impossible, impassible mountains of Thogar (aka Thogars Teeth)
        array_for_map[i] = "<i class=\"fas fa-mountain fa-fw\" style=\"color:black\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Impossible, impassible mountains of Thogar (aka Thogars Teeth)\"></i>";
    }

}
 
array_for_map = array_for_map.join('');

// this is where we draw the map. once we draw it, we want to turn grid back into a normal array. 
document.getElementById("main_map").innerHTML = array_for_map;

grid = temp_grid.slice(0);

return array_for_map;
}

function move(direction) {
// issue with not counting until the first move.
  if (direction === 'r'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(6);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location + 1;
    // now we check if terrain is passable
    if (grid[destination] === 1 || grid[destination] === 2 || grid[destination] === 3 ) {
        // now lets replace the terrain that was in the old place.
        grid[destination - 1] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location + 1];
        // now let's move the player icon. 
        grid[destination] = 6;
        // now lets update the map
        draw_map(grid);
    } else {

        document.getElementById("messages").innerHTML += "No. Nie. Nein. Nyet, Nu, Uimh... Something blocks your path...";

    }


  } else if (direction === 'l'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(6);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location - 1;
    // now we check if terrain is passable
    if (grid[destination] === 1 || grid[destination] === 2 || grid[destination] === 3 ) {
        // now lets replace the terrain that was in the old place.
        grid[destination + 1] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location - 1];
        // now let's move the player icon. 
        grid[destination] = 6;
        // now lets update the map
        draw_map(grid);
    } else {

        document.getElementById("messages").innerHTML += "No. Nie. Nein. Nyet, Nu, Uimh... Something blocks your path...";

    }


  } else if (direction === 'u'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(6);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location - 34;
    // now we check if terrain is passable
    if (grid[destination] === 1 || grid[destination] === 2 || grid[destination] === 3 ) {
        // now lets replace the terrain that was in the old place.
        grid[destination + 34] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location - 34];
        // now let's move the player icon. 
        grid[destination] = 6;
        // now lets update the map
        draw_map(grid);
    } else {

            document.getElementById("messages").innerHTML += "No. Nie. Nein. Nyet, Nu, Uimh... Something blocks your path...";
    
        }

    } else if (direction === 'd'){

        // let's start by getting the current location of the player
        var current_location = grid.indexOf(6);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location + 34;
        // now we check if terrain is passable
        if (grid[destination] === 1 || grid[destination] === 2 || grid[destination] === 3 ) {
            // now lets replace the terrain that was in the old place.
            grid[destination - 34] = destination_terrain;
            // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
            destination_terrain = grid[current_location + 34];
            // now let's move the player icon. 
            grid[destination] = 6;
            // now lets update the map
            draw_map(grid);

        } else {
    
                document.getElementById("messages").innerHTML += "No. Nie. Nein. Nyet, Nu, Uimh... Something blocks your path...";
        
            }

    return
  }

} 

function update_footer() {
    document.getElementById("footer").innerHTML = "Health: " + player.health + " | Magic: " + player.magic + " | Turn: " + turn;
}

function update_messages() {
// if messages are a certain length, do a "more messages" or something.
}

function inventory() {
// this function displays inventory. Eventually it will do more inventory stuff. 
    console.log(Object.keys(player.inventory).length);
    inventory_length = Object.keys(player.inventory).length;
    modal_body.innerHTML = "";
    modal_body.innerHTML += "You are currently carrying " + inventory_length + " items. <br /><br />";
    var print_weapons_header = false;
    var print_potion_header = false;
    for (var i in player.inventory) {
        
        if (player.inventory[i].category === 'weapon') {
            if (!print_weapons_header) {
                modal_body.innerHTML += "<strong>Things to poke your enemies with and prevent your inevitable death:</strong><ul>";
                print_weapons_header = true;
            }
            modal_body.innerHTML += "<li>" + player.inventory[i].name + "</li>";
            }
            modal_body.innerHTML += "</ul>";

            if (player.inventory[i].category === 'potion') {
                if (!print_potion_header) {
                    modal_body.innerHTML += "<br /><strong>Strange liquid in a glass jars:</strong><ul>";
                    print_potion_header = true;
                }
                modal_body.innerHTML += "<li>" + player.inventory[i].name + "</li>";
                }
                modal_body.innerHTML += "</ul>";
        }
    


    $(document).ready(function() {
        $('#exampleModal').modal('show');
    });
}

function main_listener() {
    // the code below is used from https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a
    // I also used this site for keycodes: https://keycode.info/
    // the code below listens for keys being released, and then triggers a function which "does something". 

    document.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    var key = event.key || event.keyCode;

    if (key === 'Escape' || key === 'Esc' || key === 27) {
        document.getElementById("messages").innerHTML = key;



        } else if (key === 'ArrowRight' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('r');
            // increment the turn counter 
            turn = turn + 1;


        } else if (key === 'ArrowLeft' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('l')
            // finally, we update the map after the move has been completed (but this might no belong here).
            document.getElementById("main_map").innerHTML = draw_map(grid); 
            // increment the turn counter 
            turn = turn + 1;

        } else if (key === 'ArrowUp' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('u')
            // finally, we update the map after the move has been completed (but this might no belong here).
            document.getElementById("main_map").innerHTML = draw_map(grid); 
            // increment the turn counter 
            turn = turn + 1;

            

        } else if (key === 'ArrowDown' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('d')
            // finally, we update the map after the move has been completed (but this might no belong here).
            document.getElementById("main_map").innerHTML = draw_map(grid); 
            // increment the turn counter 
            turn = turn + 1;

            
            
        } else if (key === '?' || key === 191) {
            document.getElementById("messages").innerHTML = key; 
            
            
        } else if (key === 'i' || key === 73 || key === 'I') {
            inventory(); 
    }
    });
}

initialize();
// must I have the line below? 
const entries = Object.entries(player)
make_random_terrain();
starting_map();
draw_map(grid);
main_listener();
