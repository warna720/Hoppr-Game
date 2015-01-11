var menuState = {
    create: function() {

        this.titleLabel = game.add.text(game.world.centerX, game.world.centerY/2, 'Kebabr',
        { font: '50px Arial', fill: '#ffffff' });
        this.titleLabel.anchor.setTo(0.5, 0.5);

        this.infoLabel = game.add.text(game.world.centerX, game.world.centerY/2 + 60,
        'Make your way through the levels and collect the kebabs!',
        { font: '25px Arial', fill: '#ffffff' });
        this.infoLabel.anchor.setTo(0.5, 0.5);

        this.controllersLabel = game.add.text(game.world.centerX, game.world.centerY/2 + 130 + 60,
        'Controllers\nJump: ↑\nMove: ←→\nPause: p\nRespawn: r',
        { font: '25px Arial', fill: '#ffffff' });
        this.controllersLabel.anchor.setTo(0.5, 0.5);

        this.startGameLabel = game.add.text(game.world.centerX, game.world.centerY/2 + 300 + 60,
        'Press enter to start game!',
        { font: '25px Arial', fill: '#ffffff' });
        this.startGameLabel.anchor.setTo(0.5, 0.5);

        this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.addOnce(this.start, this);

        this.flashTime = game.time.time;

        },

    start: function() {
        game.state.start('skeleton');
    },

    update: function()
    {
        if (game.time.time - this.flashTime > 800)
        {
            this.flashTime = game.time.time;

            if (this.startGameLabel.visible)
            {
                this.startGameLabel.visible = false;
            }
            else
            {
                this.startGameLabel.visible = true;
            }
        }
    }
};