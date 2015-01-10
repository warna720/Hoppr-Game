var lvlState = {

    create: function() {
        this.lvl = new Lvl();
        this.lvl.createWorld();
        this.lvl.init(this.lvl.player.x, this.lvl.player.y);
    },
    
    update: function() {
        this.lvl.update();
    }
};