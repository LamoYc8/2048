

cc.Class({
    extends: cc.Component,

    properties: {
        closeButton:{
            default: null,
            type: cc.Button
        },
    },

    endGame: function(){
        this.node.destroy();
    },

});
