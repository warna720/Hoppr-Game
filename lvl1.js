
var lvl1 = {

    create: function() {
        this.createWorld();
        this.lvl = new Lvl();
        this.lvl.itemsToCollect = 1;
    },
    
    update: function() {

        if(this.lvl.lvlDone)
        {
            ;
        }

        game.physics.arcade.collide(this.lvl.player, this.wall);
        game.physics.arcade.collide(this.lvl.player, this.wallGroup, this.lvl.startWallGravity, null, this);

        this.wallGroup.forEach(function(wall)
        {
            if(!wall.inWorld)
            {
                wall.body.gravity.y = 0;
                wall.body.velocity.y = 0;
                wall.x = wall.defX;
                wall.y = wall.defY;
                wall.tween = game.add.tween(wall).to({x: 720, y: wall.y}, 2000).to({x: 10, y: wall.y}, 2000).loop().start();
            }
        }, this);

        if (!this.lvl.player.inWorld) {
            this.lvl.respawnPlayer();
        }

        this.lvl.movePlayer();
    },

    createWorld: function() {

        // Create the tilemap
        this.map = game.add.tilemap('map');

        // Add the tileset to the map
        this.map.addTilesetImage('tileset');

        // Create the layer, by specifying the name of the Tiled layer
        this.wall = this.map.createLayer('wall');

        // Set the world size to match the size of the layer
        this.wall.resizeWorld();

        this.map.setCollisionBetween(1, 10000, 1, this.wall, false)

        this.wallGroup = game.add.group();
        this.wallGroup.enableBody = true;
        this.map.createFromObjects("objectL", 19, "wallGr", 0, true, false, this.wallGroup);
        
        this.wallGroup.setAll('body.immovable', true);
        this.wallGroup.forEach(function(wall)
        {
            wall.defX = wall.x;
            wall.defY = wall.y;
            wall.tween = game.add.tween(wall).to({x: 720, y: wall.y}, 2000).to({x: 10, y: wall.y}, 2000).loop().start();
        }, this);
    },
};