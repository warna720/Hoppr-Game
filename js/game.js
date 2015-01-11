var width = 920;
var height = 720;
var deaths = 0;
var lvl = 1;
var amountLevels = 3;
var finishedTexts = ["That was easy...", "Too easy...\nFor real now, lets see if you can finish next level.",
                     "Congrats, you finished all levels!"];


var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameDiv');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('transition', transitionState);
game.state.add('skeleton', lvlState);

game.state.start('boot');