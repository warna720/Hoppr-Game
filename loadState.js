var loadState = {
    preload: function () {
            // Add a 'loading...' label on the screen
            var loadingLabel = game.add.text(game.world.centerX, 150, 'loading...',
            { font: '30px Arial', fill: '#ffffff' });
            loadingLabel.anchor.setTo(0.5, 0.5);
            // Display the progress bar
            var progressBar = game.add.sprite(game.world.centerX, 200, 'progressBar');
            progressBar.anchor.setTo(0.5, 0.5);
            game.load.setPreloadSprite(progressBar);

            game.load.spritesheet('player', 'assets/player2.png', 20, 20);
            game.load.image('tileset', 'assets/tileset.png');
            game.load.tilemap('map', 'assets/map3.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('wallGr', 'assets/wallHorizontal.png');

        },
        create: function() {
            game.state.start('lvl1');
    }
};