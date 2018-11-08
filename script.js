/*

This is a javascript implementation of a simple ascii art RPG game

TODO: smart terrain generation
TODO: player object
TODO: inventory
TODO: skills

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
var d20 = Math.floor(Math.random() * 20)+1;
var grid = [];
var terrain;

var counter = 1;
while ( counter <= 1000 ) {
  // the line below creates some random terrain. totally random, TODO: this needs to be smart.
  terrain = Math.floor(Math.random() * 20)+1;
  grid.push(terrain);
  counter += 1;
}

function draw_map(grid) {

var arrayLength = grid.length;
for (var i = 0; i < arrayLength; i++) {
  if (grid[i] === 1 || grid[i] === 2 || grid[i] === 3){
    // this is plain, open terrain
    grid[i] = "...";
  } else if (grid[i] === 4) {
    // this is a tree
    grid[i] = "*";
  } else if (grid[i] === 5) {
    // this is a mountain or hill
    grid[i] = "^";
  }

}
grid = grid.join('');
return grid;
}
document.getElementById("main_map").innerHTML = draw_map(grid);

// for (key in player) {
//   console.log(key, ' : ', player[key])
// }
