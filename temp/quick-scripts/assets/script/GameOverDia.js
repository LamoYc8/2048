(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/GameOverDia.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '73c63rYNmRNE6JRX/ltnowb', 'GameOverDia', __filename);
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
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=GameOverDia.js.map
        