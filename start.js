
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
TODO: add credits
TODO: help screen, ditch tooltips
HINT: throw new Error("Something went badly wrong!");
LEARNED: about shallow copies. Thanks stackoverflow
TODO: make alert messages more random, funny and meaningful
TODO: add to credits https://game-icons.net/
TODO: add skill and eqipment into chnace to block successfully 
TODO: Ryan: add health bar for monsters during combat
TODO: add Joe's all you can eat buffet


== DONE STUFF == 
TODO: add image for death
TODO: after death, dont allow movement. 
TODO: remove bear trap after its been triggered
TODO: player object
TODO: put listener into a function. 
TODO: death
TODO: different trees
TODO: when dead after combat dont allow attacking to continue
TODO: rationally deal with images / icons / etc..
TODO: changelog (this is on github)

*/

const main_map = document.getElementById('main_map');
var turn = 0;
var grid = [];
var terrain;
var destination_terrain = 1;
var player = {};
var monster = {};
var foo = [];
var array_for_map = [];
var clear_message_counter = 0;
var number_of_magic_heals = 0;
// There are certain keyboard events we only listen for when we are in combat
var combat_mode = false;
var current_destination;
var combat_destination;
var player_is_dead = false;


function exists(arr, search) {
    // used with gratitude from:
    // https://stackoverflow.com/questions/48538162/how-to-check-if-a-two-dimensional-array-includes-a-string
    return arr.some(row => row.includes(search));
}

function initialize() {


console.log('function initialize start');
  player = {
    score: 0,
    xp: 0,
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

function game_messages(message,extra){
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

    else if (message === "combat_hit") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You hit for " + extra + " points of damage. The monster has " + monster.health + " health left.</div>";
        clear_message_counter += 1;
    }

    else if (message === "combat_hit_crit") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "CRITICAL HIT!! You hit for " + extra + " points of damage. The monster has " + monster.health + " health left.</div>";
        clear_message_counter += 1;
    }

    else if (message === "combat_block") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You try to block the monster's attack!</div>";
        clear_message_counter += 1;
    }



    else if (message === "combat_miss") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You miss. And everyone is watching. Heh. </div>";
        clear_message_counter += 1;
    }


    else if (message === "bear_trap") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You have walked into a bear trap and suffered horribly. The bears thank you. </div>";
        clear_message_counter += 1;
    }

    else if (message === "run_away") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You run away. The monster gets a free attack because of REASONS!!</div>";
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
        "You have stumbled upon a monster! </div>";
        clear_message_counter += 1;
    }

    else if (message === "gather_wood") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "You gather some wood. Tree killer. </div>";
        clear_message_counter += 1;
    }


    else if (message === "magic_heal") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "Smriti heals you!</div>";
        clear_message_counter += 1;
    }

    else if (message === "no_more_heal") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "Smriti smacks you with a huge fish and says \"No more heals for you!\"</div>";
        clear_message_counter += 1;
    }

    else if (message === "combat_over") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The combat is over!</div>";
        clear_message_counter += 1;
    }

    else if (message === "monster_attacks") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster attacks!</div>";
        clear_message_counter += 1;
    }

    else if (message === "monster_hits") {

        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster HITS YOU for " + extra + " points of damage!! </div>";
        clear_message_counter += 1;
    }


    else if (message === "monster_misses") {

        document.getElementById("messages").innerHTML += "<div class=\"alert\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster MISSES YOU!!</div>";
        clear_message_counter += 1;
    }

    else if (message === "died") {

        document.getElementById("main_map").innerHTML = "<br /> *** You have died *** <br /><br /> " + 
        "<img src=\"images/internal-injury.png\"> <br />" +
        "<a href=\"#\" onclick=\"window.location.reload(true);\">Click to restart</a>";
    }

    else if (message === "combat_monster_goes_away") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster decides not to eat you.</div>";
    }

    else if (message === "combat_talk_fails") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster doesn't understand you!!</div>";
    }

    else if (message === "combat_nap_fails") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster scowls. I'm not tired! I want to eat you. Slowly! Plus it's not my bedtime!</div>";
    }

    else if (message === "combat_monster_goes_to_sleep") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "The monster drops to the ground, snoring softly...zzzzzzzzzzzzzzzz.....</div>";
    }

    else if (message === "combat_monster_goes_to_joes") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "NO WAY! Seriously?! The monster leaps away to Joe's all you can eat buffet.</div>";
    }

    else if (message === "combat_no_buffet_for_you") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "Why would I go to a buffet if I could just eat you?</div>";
    }
    

}

function monsters(monsterid) {

if (monsterid == 300) {

    monster = {
        health: 10,
        intelligence: 500,
        name: "Spider",
        base_chance_to_hit: 60,
        base_damage: 10,
        talkative: 9,
        image:'images/spider-alt.png'
    }
} else if(monsterid == 301) {
    monster = {
        health: 10,
        intelligence: 8,
        name: "Bear",
        base_chance_to_hit: 40,
        base_damage: 10,
        talkative: 60,
        image:'images/bear-face.png'
    }
} else if(monsterid == 302) {
    monster = {
        health: 10,
        intelligence: 6,
        name: "Kiwi Bird",
        base_chance_to_hit: 50,
        base_damage: 10,
        talkative: 30,
        image:'images/kiwi-bird.png'
    }
} else if(monsterid == 303) {
    monster = {
        health: 10,
        intelligence: 9,
        name: "Android",
        base_chance_to_hit: 50,
        base_damage: 10,
        talkative: 10,
        image:'images/android.png'
    }
}  else if(monsterid == 304) {
    monster = {
        health: 40,
        intelligence: 6,
        name: "Dragon",
        base_chance_to_hit: 70,
        base_damage: 10,
        talkative: 40,
        image:'images/dragon.png'
    }
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
    // and, because Jake, a bear.
    grid.splice(311,1,301);
    // I wan't a kiwi bird - Andrew
    grid.splice(315,1,302);
    // robots are cool - Andrew
    grid.splice(500,1,303);
    // it's a dragon, and I hope we do other stuff with it other than just fight it in the future - Andrew
    grid.splice(545,1,304);

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
    array_for_map[i] = "<i class=\"fas fa-spider fa-fw\" style=\"color:orange\" title=\"You know those little cute spiders? This isn't one of those.\"></i>";
}

else if (array_for_map[i] === 301) {
    // bear
    array_for_map[i] = "<i class=\"fas fa-paw fa-fw\" style=\"color:brown\" title=\"A bear. The kind that likes to eat adventurers.\"></i>";
}   

else if (array_for_map[i] === 302) {
    // kiwi bird
    array_for_map[i] = "<i class=\"fas fa-kiwi-bird fa-fw\" style=\"color:purple\" title=\"Don't let it's small size fool you, this kiwi bird is as vicious as any enemy you'll find here.\"></i>";
}

else if (array_for_map[i] === 303) {
    // android
    array_for_map[i] = "<i class=\"fab fa-android fa-fw\" style=\"color:blue\" title=\"It's a hyper-intelligent android.\"></i>";
}

else if (array_for_map[i] === 304) {
    // dragon
    array_for_map[i] = "<i class=\"fas fa-dragon fa-fw\" style=\"color:red\" title=\"A dragon which unsurprisingly eats people\"></i>";
}


}
 
array_for_map = array_for_map.join('');

// this is where we draw the map. once we draw it, we want to turn grid back into a normal array. 
document.getElementById("main_map").innerHTML = array_for_map;

grid = temp_grid.slice(0);

return array_for_map;
}

function draw_combat_screen(){
    document.getElementById('main_map').innerHTML = "<h2>An altercation!</h2>" +
    "<p id=\"combat_choices\"><strong>A</strong> - Attack! | <strong>B</strong> - Block! | <strong>R</strong> - Run away! | <strong>U</strong> - Use Item | <strong>T</strong> - talk things out </p>" +
    "<p><img src=\""+ monster.image + "\"/> </p>";


}

function combat_over(combat_result){
    if (combat_result == "monster_dead") {
        grid[current_destination] = 20;
        draw_map(grid);
        game_messages("combat_over");
        combat_mode = false;
    } else if (combat_result == "monster_alive"){
        draw_map(grid);
        game_messages("combat_over");
        combat_mode = false;
    } else if (combat_result == "monster_alive_to_joes") {
        // this is where we should add the monster to joe's. 
        grid[current_destination] = 20;
        draw_map(grid);
        combat_mode = false;
    }

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

        } else if (map_object === 301) {
            game_messages("monster");
            combat(map_object,destination);
            return

        } else if (map_object === 302) {
            game_messages("monster");
            combat(map_object,destination);
            return

        } else if (map_object === 303) {
            game_messages("monster");
            combat(map_object,destination);
            return

        } else if (map_object === 304) {
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

function combat_determine_outcome(combat_action){
   if (combat_action == "attack") {
       var plusses_to_hit = ((Math.pow(player.level,2)/2.5) + Math.round(player.strength/3))
       var base_chance_to_hit = Math.floor(Math.random() * 100)+1;
       var total_chance_to_hit = base_chance_to_hit + plusses_to_hit;
 
       if (total_chance_to_hit > 50) {
           var base_crit_chance = 10;
           var crit_probability = Math.floor(Math.random()*100)+1;
           console.log(base_crit_chance);
           console.log(crit_probability);
           if (base_crit_chance > crit_probability) {
            var damage = Math.floor(Math.random() * 100)+1;
            monster.health = monster.health - damage;
            game_messages("combat_hit_crit",damage);
           }
            var damage = Math.floor(Math.random() * 10)+1;
            monster.health = monster.health - damage;
            game_messages("combat_hit",damage);
       if (monster.health < 1){
            combat_over("monster_dead");
           }
       } else {
           game_messages("combat_miss");
       }
       if (combat_mode == true){
        combat_monster_action();
       }
   }
   if (combat_action == "block") {
       monster.base_chance_to_hit = monster.base_chance_to_hit /2 + monster.intelligence;
       game_messages("combat_block");
       combat_monster_action();
   }
   if (combat_action == "run_away") {
       game_messages("run_away");
       combat_monster_action();
       combat_over("monster_alive");
   }

   if (combat_action == "talk"){
    
    document.getElementById('combat_choices').innerHTML = 
    "<div align=\"left\">" + 
    "<p id=\"combat_talk_choice\"><br />Press 1 to tell the " + monster.name + " you are not delicious. " + 
    "<br />Press 2 to tell the " + monster.name + " to sit down and take a nap. " + 
    "<br />Press 3 to tell the " + monster.name + " there is an all-you-can-eat buffet down the street" +
    "</div>";
   }

   if (combat_action == "talk_1") {
       if (monster.intelligence < 10 && monster.talkative > 20) {
           // this monster should be pretty easy to fool.
           combat_over("monster_alive");
           game_messages("combat_monster_goes_away");
       } else {
           game_messages("combat_talk_fails");
           draw_combat_screen();
           combat_monster_action();
       }
   }

   if (combat_action == "talk_2") {
       var base_chance_for_nap_success = ((100-monster.intelligence) + player.luck);
       var roll_for_nap_success = Math.floor(Math.random() * 100)+1;
       if (roll_for_nap_success < base_chance_for_nap_success){
        combat_over("monster_alive");
        game_messages("combat_monster_goes_to_sleep");
       } else {
        game_messages("combat_nap_fails");
        draw_combat_screen();
        combat_monster_action();
       }
  
}

if (combat_action == "talk_3") {
    var base_chance_for_buffet_success = ((100-monster.intelligence) + player.luck + player.charisma);
    var roll_for_buffet_success = Math.floor(Math.random() * 100)+1;
    if (roll_for_buffet_success < base_chance_for_buffet_success){
     combat_over("monster_alive_to_joes");
     game_messages("combat_monster_goes_to_joes");
    } else {
     game_messages("combat_no_buffet_for_you");
     draw_combat_screen();
     combat_monster_action();
    }

}


return
}

function combat_monster_action() {
    game_messages("monster_attacks");
    var monster_chance_to_hit = 50;
    var monster_roll_to_hit = Math.floor(Math.random() * 100)+1;
    if (monster_roll_to_hit > monster_chance_to_hit){
        // the monster hits the player
        game_messages("monster_hits",monster.base_damage);
        player.health = player.health - monster.base_damage;
        update_footer();

    } else {
        // monster misses the player
        game_messages("monster_misses");
    }
}

function combat(map_object,destination){
    combat_mode = true; 
    monsters(map_object);
    draw_combat_screen();
    destination = destination;
    return
}

function combat_choice(action){
    // this function should only process the choice the player makes
    // not determine the outcome....
    if (action == 'a'){
        console.log('attack');
        combat_determine_outcome('attack');
    } else if (action == 'b') {
        console.log('block');
        combat_determine_outcome('block');
    } else if (action == 'u') {
        console.log('use');
        combat_determine_outcome('use');
    } else if (action == 'r') {
        console.log('run away');
        combat_determine_outcome('run_away');
    } else if (action == 't') {
        console.log('talk about it');
        combat_determine_outcome('talk');
    } else if (action == '1') {
        console.log('talk option 1');
        combat_determine_outcome('talk_1');
    } else if (action == '2') {
        console.log('talk option 2');
        combat_determine_outcome('talk_2');
    } else if (action == '3') {
        console.log('talk option 3');
        combat_determine_outcome('talk_3');
    }
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
        current_destination = (destination+1);
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
            current_destination = (destination-1);
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
        current_destination = (destination-34);
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
            current_destination = (destination+34);
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
    player_is_dead = true;
    combat_mode = false;
    return
}

function restart(){
    window.location.reload(true);
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
    } else if (value <= 10){
        condition = "<font color=\"#FF001F\"><strong>Basically about dead.(" + value + ")</strong></font>";
        return condition
    } else if (value <= 20) {
        condition = "<font color=\"#FF001F\"><strong>Falling off the edge of death. (" + value + ")</strong></font>";
        return condition
    } else if (value <= 30) {
        condition = "<font color=\"#FF001F\"><strong>Edge of death(" + value + ")</strong></font>";
        return condition
    } else if (value <= 40) {
        condition = "<font color=\"#FF001F\"><strong>Mildly decapitated (" + value + ")</strong></font>";
        return condition
    } else if (value <= 50) {
        condition = "<font color=\"#FF001F\"><strong>Damaged liver(" + value + ")</strong></font>";
        return condition
    } else if (value <= 60) {
        condition = "<font color=\"#FBB004\"><strong>Missing part of leg(" + value + ")</strong></font>";
        return condition
    } else if (value <= 70) {
        condition = "<font color=\"green\"><strong>Unhealthy (" + value + ")</strong></font>";
        return condition
    } else if (value <= 89) {
        condition = "<font color=\"green\"><strong>Less healthy (" + value + ")</strong></font>";
        return condition
    } else if (value >= 90) {
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
    // the code below listens for keys being released, and then calls a function. 

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

    } else if (key === 's' || key === 'S') {
        number_of_magic_heals += 1;
        if (number_of_magic_heals < 10){
            player.health += 10;
            game_messages("magic_heal")
        } else {
            game_messages("no_more_heal")
        }
        update_footer(player);

        // there is certainly a more succinct way to do this. 
        } else if (!player_is_dead && !combat_mode && (key === 'ArrowRight' || key === 39)) {
            // then we call the move function and pass 'r' for right.
            move('r');
            

        } else if (!player_is_dead && !combat_mode && (key === 'ArrowLeft' || key === 39)) {
            // then we call the move function and pass 'l' for left.
            move('l')


        } else if (!player_is_dead && !combat_mode && (key === 'ArrowUp' || key === 39)) {
            // then we call the move function and pass 'u' for up.
            move('u')   

        } else if (!player_is_dead && !combat_mode && (key === 'ArrowDown' || key === 39)) {
            // then we call the move function and pass 'd' for down.
            move('d')

        } else if (player_is_dead && (key === 'r' || key === 'R')) {
            // this is to make restarting easier
            restart()

        } else if (combat_mode && (key === 'a' || key === 'A')) {
            // then we call the combat function and pass 'a' for attack.
            combat_choice('a')
            
        } else if (combat_mode && (key === 'b' || key === 'B')) {
            // then we call the combat function and pass 'b' for block.
            combat_choice('b')

        } else if (combat_mode && (key === 'r' || key === 'R')) {
            // then we call the combat function and pass 'r' for run away.
            combat_choice('r')

        } else if (combat_mode && (key === 'u' || key === 'U')) {
            // then we call the combat function and pass 'u' for use item.
            combat_choice('u')

        } else if (combat_mode && (key === 't' || key === 'T')) {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('t')

        } else if (combat_mode && key === '1') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('1')

        } else if (combat_mode && key === '2') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('2')

        } else if (combat_mode && key === '3') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('3')


        } else if (key === '?' || key === 191) {
            document.getElementById("messages").innerHTML = key;         
        } 



    });
}

initialize();
make_random_terrain();
starting_map();
draw_map(grid);
main_listener();
