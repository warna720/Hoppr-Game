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

            game.load.spritesheet('player', 'assets/player.png', 20, 20);
            game.load.image('item', 'assets/kebab.png');
            game.load.image('tile', 'assets/tile.png');
            game.load.image('ground', 'assets/ground.png');

            // Levels
            for (n = 1; n <= amountLevels; ++n)
            {
                game.load.tilemap('lvl' + n, 'assets/lvl' + n + '.json', null, Phaser.Tilemap.TILED_JSON);
            }
            //game.load.tilemap('lvl1', 'assets/lvl1.json', null, Phaser.Tilemap.TILED_JSON);
            //game.load.tilemap('lvl1', 'assets/lvl1.json', null, Phaser.Tilemap.TILED_JSON);

        },
        create: function() {
            game.state.start('skeleton');
    }
};