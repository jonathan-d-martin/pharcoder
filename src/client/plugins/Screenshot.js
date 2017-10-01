/**
 * Screenshot.js
 *
 * Created by jay on 10/1/17
 */

const debounceTime = 1000;
const maxShots = 1000;

let debounce = true;

let Screenshot = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Screenshot.prototype = Object.create(Phaser.Plugin.prototype);
Screenshot.prototype.constructor = Screenshot;

Screenshot.prototype.init = function () {
    this.ssKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.screenshots = [];
    this.lastShot = -1;
    this.ssReq = false;
};

Screenshot.prototype.preUpdate = function () {
    // Take screenshot
    if (debounce && this.ssKey.isDown) {
        this.ssReq = true;
        debounce = false;
        setTimeout(function () {
            debounce = true;
        }, debounceTime);
    }
};

Screenshot.prototype.render = function () {
    if (this.ssReq) {
        this.addShot(this.game.canvas.toDataURL());
        this.ssReq = false;
    }
};

Screenshot.prototype.addShot = function (dataurl) {
    this.lastShot = (this.lastShot + 1) % maxShots;
    this.screenshots[this.lastShot] = dataurl;
};

module.exports = Screenshot;