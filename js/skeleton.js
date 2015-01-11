var lvlState = {

    create: function() {
        this.lvl = new Lvl();
        this.lvl.createWorld();
        this.lvl.init();
    },
    
    update: function() {
        this.lvl.update();
    }
};