var width = 920;
var height = 720;
var deaths = 0;


var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameDiv');


game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('lvl1', lvl1);
game.state.start('boot');