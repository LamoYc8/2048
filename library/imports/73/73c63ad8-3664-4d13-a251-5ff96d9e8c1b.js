"use strict";
cc._RF.push(module, '73c63rYNmRNE6JRX/ltnowb', 'GameOverDia');
// script/GameOverDia.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        closeButton: {
            default: null,
            type: cc.Button
        }
    },

    endGame: function endGame() {
        this.node.destroy();
    }

});

cc._RF.pop();