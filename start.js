// This is a javascript game that does fun stuff.
var array_for_map = [];
var clear_message_counter = 0;
var combat_mode = false;
var current_destination;
var combat_destination;
var destination_terrain = 1;
var fire;
var foo = []; // oh my god, why?
var fire_array =[];
var fire_row = 0;
var grid = [];
var grid2 = [];
const main_map = document.getElementById('main_map');
var monster = {};
var number_of_magic_heals = 0;
var player_is_dead = false;
var player = {};
var turn = 0;
var terrain;
var current_sector = 0;


function check_for_achievement(action) {
    if (turn == 10) {
        player.achievements["Survived 10 turns!"] = 1;
        player.xp += 10;
    }

    if (player.inventory.craft_1.quantity == 100) {
        player.achievements["Killer of perfectly fine trees"] = 1;
        player.xp += 20;
    }

    if (player.inventory.craft_1.quantity == 1000) {
        player.achievements["Seriously, why are you killing all these trees?"] = 1;
        player.xp += 300;
    }

    if (action == "talk") {
        player.achievements["Tried to talk your way out of trouble!"] = 1;
        player.xp += 10;
    }

    if (action == "run_away") {
        player.achievements["Has run away...heh."] = 1;
        player.xp += 10;
    }

return;
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
             player.xp += 4;
             game_messages("combat_hit_crit",damage);
            } else {
             var damage = Math.floor(Math.random() * 10)+1;
             monster.health = monster.health - damage;
             player.xp += 2;
             game_messages("combat_hit",damage);
            }
        if (monster.health < 1){
            player.xp += monster.give_xp;
             combat_over("monster_dead");
            }
        } else {
            player.xp += 1;
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

function death() {
    game_messages("died");
    player_is_dead = true;
    combat_mode = false;
    return
}

function spread_fire(){
    fire_row += 1;
    console.log("Hi. I'm spreading fire now");
    if(fire_row == 1) {
        fire_index = 999;
    } else {
        let random = Math.floor(Math.random() * (2 -  (-2) + 2)) + (-2);
        console.log(random)
        fire_index = 999 + random;
    }
    var fire_right = fire_index+(1 * fire_row);
    fire_array.push(fire_right);
    var fire_left = fire_index-(1 * fire_row);
    fire_array.push(fire_left);
    var fire_up = fire_index-(34 * fire_row);
    fire_array.push(fire_up);
    var fire_down = fire_index+(34 * fire_row);
    fire_array.push(fire_down);
    var fire_up_right = fire_index-(33 * fire_row);
    fire_array.push(fire_up_right);
    var fire_up_left = fire_index-(35 * fire_row);
    fire_array.push(fire_up_left);
    var fire_down_right = fire_index+(35 * fire_row);
    fire_array.push(fire_down_right);
    var fire_down_left = fire_index+(33 * fire_row);
    fire_array.push(fire_down_left);

    fire_array.forEach(i=> {
        if(grid[i] && (grid[i] == 4 || (grid[i] >= 10 || grid[i] <=18))) {
            grid.splice(i,1,400);
        }
    })
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

else if (array_for_map[i] === 400) {
    // fire
    array_for_map[i] = "<i class=\"fas fa-fire fa-fw\" style=\"color:orange\" title=\"Fire. The kind that burns. Alot. \"></i>";
}

else if (array_for_map[i] === 500) {
    // fire
    array_for_map[i] = "<i class=\"fas fa-shopping-cart fa-fw\" style=\"color:black\" title=\"Consumerism at its finest! \"></i>";
}

}
 
array_for_map = array_for_map.join('');

// this is where we draw the map. once we draw it, we want to turn grid back into a normal array. 
document.getElementById("main_map").innerHTML = array_for_map;
if (current_sector == 0){
    grid = temp_grid.slice(0);
} else if (current_sector == 1) {
    grid2 = temp_grid.slice(0);
}

return array_for_map;
}

function draw_combat_screen(){
    document.getElementById('main_map').innerHTML = "<h2>An altercation!</h2>" +
    "<p id=\"combat_choices\"><strong>A</strong> - Attack! | <strong>B</strong> - Block! | <strong>R</strong> - Run away! | <strong>U</strong> - Use Item | <strong>T</strong> - talk things out </p>" +
    "<p><img src=\""+ monster.image + "\"/> </p>";


}

function exists(arr, search) {
    // used with gratitude from:
    // https://stackoverflow.com/questions/48538162/how-to-check-if-a-two-dimensional-array-includes-a-string
    return arr.some(row => row.includes(search));
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

        if (extra < monster.health) {
            // if we hit the monster but don't kill it, this message it displayed: 
            document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
            "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
            "You hit for " + extra + " points of damage. The monster has " + monster.health + " health left.</div>";
            clear_message_counter += 1;

        } else {
            // if we hit the monster AND kill it, this message it displayed: 
            document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
            "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
            "You hit for " + extra + " points of damage and VANQUISH the monster!</div>";
            clear_message_counter += 1;
        }
    }

    else if (message === "combat_hit_crit") {

        if (extra < monster.health) {
            // if we hit the monster but don't kill it, this message it displayed: 
            document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
            "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
            "You hit for " + extra + " points of damage. The monster has " + monster.health + " health left.</div>";
            clear_message_counter += 1;

        } else {
            // if we hit the monster AND kill it, this message it displayed: 
            document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
            "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
            "CRITICAL HIT! for " + extra + " points of damage and VANQUISH the monster!</div>";
            clear_message_counter += 1;
        }
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
        "<a href=\"#\" onclick=\"window.location.reload(true);\">Press 'R' or here to restart</a>";
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
    
    else if (message === "store_welcome") {
        document.getElementById("messages").innerHTML += "<div class=\"information\">" + 
        "<span class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</span> " + 
        "Welcome to GameSmart! We are overpriced for you! </div>";
    }

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

function initialize() {


    console.log('function initialize start');
      player = {
        score: 0,
        xp: 0,
        name: "Player",
        level: 1,
        xp_to_level_up: 100,
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
            'Playing this game instead of doing school work':0,
            'test':0
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

function map_interaction_item(map_object,destination){    
    console.log("hi. I'm map_interaction_item function, and you've just passed me: " + map_object);
    if (map_object <= 3 || (map_object >= 19 && map_object <= 25) || map_object === 5 || map_object === 7) {
        return ("allow_move")

    } else if (map_object === 100  || map_object === 101 || map_object == 400){
        return ("prohibit_move")
    

    }   else if (map_object === 98) {
        // bear trap code: 
        // randomize damage
        player.health = (player.health - 21);
        
        if ('Friend of the Bear' in player.achievements) {
                player.achievements["Friend of the Bear"] += 1;
                game_messages("bear_trap");
                grid[destination] = 97;
                return ("allow_move")
            } else {
                player.achievements["Friend of the Bear"] = 1;
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

        } else if(map_object == 500) {
            game_messages("store_welcome");
            store(destination);
            return 

    } else if (map_object === 4 || (map_object >= 10 || map_object <=18)) {
            game_messages("gather_wood");
            player.xp += 1;
            player.inventory["craft_1"].quantity += 10;
            if (current_sector == 0){
            grid[destination] = 1;
            } else if (current_sector == 1) {
            grid1[destination] = 1;
            }
            return ("allow_move")
    } else {
        return("prohibit_move")
    }
}

function move(direction) {
// issue with not counting until the first move.
  if (direction === 'r'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(99);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location + 1;
    console.log("destination: ", destination);
    if (destination%34 == 0 && current_sector == 0) {
        current_sector = 1;
        console.log("It would seem the player is ready to walk off the edge of the world");
        draw_map(grid2);
    }

    if (current_sector == 0) {
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
            turn_checker();
            // now lets update the map
            draw_map(grid);
            update_footer();
            update_stats(player);
        } else if (current_sector == 1) {
        // now lets replace the terrain that was in the old place.
        grid1[destination - 1] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid1[current_location + 1];
        // now let's move the player icon. 
        grid1[destination] = 99;
        current_destination = (destination+1);
            // increment the turn counter 
            turn_checker();
            // now lets update the map
            draw_map(grid1);
            update_footer();
            update_stats(player);
        }

    } else {
        game_messages("cant_go_there");
    } 
}

     else if (direction === 'l'){

        // let's start by getting the current location of the player
        var current_location = grid.indexOf(99);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location - 1;
        console.log("destination: ", destination);
        if (destination%34 == 0 && current_sector == 1) {
            current_sector = 0;
            console.log("It would seem the player is ready to walk off the edge of the world");
            draw_map(grid);
        }

        // now we check if terrain is passable
        if (current_sector == 0) {
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
                turn_checker();
                // now lets update the map
                draw_map(grid);
                update_footer();
                update_stats(player);
        }
        } else {
            game_messages("cant_go_there");
        } 
    


  } else if (direction === 'u'){

    // let's start by getting the current location of the player
    var current_location = grid.indexOf(99);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location - 34;
    console.log("destination: ", destination);

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
            turn_checker();
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
        console.log("destination: ", destination);

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
                turn_checker();
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
            check_for_achievement();
    
        } else if (!player_is_dead && !combat_mode && (key === 'ArrowLeft' || key === 39)) {
            // then we call the move function and pass 'l' for left.
            move('l');
            check_for_achievement();
          

        } else if (!player_is_dead && !combat_mode && (key === 'ArrowUp' || key === 39)) {
            // then we call the move function and pass 'u' for up.
            move('u');
            check_for_achievement();
   

        } else if (!player_is_dead && !combat_mode && (key === 'ArrowDown' || key === 39)) {
            // then we call the move function and pass 'd' for down.
            move('d')
            check_for_achievement();


        } else if (player_is_dead && (key === 'r' || key === 'R')) {
            // this is to make restarting easier
            restart()

        } else if (combat_mode && (key === 'a' || key === 'A')) {
            // then we call the combat function and pass 'a' for attack.
            combat_choice('a');
            check_for_achievement();

            
        } else if (combat_mode && (key === 'b' || key === 'B')) {
            // then we call the combat function and pass 'b' for block.
            combat_choice('b');
            check_for_achievement();


        } else if (combat_mode && (key === 'r' || key === 'R')) {
            // then we call the combat function and pass 'r' for run away.
            combat_choice('r');
            check_for_achievement("run_away");


        } else if (combat_mode && (key === 'u' || key === 'U')) {
            // then we call the combat function and pass 'u' for use item.
            combat_choice('u');
            check_for_achievement();


        } else if (combat_mode && (key === 't' || key === 'T')) {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('t');
            check_for_achievement("talk");


        } else if (combat_mode && key === '1') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('1');
            check_for_achievement();


        } else if (combat_mode && key === '2') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('2');
            check_for_achievement();


        } else if (combat_mode && key === '3') {
            // then we call the combat function and pass 't' to talk things out.
            combat_choice('3');
            check_for_achievement();



        } else if (key === '?' || key === 191) {
            document.getElementById("messages").innerHTML = key;         
        } 



    });
}

function make_fire(){
    grid.splice(999, 1, 400);
    fire_array =[999];
    fire = true;
    return
}

function make_random_terrain(sector) {
    console.log('function make random terrain start');
    // the stuff below generates an array which is then eventually translated into terrain
    if (sector == 1){
        var counter = 1;
        while ( counter <= 1191 ) {
        // the line below creates some random terrain. totally random, TODO: this needs to be smart.
        terrain = Math.floor(Math.random() * 25)+1;
        grid2.push(terrain);
        counter += 1;
        }
    } else {
        var counter = 1;
        while ( counter <= 1191 ) {
        // the line below creates some random terrain. totally random, TODO: this needs to be smart.
        terrain = Math.floor(Math.random() * 25)+1;
        grid.push(terrain);
        counter += 1;
        }
    }
    console.log('function make random terrain end');
    return grid;
}

function monsters(monsterid) {

if (monsterid == 300) {

    monster = {
        health: 10,
        intelligence: 500,
        name: "Spider",
        give_xp: 20,
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
        give_xp: 30,
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
        give_xp: 20,
        base_chance_to_hit: 50,
        base_damage: 10,
        talkative: 30,
        image:'images/kiwi-bird.png'
    }
} else if(monsterid == 303) {
    monster = {
        health: 10,
        intelligence: 75,
        name: "Android",
        give_xp: 50,
        base_chance_to_hit: 50,
        base_damage: 10,
        talkative: 10,
        image:'images/android.png'
    }
}  else if(monsterid == 304) {
    monster = {
        health: 50,
        intelligence: 6,
        name: "Dragon",
        give_xp: 100,
        base_chance_to_hit: 70,
        base_damage: 10,
        talkative: 40,
        image:'images/dragon.png'
    }
}
}

function restart(){
    window.location.reload(true);
    return
}

function store(destination) {
    store = {
        store_inventory: {
             // '[[NAME OF ITEM],[CATEGORY],[DESCRIPTION],[PRICE]':10,
                '[["Healing Potion"],["Potion"],["When consumed, this potion will increase the player\'s health by 50%"],[1000]]':5,
                '[["Extra Damage Potion"],["Potion"],["When consumed, this potion will increase attacks by 50% for 3 battles"],[1000]]':5,
                '[["Good Luck Potion"],["Potion"],["When consumed, this potion will increase the player\'s luck during the battle"],[1000]]':10,
                '[["Bronze Trap"],["Trap"],["This trap will have a 25% chance of trapping your opponent"],[250]':10,
                '[["Silver Trap"],["Trap"],["This trap will have a 75% chance of trapping your opponent"],[500]':8,
                '[["Gold Trap"],["Trap"],["This trap will have a 100% chance of trapping your opponent"],[1000]':5,
                '[["Mace"],["Weapon"],["A short ranged yet powerful weapon"],[500]':3,
                '[["Shovel"],["Weapon"],["Great for gardening, construction, and low budget-battles"],[100]':5,
                '[["Diamond Sword"],["Weapon"],["The ultimate weapon."],[100]':10,
                '[["Grandma Edna\'s Secret Chili Recipe"],["Luxuries"],["You\'ll finally be able to make Grandma\'s famous chili (the secret ingredient is Ostrich Oil)"],[5000]':10,
                '[["AirPods"],["Luxuries"],["The ultimate status symbol"],[10000]':3,
                '[["Gold Toilet Paper"],["Luxuries"],["Wipe in luxury with this 24 karat gold toilet paper."],[7500]':3,
                '[["Shield"],["Armour"],["You will be able to use this sheild to protect yourself from damage to the torso."],[500]':10,
                '[["Helmet"],["Armour"],["You will be able to use this helmet to protect yourself from damage to the head."],[500]':10,
                '[["Full Body Armour"],["Armour"],["You will be able to use this full body armour to protect yourself from damage to anywhere on the body."],[1000]':10
                }
            }

store_draw();

}

function store_draw(){
    document.getElementById('main_map').innerHTML = "<h2>Welcome to GameSmart!</h2><p>We are overpriced for you!</p>" +
    "<p id=\"combat_choices\">Hi Ryan!</p>" + 
    "<p>Hello again from the next line</p>";
}

function spread_fire(){
    fire_row += 1;
    console.log("Hi. I'm spreading fire now");
    if(fire_row == 1) {
        fire_index = 999;
    } else {
        fire_index = 999 +  Math.floor(Math.random() * 10) - 0;
    }
    var fire_right = fire_index+(1 * fire_row);
    fire_array.push(fire_right);
    var fire_left = fire_index-(1 * fire_row);
    fire_array.push(fire_left);
    var fire_up = fire_index-(34 * fire_row);
    fire_array.push(fire_up);
    var fire_down = fire_index+(34 * fire_row);
    fire_array.push(fire_down);
    var fire_up_right = fire_index-(33 * fire_row);
    fire_array.push(fire_up_right);
    var fire_up_left = fire_index-(35 * fire_row);
    fire_array.push(fire_up_left);
    var fire_down_right = fire_index+(35 * fire_row);
    fire_array.push(fire_down_right);
    var fire_down_left = fire_index+(33 * fire_row);
    fire_array.push(fire_down_left);
    function test(p) {
        if(!grid[p] || grid[p] == 99 || grid[p] == 100 || grid[p] <= 3) return;
        let right = grid[p+(1)];
        let left = grid[p-(1)];
        let up = grid[p-(34)];
        let down = grid[p+(34)];
        let up_right = grid[p-(33)];
        let up_left = grid[p-(35)];
        let down_right = grid[p+(35)];
        let down_left = grid[p+(33)];
        if(left == 400 || right == 400 || up == 400 || down == 400 || up_right == 400 || up_left == 400 || down_right == 400 || down_left == 400) {
            return true;
        } else {
            return false;
        }
    }
    fire_array.forEach(i=> {
            if(test(i)) {
                grid.splice(i,1,400);
            }
        
    })
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
    // Our Store! 
    grid.splice(745,1,500);

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

function level_increment(){
    if (player.xp >= player.xp_to_level_up){;
        player.level += 1;
        console.log('You have leveled up! Your level is now: ' + player.level);
        player.xp_to_level_up = Math.round(player.xp_to_level_up * 1.5);
        console.log('xp_to_level_up is now: ' + player.xp_to_level_up);
    } else {
        console.log('Your xp: ' + player.xp);
        console.log('Your level: ' + player.level);
        console.log('Your xp to level up: ' + player.xp_to_level_up);
    }
    return
}

function turn_checker(){
    turn += 1;
    if (turn === 5) {
        make_fire();
    } else if (fire == true){
        spread_fire();
    }
    if (turn === 7) {
        fire = false;
    }
    level_increment();
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
        document.getElementById("stats_and_inventory_block").innerHTML += "<li>" + k + "</li>";
    }
}

initialize();
make_random_terrain();
make_random_terrain(1)
starting_map();
draw_map(grid);
main_listener();
