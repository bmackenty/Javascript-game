/*

This is a javascript implementation of a simple ascii art RPG game

TODO: smart terrain generation
TODO: inventory
TODO: achievement / badges / honors (all should be funny)
TODO: skills
TODO: moving around
TODO: edge of the world : how to deal with it? 
TODO: item name generator
TODO: building screen
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
TODO: changelog
TODO: add credits
TODO: help screen, ditch tooltips
HINT: throw new Error("Something went badly wrong!");
LEARNED: about shallow copies. Thanks stackoverflow
TODO: make alert messages more random, funny and meaningful

TODO: remove bear trap after its been triggered

DONE STUFF: 

TODO: player object
TODO: put listener into a function. 
TODO: death
TODO: different trees

*/

const main_map = document.getElementById('main_map');
var turn = 0;
var grid = [];
var terrain;
var destination_terrain = 1;
var player = {};
var foo = [];
var array_for_map = [];
var clear_message_counter = 0;

function exists(arr, search) {
    // used with gratitude from:
    // https://stackoverflow.com/questions/48538162/how-to-check-if-a-two-dimensional-array-includes-a-string
    return arr.some(row => row.includes(search));
}

function initialize() {


console.log('function initialize start');
  player = {
    score: 0,
    name: "Player",
    level: 1,
    rank: "ready to be eaten",
    kingdom: "None",
    reputation: "huh?",
    skills: {
            'Not dying':1,
            'Running away':10
            }, 
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
    achievements: {
                    achievement_1: {
                        name: 'test',
                        awarded: 'date'
                    }
    },
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
                        name: 'The axe of killing small things!',
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
                    },
                    craft_1: {
                        name: 'wood',
                        category: 'craft',
                        quantity: 0
                    }

                }

        }
        update_footer(player);
        update_messages(player);
        update_stats(player);
        document.getElementById('messages').innerHTML = "Welcome.";
        console.log('function initialize end');
        return player;
} 

function game_messages(message){
    if (clear_message_counter > 6) {
        document.getElementById("messages").innerHTML = "";
        clear_message_counter = 0;
    }
    

    if (message === "cant_go_there") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "Your path is blocked </div>";
        clear_message_counter += 1;

    }

    else if (message === "bear_trap") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You have walked into a bear trap and suffered horribly. The bears thank you. </div>";
        clear_message_counter += 1;
    }

    else if (message === "triggered_bear_trap") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You pass over a triggered bear trap. You wonder who was silly enough to actually step on a bear trap. <br /><br />...and then you look down at your leg.... </div>";
        clear_message_counter += 2;
    }

    else if (message === "monster") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You have stumbled upon a rather hungry spider. </div>";
        clear_message_counter += 1;
    }

    else if (message === "gather_wood") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You gather some wood. Tree killer. </div>";
        clear_message_counter += 1;
    }

    else if (message === "died") {

        document.getElementById("main_map").innerHTML = "<br /> *** You have died *** <br /><br /> " + 
        "<a href=\"#\" onclick=\"window.location.reload(true);\">Click to restart</a>";
    }
}

function make_random_terrain() {
    console.log('function make random terrain start');
    // the stuff below generates an array which is then eventually translated into terrain
    var counter = 1;
    while ( counter <= 1191 ) {
    // the line below creates some random terrain. totally random, TODO: this needs to be smart.
    terrain = Math.floor(Math.random() * 25)+1;
    grid.push(terrain);
    counter += 1;
    }
    console.log('function make random terrain end');
    return grid;
}

function starting_map() {
    console.log('function starting map start');


    // the lines below are for bear traps. Because BEAR TRAPS!!!!
    grid.splice(109, 1, 98);
    grid.splice(100, 1, 98);
    grid.splice(523, 1, 98);
    grid.splice(58, 1, 98);
    grid.splice(999, 1, 98);
    grid.splice(241, 1, 98);
    grid.splice(387, 1, 98);
    grid.splice(366, 1, 98);
    grid.splice(42, 1, 98);
    grid.splice(49, 1, 98);
    // this is our very very first try at procedural generation. it works. but it's basic.

    var test_start = 470;
    var test_counter = 0;
    var row_size = 6;
    var variance = Math.floor(Math.random() * 4) - 2;
    var i = 0;
    while (i < 55) {
    	if (test_counter < 10) {
    		grid[(test_start+row_size)] = 10;
    		i++;
    		test_counter++;
    		row_size++;
    	} else {
    		test_start = test_start + (34+variance);
    		test_counter = 1;
    		row_size = 6;
    	}
    }
    // make player starting location. It's just TOTALLY for testing. Also, we should track the current player location for
    // reasons. 
    grid.splice(57, 1, 99);

    // and, again, just for debugging, a spider. 
    grid.splice(652,1,300);

        // the side mountain range along the left side of the map
        grid.splice(0, 1, 100);
        grid.splice(34, 1, 100);
        grid.splice(68, 1, 100);
        for (var i=102;i <1191;i=i+34){
            grid.splice(i, 0, 100);
        }
    
        // the top mountain range
        for (var j=1;j <35;j++){
            grid.splice(j, 1, 100);
        }
    console.log('function starting map end');
    count_trees();
}

function count_trees() {
    var number_of_trees = 0;
    size_of_array = grid.length;
    for (var i=0;i < size_of_array; i++) {
        if (grid[i] == 4 || (grid[i] >= 10 || grid[i] <=18)) {
            var number_of_trees = number_of_trees + 1;
    }
}
console.log("there are: " + number_of_trees);
return
}

function draw_map(array_for_map) {
    // TODO: put these in sensible order (parsing order == beter optimization??)

   var temp_grid = array_for_map.slice(0);
    var counter = 0;
    var arrayLength = array_for_map.length;
    for (var i = 0; i < arrayLength; i++) {

    if (array_for_map[i] <= 3 || (array_for_map[i] >=19 && array_for_map[i] <=25) || array_for_map[i] === 5 || array_for_map[i] === 7){
        // this is plain, open terrain
        array_for_map[i] = "<i class=\"fas fa-ellipsis-h fa-fw\" style=\"color:#D2B48C\"></i>";
    
    } else if (array_for_map[i] === 10) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#229954\" title=\"A grue tree.\"></i>";

    } else if (array_for_map[i] === 4) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:green\" title=\"A tall tree.\"></i>";


    } else if (array_for_map[i] === 11) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#387A19\" title=\"An oak tree.\"></i>";

    } else if (array_for_map[i] === 12 || array_for_map[i] === 8) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#176F43\" title=\"A spruce tree.\"></i>";
    } else if (array_for_map[i] === 13 || array_for_map[i] === 6) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#06B701\" title=\"A palm tree.\"></i>";

    } else if (array_for_map[i] === 14 || array_for_map[i] === 9) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#50CE0D\" title=\"A willow tree.\"></i>";

    } else if (array_for_map[i] === 15) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#285A0D\" title=\"An ash tree.\"></i>";

    } else if (array_for_map[i] === 16) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#3A572A\" title=\"A fir tree.\"></i>";

    } else if (array_for_map[i] === 17) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#42B306\" title=\"A birch tree.\"></i>";

    } else if (array_for_map[i] === 18) {
        // this is a tree
        array_for_map[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:#2E4720\" title=\"A yew tree.\"></i>";
        }

     else if (array_for_map[i] === 98) {
        // ACTIVE bear trap. Heh. 
        array_for_map[i] = "<i class=\"fab fa-codepen fa-fw\" style=\"color:black\" title=\"Bear Attractor\"></i>";
    } else if (array_for_map[i] === 97) {
        // TRIGGERED bear trap. Heh. 
        array_for_map[i] = "<i class=\"fab fa-codepen fa-fw\" style=\"color:grey\" title=\"Triggered Bear Attractor\"></i>";
    }
     else if (array_for_map[i] === 99) {
        // this is the player object
        array_for_map[i] = "<i class=\"fas fa-child fa-fw\" style=\"color:red\" title=\"You.\"></i>";

    } else if (array_for_map[i] === 101) {
        // this is a mountain or hill
        array_for_map[i] = "<i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"  title=\"A mountain\"></i>";
    
    } else if (array_for_map[i] === 100) {
        // impossible, impassible mountains of Thogar (aka Thogars Teeth)
        array_for_map[i] = "<i class=\"fas fa-mountain fa-fw\" style=\"color:black\" title=\"Impossible impassible mountains of Thogar (aka Thogars Teeth)\"></i>";
    }

    else if (array_for_map[i] === 300) {
    // spider 
    array_for_map[i] = "<i class=\"fas fa-spider fa-fw\" style=\"color:green\" title=\"You know those little cute spiders? This isn't one of those.\"></i>";
}

    

}
 
array_for_map = array_for_map.join('');

// this is where we draw the map. once we draw it, we want to turn grid back into a normal array. 
document.getElementById("main_map").innerHTML = array_for_map;

grid = temp_grid.slice(0);

return array_for_map;
}

function draw_combat_screen(){
    
}

function map_interaction_item(map_object,destination){    
    console.log("hi. I'm map_interaction_item function, and you've just passed me: " + map_object);
    if (map_object <= 3 || (map_object >= 19 && map_object <= 25) || map_object === 5 || map_object === 7) {
        return ("allow_move")

    } else if (map_object === 100  || map_object === 101){
        return ("prohibit_move")
    

    }   else if (map_object === 98) {
        // bear trap code: 
        // randomize damage
        player.health = (player.health - 21);
        
        if ('Friend of the Bear' in player.skills) {
                player.skills["Friend of the Bear"] += 1;
                game_messages("bear_trap");
                grid[destination] = 97;
                return ("allow_move")
            } else {
                player.skills["Friend of the Bear"] = 1;
                game_messages("bear_trap");
                grid[destination] = 97;
                return ("allow_move")
            }
        } else if (map_object === 97) {
            game_messages("triggered_bear_trap");
            return ("allow_move")

        } else if (map_object === 300) {
            game_messages("monster");
            combat(map_object,destination);
            return

    } else if (map_object === 4 || (map_object >= 10 || map_object <=18)) {
            game_messages("gather_wood");
            player.inventory["craft_1"].quantity += 10;
            grid[destination] = 1;
            return ("allow_move")


    } else {
        return("prohibit_move")

    }
}

function combat(map_object,destination){
    document.getElementById('main_map').innerHTML = "foo";
    return
}

function move(direction) {
// issue with not counting until the first move.
  if (direction === 'r'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(99);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location + 1;
    // now we check if terrain is passable
    var result_of_move = map_interaction_item(grid[destination],destination);

    if (result_of_move === "allow_move") {
        // now lets replace the terrain that was in the old place.
        grid[destination - 1] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location + 1];
        // now let's move the player icon. 
        grid[destination] = 99;
            // increment the turn counter 
            turn = turn + 1;
            // now lets update the map
            draw_map(grid);
            update_footer();
            update_stats(player);

    } else {
        game_messages("cant_go_there");
    } 
}

     else if (direction === 'l'){

        // let's start by getting the current location of the player
        var current_location = grid.indexOf(99);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location - 1;
        // now we check if terrain is passable
        var result_of_move = map_interaction_item(grid[destination],destination);
    
        if (result_of_move === "allow_move") {
            // now lets replace the terrain that was in the old place.
            grid[destination + 1] = destination_terrain;
            // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
            destination_terrain = grid[current_location - 1];
            // now let's move the player icon. 
            grid[destination] = 99;
                // increment the turn counter 
                turn = turn + 1;
                // now lets update the map
                draw_map(grid);
                update_footer();
                update_stats(player);
    
        } else {
            game_messages("cant_go_there");
        } 
    


  } else if (direction === 'u'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(99);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location - 34;
    // now we check if terrain is passable
    var result_of_move = map_interaction_item(grid[destination],destination);

    if (result_of_move === "allow_move") {
        // now lets replace the terrain that was in the old place.
        grid[destination + 34] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location - 34];
        // now let's move the player icon. 
        grid[destination] = 99;
            // increment the turn counter 
            turn = turn + 1;
            // now lets update the map
            draw_map(grid);
            update_footer();
            update_stats(player);

    } else {
        game_messages("cant_go_there");
    } 

    } else if (direction === 'd'){

        // let's start by getting the current location of the player
        var current_location = grid.indexOf(99);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location + 34;
        // now we check if terrain is passable
        var result_of_move = map_interaction_item(grid[destination],destination);
    
        if (result_of_move === "allow_move") {
            // now lets replace the terrain that was in the old place.
            grid[destination - 34] = destination_terrain;
            // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
            destination_terrain = grid[current_location + 34];
            // now let's move the player icon. 
            grid[destination] = 99;
                // increment the turn counter 
                turn = turn + 1;
                // now lets update the map
                draw_map(grid);
                update_footer();
                update_stats(player);
    
        } else {
            game_messages("cant_go_there");
        } 

    return
  }

} 

function death() {
    game_messages("died");
    return
}

function update_footer() {
    if (player.health <= 0){
        death();
    }
    document.getElementById("footer").innerHTML = "Health: " + health_number_to_text(player.health) + " | Magic: " + player.magic + " | Turn: " + turn;
}

function update_messages() {
// if messages are a certain length, do a "more messages" or something.
}

function health_number_to_text(value){
    var condition;
    if (value < 0){
        condition = "<font color=\"black\"><strong>DEAD!(" + value + ")</strong></font>";
        return condition
    } else if (value < 10){
        condition = "<font color=\"#FF001F\"><strong>Basically about dead.(" + value + ")</strong></font>";
        return condition
    } else if (value < 20) {
        condition = "<font color=\"#FF001F\"><strong>Falling off the edge of death. (" + value + ")</strong></font>";
        return condition
    } else if (value < 30) {
        condition = "<font color=\"#FF001F\"><strong>Edge of death(" + value + ")</strong></font>";
        return condition
    } else if (value < 40) {
        condition = "<font color=\"#FF001F\"><strong>Mildly decapitated (" + value + ")</strong></font>";
        return condition
    } else if (value < 50) {
        condition = "<font color=\"#FF001F\"><strong>Damaged liver(" + value + ")</strong></font>";
        return condition
    } else if (value < 60) {
        condition = "<font color=\"#FBB004\"><strong>Missing part of leg(" + value + ")</strong></font>";
        return condition
    } else if (value < 70) {
        condition = "<font color=\"green\"><strong>Unhealthy (" + value + ")</strong></font>";
        return condition
    } else if (value < 80) {
        condition = "<font color=\"green\"><strong>Less healthy (" + value + ")</strong></font>";
        return condition
    } else if (value < 101) {
        condition =  "<font color=\"green\"><strong>Healthy (" + value + ")</strong></font>";
        return condition
    }
}

function update_stats(player) {
    document.getElementById("stats_and_inventory_block").innerHTML = "<div class=\"category\">Skills</div><ul>";
    for(var i in player.skills) {

        document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + i + " : " + player.skills[i] + "</li>";
    }
    document.getElementById("stats_and_inventory_block").innerHTML += "</ul><br />";
    document.getElementById("stats_and_inventory_block").innerHTML += "<div class=\"category\">Inventory</div><ul>";
    
    var print_header = false;
    for(var j in player.inventory) {
        if (player.inventory[j].category === 'weapon') {
            if (!print_header) {
                document.getElementById("stats_and_inventory_block").innerHTML += "<strong>Sharp pokey things:</strong><ul>";
                print_header = true;
            }
                document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.inventory[j].name + "</li>";


        } else if (player.inventory[j].category === 'armor') {
            print_header = false;
            if (!print_header) {
                document.getElementById("stats_and_inventory_block").innerHTML += "<br /><strong>Protection! Sort of...</strong><ul>";
                print_header = true;
            }
            document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.inventory[j].name + "</li>";
        }

        else if (player.inventory[j].category === 'magic_items') {
            print_header = false;
            if (!print_header) {
                document.getElementById("stats_and_inventory_block").innerHTML += "<br /><strong>Glowing Uselessness:</strong><ul>";
                print_header = true;
            }
            document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.inventory[j].name + "</li>";
        }

         else if (player.inventory[j].category === 'potion') {
            print_header = false;
            if (!print_header) {
                document.getElementById("stats_and_inventory_block").innerHTML += "<br /><strong>Drinky things:</strong><ul>";
                print_header = true;
            }
            document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.inventory[j].name + "</li>";
        }

        else if (player.inventory[j].category === 'craft') {
            print_header = false;
            if (!print_header) {
                document.getElementById("stats_and_inventory_block").innerHTML += "<br /><strong>Building Materials:</strong><ul>";
                print_header = true;
            }
            document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.inventory[j].name + " (" + player.inventory[j].quantity +    ") </li>";
        }
    }

    document.getElementById("stats_and_inventory_block").innerHTML += "</ul>";


    document.getElementById("stats_and_inventory_block").innerHTML += "<br /> <div class=\"category\">Achievements</div><ul>";
    for(var k in player.achievements) {
        document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + player.achievements[k].name +  "</li>";
    }
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

    } else if (key === 'w' || key === 'W') {
        player.health -= 10;
        update_footer(player);


        } else if (key === 'ArrowRight' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('r');
            


        } else if (key === 'ArrowLeft' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('l')


        } else if (key === 'ArrowUp' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('u')


            

        } else if (key === 'ArrowDown' || key === 39) {
            // then we call the move function and pass 'r' for right.
            move('d')

            
        } else if (key === '?' || key === 191) {
            document.getElementById("messages").innerHTML = key; 
            
            
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
