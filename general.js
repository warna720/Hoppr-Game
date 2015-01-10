function Lvl() {}

Lvl.prototype.init = function (playerX, playerY)
{
    // Create sprite for player and animations
    this.player = game.add.sprite(playerX, playerY, 'player');
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
}


Lvl.prototype.respawnPlayer = function ()
{
    this.updateDeaths();

    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    this.player.x = this.player.spawnX;
    this.player.y = this.player.spawnY;

    this.itemsGroup.forEach(function(item)
    {
        item.exists = true;
    }, this);
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
        this.pausedLabel.anchor.setTo(0.5, 0.5);
    }
    else
    {
        game.paused = false;
        this.pausedLabel.destroy();
    }
}

Lvl.prototype.startWallGravity = function (player, wall)
{
    if(player.body.touching.down)
    {
        game.tweens.removeFrom(wall);
        wall.body.gravity.y = -100;
    }
}

Lvl.prototype.collecItem = function (item)
{
    item.exists = false;
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
    var done = true;

    this.itemsGroup.forEach(function(item)
    {
        if(item.exists)
        {
            done = false;
        }
    }, this);

    return done;
}

Lvl.prototype.movePlayer = function ()
{
    var turnV = 20;

    if (this.cursor.left.isDown)
    {
        this.player.body.velocity.x += -turnV;
        this.player.animations.play('left');
    }
    else if (this.cursor.right.isDown)
    {
        this.player.body.velocity.x += turnV;
        this.player.animations.play('right');
    }
    else
    {
        this.player.animations.stop();
        this.player.frame = 0;

        this.drainVelocity();
    }


    this.correctVelocityLimit();


    if(this.touchingWall())
    {
        this.timeSinceWallTouch = game.time.time;

        this.wallSlide();
    }

    if (this.player.inWorld &&  this.cursor.up.isDown)
    {
        if (this.player.body.onFloor() || this.player.body.touching.down)
        {
            this.player.lastJumpTime = game.time.time;
            this.player.body.velocity.y += -250;
        }
        else if (this.canSideJump())
        {
            this.sideJump();

            this.player.lastJumpTime = null;
            this.player.timeSinceWallTouch = null;
            this.leftBlocked = false;
            this.rightBlocked = false;

        }
        else if (game.time.time - this.player.lastJumpTime < 200)
        {
            this.player.body.velocity.y += -8;
        }
    }

}

Lvl.prototype.passedSideJumpY = function ()
{
    var yCoord = this.player.y - this.player.sideJumpedY;

    return yCoord < -50 || yCoord > 30;
}

Lvl.prototype.passedSideJumpX = function ()
{
    var xCoord = this.player.x - this.player.sideJumpedX;

    return Math.abs(xCoord) > 40;
}

Lvl.prototype.canSideJump = function ()
{
    return ((this.player.body.blocked.left || this.player.body.blocked.right) &&
            (this.cursor.left.isDown || this.cursor.right.isDown)) || 
            (this.leftBlocked || this.rightBlocked) && 
            ((this.touchedWallX - this.player.x) < 5);
}

Lvl.prototype.sideJump = function ()
{
    this.player.body.velocity.y = -300;

    if (this.leftBlocked)
    {
        this.player.body.velocity.x = 350;
    }
    else if (this.rightBlocked)
    {
        this.player.body.velocity.x = -350;
    }
}

Lvl.prototype.correctVelocityLimit = function ()
{
    if (this.player.body.velocity.x < -350)
    {
        this.player.body.velocity.x = -350;
    }
    if (this.player.body.velocity.x > 350)
    {
        this.player.body.velocity.x = 350;
    }
}

Lvl.prototype.touchingWall = function ()
{
    if (this.player.body.blocked.left && this.cursor.left.isDown)
    {
        this.leftBlocked = true;
    }
    else if (this.player.body.blocked.right && this.cursor.right.isDown)
    {
        this.rightBlocked = true;
    }

    if (this.player.body.blocked.left || this.player.body.blocked.right)
    {
        this.touchedWallX = this.player.x;
    }

    if (game.time.time - this.timeSinceWallTouch > 250)
    {
        this.leftBlocked = false;
        this.rightBlocked = false;
    }

    return this.player.body.blocked.left || this.player.body.blocked.right;
}

Lvl.prototype.wallSlide = function ()
{
    if (this.player.body.velocity.y > 10)
    {
        this.player.body.velocity.y = 80;
    }
}

Lvl.prototype.drainVelocity = function ()
{
    var drainV = 10;

    if (this.player.body.velocity.x < 0)
    {
        this.player.body.velocity.x += drainV;
    }
    else if (this.player.body.velocity.x > 0)
    {
        this.player.body.velocity.x -= drainV;
    }

    if (this.player.body.velocity.x < 10 && this.player.body.velocity.x > -10)
    {
        this.player.body.velocity.x = 0;
    }
}

Lvl.prototype.createWorld = function ()
{
    // Create the tilemap
    this.map = game.add.tilemap('lvl' + lvl);

    // Add the tileset to the map
    this.map.addTilesetImage('tile');

    // Create the layer, by specifying the name of the Tiled layer
    this.wall = this.map.createLayer('Ground');

    // Set the world size to match the size of the layer
    this.wall.resizeWorld();

    this.map.setCollisionBetween(1, 10000, 1, this.wall, false)


    // Add player
    this.playerGroup = game.add.group();
    //this.playerGroup.enableBody = true;
    this.map.createFromObjects("Objects", 1, "", 0, true, false, this.playerGroup);
    this.player = this.playerGroup.getAt(0);

    // Create items
    this.itemsGroup = game.add.group();
    this.itemsGroup.enableBody = true;
    this.map.createFromObjects("Objects", 2, "item", 0, true, false, this.itemsGroup);
    this.itemsGroup.setAll('body.immovable', true);

    //console.log(this.itemsGroup.getAt(0).visible);
}

Lvl.prototype.addCollisions = function ()
{
    game.physics.arcade.collide(this.player, this.wall);
    //game.physics.arcade.collide(this.player, this.itemsGroup, this.collecItem, null, this);
}

Lvl.prototype.checkItemCollision = function ()
{
    this.itemsGroup.forEach(function(item)
    {
        if(Phaser.Rectangle.intersects(this.player.body, item.body))
        {
            this.collecItem(item);
        }
    }, this);
}

Lvl.prototype.update = function ()
{
    // Finished lvl
    if(this.lvlDone())
    {
        ++lvl;
        game.state.start('transition');
    }

    // Out of bounds
    if (!this.player.inWorld)
    {
        this.respawnPlayer();
    }

    // Add collisions
    this.addCollisions();

    // Check item collision (without physics)
    this.checkItemCollision();

    // Move player
    this.movePlayer();
}