var transitionState = {
    preload: function () {
    	
    	var lvlText = game.add.text(game.world.centerX, game.world.centerY, finishedTexts[lvl-2],
        { font: '30px Arial', fill: '#ffffff' });
        lvlText.anchor.setTo(0.5, 0.5);

        this.transitionTime = game.time.time;
    },

    update: function()
    {
    	if (game.time.time - this.transitionTime > 3000)
    	{
    		if (lvl > amountLevels)
    		{
    			lvl = 1;
    			deaths = 0;
    			game.state.start('menu');
    		}
    		else
    		{
    			game.state.start('skeleton');
    		}
    	}
    }
};
