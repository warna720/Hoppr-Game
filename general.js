function Lvl()
{

    // Create sprite for player and animations
    this.player = game.add.sprite(game.world.centerX, game.world.centerY/2, 'player');
    this.player.animations.add('right', [1, 2], 8, true);
    this.player.animations.add('left', [3, 4], 8, true);
    this.player.anchor.setTo(0.5, 0.5);

    // Save player spawn coords
    this.player.spawnX = this.player.x;
    this.player.spawnY = this.player.y;

    //Enable physics for player and add gravity
    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 500;

    // If player side-jumped
    this.player.sideJumped = false;


    // If 'r' gets pressed call respawnPlayer();.
    game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(this.restartLvl, this);

    // If 'p' gets pressed call pauseGame();.
    game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(this.pauseGame, this);


    // Disable browser spacebar action
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    // Create cursor keys for left, up and right.
    this.cursor = game.input.keyboard.createCursorKeys();
    this.deathsLabel = game.add.text(20, 30, this.getDeathsText(),
    { font: '18px Arial', fill: '#ffffff' });

    // Scale for non desktop users
    if (!game.device.desktop) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setScreenSize(true);
    }

    // Amount of items not yet collected
    this.itemsToCollect = 0;
}

Lvl.prototype.respawnPlayer = function ()
{
    this.updateDeaths();

    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    this.player.x = this.player.spawnX;
    this.player.y = this.player.spawnY;
}

Lvl.prototype.restartLvl = function ()
{
    this.updateDeaths();
    game.state.restart();
}

Lvl.prototype.pauseGame = function ()
{
    if(!game.paused)
    {
        game.paused = true;
        this.pausedLabel = game.add.text(game.world.centerX, game.world.centerY, "Paused",
        { font: '30px Arial', fill: '#ffffff' });
    }
    else
    {
        game.paused = false;
        this.pausedLabel.destroy();
    }
}

Lvl.prototype.startWallGravity = function (player, wall)
{
    // If player is not touching with feet
    if(!player.body.touching.down)
    {
        return;
    }

    game.tweens.removeFrom(wall);
    wall.body.gravity.y = -100;
}

Lvl.prototype.updateDeaths = function ()
{
    ++deaths;
    this.deathsLabel.setText(this.getDeathsText());
}

Lvl.prototype.getDeathsText = function ()
{
    return "Deaths: " + deaths.toString()
}

Lvl.prototype.lvlDone = function ()
{
    return this.items.itemsToCollect == 0;
}

Lvl.prototype.movePlayer = function ()
{
    var drainV = 10;
    var turnV = 20;
    if (this.player.body.velocity.x != 0)
    {
        turnV = 15;
    }
    // If the left arrow key is pressed
    if (this.cursor.left.isDown) {
        // Move the player to the left
        this.player.body.velocity.x += -turnV;
        this.player.animations.play('left');
    }
    // If the right arrow key is pressed
    else if (this.cursor.right.isDown) {
        // Move the player to the right
        this.player.body.velocity.x += turnV;
        this.player.animations.play('right');
    }
    else
    {
        this.player.animations.stop();
        this.player.frame = 0;

        if (this.player.body.velocity.x < 0)
        {
            this.player.body.velocity.x += drainV;
        }
        else if (this.player.body.velocity.x > 0)
        {
            this.player.body.velocity.x -= drainV;
        }

        if (this.player.body.velocity.x == 10 || this.player.body.velocity.x == -10)
        {
            this.player.body.velocity.x = 0;
        }
    }

    if (this.player.body.velocity.x < -350)
    {
        this.player.body.velocity.x = -350;
    }
    if (this.player.body.velocity.x > 350)
    {
        this.player.body.velocity.x = 350;
    }

    // If the up arrow key is pressed and the player is touching the ground
    if (this.player.inWorld &&  this.cursor.up.isDown)
    {
        if (this.player.body.onFloor() || this.player.body.touching.down)
        {
            // Move the player upward (jump)
            this.player.body.velocity.y += -320;
        }
        else if ((this.player.body.blocked.left || this.player.body.blocked.right) && 
                 !this.player.sideJumped)
        {
            this.player.body.velocity.y = -250;
            this.player.sideJumped = true;
        }
    }

    if (!this.player.body.blocked.left && !this.player.body.blocked.right)
    {
        this.resetSideJumped();
    }
}

Lvl.prototype.resetSideJumped = function ()
{
    this.player.sideJumped = false;
}