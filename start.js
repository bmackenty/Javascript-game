/*

This is a javascript implementation of a simple ascii art RPG game

TODO: smart terrain generation
TODO: player object
TODO: inventory
TODO: skills
TODO: moving around
TODO: edge of the world : how to deal with it? 


*/

// Below we initialize the player object
var player = {
  score: 0,
  name: "Player",
  level: 1,
  rank: "ready to be eaten",
  kingdom: "None",
  reputation: "huh?",
  skills: ["not dying", "running away"],
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
  region: "newbie"
}

// initialize other variables

const main_map = document.getElementById('main_map');
var grid = [];
var terrain;
// the variable below tracks the terrain type the player moved from. When they move again, we replace the old terrain stored in this variable.
// the reason we have empty terrain is for the very first move of the game.
var destination_terrain = '<i class=\"fas fa-ellipsis-h fa-fw\"></i>';
// the line below is because I was testing row length and got annoyed having to continually adjust 

var counter = 1;
while ( counter <= 1189 ) {
  // the line below creates some random terrain. totally random, TODO: this needs to be smart.
  terrain = Math.floor(Math.random() * 5)+1;
  grid.push(terrain);
  counter += 1;
}

// make player starting location. It's 1 just TOTALLY for testing. Also, we should track the current player location for
// reasons. 
grid.splice(10, 0, 6);



function draw_map(grid) {

var counter = 0;
var arrayLength = grid.length;
for (var i = 0; i < arrayLength; i++) {


  if (grid[i] === 1 || grid[i] === 2 || grid[i] === 3){
    // this is plain, open terrain
    grid[i] = "<i class=\"fas fa-ellipsis-h fa-fw\"></i>";
  } else if (grid[i] === 4) {
    // this is a tree
    grid[i] = "<i class=\"fas fa-tree fa-fw\" style=\"color:green\"></i>";
  } else if (grid[i] === 5) {
    // this is a mountain or hill
    grid[i] = "<i class=\"fas fa-mountain fa-fw\" style=\"color:grey\"></i>";
  } else if (grid[i] === 6) {
  // this is a mountain or hill
  grid[i] = "<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>";
}

}
grid = grid.join('');
return grid;
}


function move(direction) {

  if (direction === 'r'){
    // let's start by getting the current location of the player
    var current_location = grid.indexOf('<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>');
    // the line below is for debugging
    console.log(current_location);
    // now the destination. This ASSUMES A 34 LENGTH array
    var destination = current_location + 1;
    // now lets replace the terrain that was in the old place.
    grid[destination - 1] = destination_terrain;
    // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
    destination_terrain = grid[current_location + 1];
    // now let's move the player icon. 
    grid[destination] = '<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>';
    document.getElementById("messages").innerHTML = current_location;


  } else if (direction === 'l'){
        // let's start by getting the current location of the player
        var current_location = grid.indexOf('<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>');
        // the line below is for debugging
        console.log(current_location);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location - 1;
        // now lets replace the terrain that was in the old place.
        grid[destination+1] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location - 1];
        // now let's move the player icon. 
        grid[destination] = '<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>';
        document.getElementById("messages").innerHTML = current_location;


    } else if (direction === 'u'){
        // let's start by getting the current location of the player
        var current_location = grid.indexOf('<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>');
        // the line below is for debugging
        console.log(current_location);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location - 34;
        // now lets replace the terrain that was in the old place.
        grid[destination + 34] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location - 34];
        // now let's move the player icon. 
        grid[destination] = '<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>';
        document.getElementById("messages").innerHTML = current_location;

    } else if (direction === 'd'){
        // let's start by getting the current location of the player
        var current_location = grid.indexOf('<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>');
        // the line below is for debugging
        console.log(current_location);
        // now the destination. This ASSUMES A 34 LENGTH array
        var destination = current_location + 34;
        // now lets replace the terrain that was in the old place.
        grid[destination - 34] = destination_terrain;
        // now let's get the terrain the place they want to go. we need this so we can replace it when they move later on. 
        destination_terrain = grid[current_location + 34];
        // now let's move the player icon. 
        grid[destination] = '<i class=\"fas fa-child fa-fw\" style=\"color:red\"></i>';
        document.getElementById("messages").innerHTML = current_location;

    return
  }

}

// the code below is used from https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a
// I also used this site for keycodes: https://keycode.info/
// the code below listens for keys being released, and then trigger a function which "does something". 

document.addEventListener('keyup', function (event) {
  if (event.defaultPrevented) {
      return;
  }

  var key = event.key || event.keyCode;

  if (key === 'Escape' || key === 'Esc' || key === 27) {
    document.getElementById("messages").innerHTML = key;
    } else if (key === 'ArrowRight' || key === 39) {
        // then we call the move function and pass 'r' for right.
        move('r')
        // finally, we update the map after the move has been completed (but this might no belong here).
        document.getElementById("main_map").innerHTML = draw_map(grid); 
        
        
    } else if (key === 'ArrowLeft' || key === 39) {
        // then we call the move function and pass 'r' for right.
        move('l')
        // finally, we update the map after the move has been completed (but this might no belong here).
        document.getElementById("main_map").innerHTML = draw_map(grid);   



    } else if (key === 'ArrowUp' || key === 39) {
        // then we call the move function and pass 'r' for right.
        move('u')
        // finally, we update the map after the move has been completed (but this might no belong here).
        document.getElementById("main_map").innerHTML = draw_map(grid); 
        





    } else if (key === 'ArrowDown' || key === 39) {
        // then we call the move function and pass 'r' for right.
        move('d')
        // finally, we update the map after the move has been completed (but this might no belong here).
        document.getElementById("main_map").innerHTML = draw_map(grid); 
        
        
    } else if (key === '?' || key === 191) {
        document.getElementById("messages").innerHTML = key;  
    } else if (key === 'i' || key === 73 || key === 'I') {
        document.getElementById("messages").innerHTML = key;  

  }
});


document.getElementById("main_map").innerHTML = draw_map(grid);
document.getElementById("footer").innerHTML = "Health: " + player.health + " | Magic: " + player.magic;
