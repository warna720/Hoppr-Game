function Lvl() {}

Lvl.prototype.init = function ()
{
    // Create sprite for player and animations
    this.player = game.add.sprite(this.player.x, this.player.y, 'player');
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

    // Create emitter
    this.emitter = game.add.emitter(0, 0, 15);
    // Set the 'pixel' image for the particles
    this.emitter.makeParticles('pixel');
    this.emitter.setYSpeed(-400, 200);
    this.emitter.setXSpeed(-400, 200);
    this.emitter.gravity = 750;

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

Lvl.prototype.startEmitter = function ()
{
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.start(true, 1000, null, 30);
}

Lvl.prototype.respawnPlayer = function ()
{
    this.startEmitter();
    this.updateDeaths();

    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    this.player.x = this.player.spawnX;
    this.player.y = this.player.spawnY;

    this.respawnItems();
    this.respawnDestructibleBlocks();
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

Lvl.prototype.startWallGravity = function (player, ground)
{
    if(player.body.touching.down)
    {
        game.tweens.removeFrom(wall);
        ground.body.gravity.y = -100;
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
    return  (this.touchingSides() &&
            (this.cursor.left.isDown || this.cursor.right.isDown)) || 
            (Math.abs(this.touchedWallX - this.player.x) < 30 &&
            (this.leftBlocked || this.rightBlocked));
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


Lvl.prototype.touchingLeft = function ()
{
    return this.player.body.blocked.left || this.player.body.touching.left;
}

Lvl.prototype.touchingRight = function ()
{
    return this.player.body.blocked.right || this.player.body.touching.right;
}

Lvl.prototype.touchingSides = function ()
{
    return this.touchingLeft() || this.touchingRight();
}

Lvl.prototype.touchingWall = function ()
{
    if (this.touchingLeft() && this.cursor.left.isDown)
    {
        this.leftBlocked = true;
    }
    else if (this.touchingRight() && this.cursor.right.isDown)
    {
        this.rightBlocked = true;
    }

    if (this.touchingSides())
    {
        this.touchedWallX = this.player.x;
        this.touchedWallY = this.player.y;
    }

    if (game.time.time - this.timeSinceWallTouch > 500)
    {
        this.leftBlocked = false;
        this.rightBlocked = false;
    }

    return this.touchingSides();
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

    // Create the layer by name of the Tiled layer
    this.wall = this.map.createLayer('Ground');

    // Set the world size to match the size of the layer
    this.wall.resizeWorld();

    // Allow collison for ground layer
    this.map.setCollision(1);

    // Add player
    this.createPlayer();

    // Create items
    this.createItems();

    this.createDestructibleBlocks();

    // Create saws
    this.createSaws();

    // Start saws animation
    this.initSaws();

    // Create platforms
    this.createPlatforms();

    // Start platform tweens
    this.initPlatforms();
}

Lvl.prototype.createPlayer = function ()
{
    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;
    this.map.createFromObjects("Objects", 1, "", 0, true, false, this.playerGroup);
    this.player = this.playerGroup.getAt(0);
}

Lvl.prototype.createItems = function ()
{
    this.itemsGroup = game.add.group();
    this.itemsGroup.enableBody = true;
    this.map.createFromObjects("Objects", 2, "item", 0, true, false, this.itemsGroup);
    this.itemsGroup.setAll('body.immovable', true);
}

Lvl.prototype.createDestructibleBlocks = function ()
{
    this.destructibleBlocksGroup = game.add.group();
    this.destructibleBlocksGroup.enableBody = true;
    this.map.createFromObjects("Objects", 4, "destructibleBlock", 0, true, false, this.destructibleBlocksGroup);
    this.destructibleBlocksGroup.setAll('body.immovable', true);
}

Lvl.prototype.destroyBlock = function (player, block)
{
    if (!block.destroyed)
    {
        block.destroyed = true;
        var anim = block.animations.add('destroyBlock', [1, 2], 10);
        
        anim.onComplete.add(function()
        {
            this.exists = false;
        }, block);

        block.animations.play('destroyBlock');
    }
}

Lvl.prototype.createPlatforms = function ()
{
    this.platformsGroup = game.add.group();
    this.platformsGroup.enableBody = true;
    this.map.createFromObjects("Objects", 5, "platform", 0, true, false, this.platformsGroup);
    this.platformsGroup.setAll('body.immovable', true);
    this.platformsGroup.forEach(function(platform)
    {
        platform.spawnX = platform.x;
        platform.spawnY = platform.y;
        platform.init = true;
    }, this);
}

Lvl.prototype.initPlatforms = function ()
{
    this.platformsGroup.forEach(function(platform)
    {
        if (platform.init)
        {
            platform.toX = parseInt(platform.toX);
            platform.toY = parseInt(platform.toY);
            platform.runTime = parseInt(platform.runTime);

            platform.tween = game.add.tween(platform)
                            .to({x: platform.toX - platform.width, 
                                 y: platform.toY - platform.height}, 
                                 platform.runTime)
                            .to({x: platform.x, 
                                 y: platform.y}, 
                                 platform.runTime)
                            .loop().start();

            platform.init = false;
        }
    }, this);
}

Lvl.prototype.raisePlatform = function (player, platform)
{
    game.tweens.removeFrom(platform);
    platform.body.gravity.y = -100;
}

Lvl.prototype.checkPlatforms = function ()
{
    this.platformsGroup.forEach(function(platform)
    {
        if (!platform.inWorld)
        {
            platform.body.gravity.y = 0;
            platform.body.velocity.y = 0;

            platform.x = platform.spawnX;
            platform.y = platform.spawnY;

            platform.init = true;
            this.initPlatforms();
        }
    }, this);
}

Lvl.prototype.createSaws = function ()
{
    this.sawsGroup = game.add.group();
    this.sawsGroup.enableBody = true;
    this.map.createFromObjects("Objects", 3, "saw", 0, true, false, this.sawsGroup);
    this.sawsGroup.setAll('body.immovable', true);
    this.sawsGroup.forEach(function(saw)
    {
        saw.anchor.setTo(0.5, 0.5);
    }, this);
}

Lvl.prototype.initSaws = function ()
{
    this.sawsGroup.forEach(function(saw)
    {
        saw.toX = parseInt(saw.toX);
        saw.toY = parseInt(saw.toY);
        saw.idleTime = parseInt(saw.idleTime);
        saw.runTime = parseInt(saw.runTime);

        saw.tween = game.add.tween(saw)
                    .to({x: saw.x, y: saw.y}, saw.idleTime/2)
                    .to({x: saw.x, y: saw.y, angle: 45*45*45}, saw.idleTime/2)
                    .to({x: saw.toX, y: saw.toY, angle: 60*60*60}, saw.runTime)
                    .loop().start();
    
    }, this);
}

Lvl.prototype.respawnItems = function ()
{
    this.itemsGroup.forEach(function(item)
    {
        item.reset(item.x, item.y);
    }, this);
}

Lvl.prototype.respawnDestructibleBlocks = function ()
{
    this.destructibleBlocksGroup.forEach(function(block)
    {
        block.reset(block.x, block.y);
        block.loadTexture('destructibleBlock')
        block.destroyed = false;
    }, this);
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

Lvl.prototype.checkSawCollision = function ()
{
    this.sawsGroup.forEach(function(saw)
    {
        if(Phaser.Rectangle.intersects(this.player.body, saw.body))
        {
            this.respawnPlayer();
        }
    }, this);
}

Lvl.prototype.addCollisions = function ()
{
    game.physics.arcade.collide(this.player, this.wall);
    game.physics.arcade.collide(this.player, this.destructibleBlocksGroup, this.destroyBlock);//, null, this);
    game.physics.arcade.collide(this.player, this.platformsGroup, this.raisePlatform);//, null, this);
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

    // Player
    if (!this.player.inWorld)
    {
        this.respawnPlayer();
    }

    // Platforms
    this.checkPlatforms();



    // Add collisions
    this.addCollisions();

    // Check item collision (without physics)
    this.checkItemCollision();

    /*Manual collision check for saws
    * This is needed because automatic collision check does not work.
    * Seems like a bug in phaser. When player stands still and collides
    * with a running tween, collision does not get detected.
    */
    this.checkSawCollision();

    // Move player
    this.movePlayer();
}