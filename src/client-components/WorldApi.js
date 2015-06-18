/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

var WorldApi = function () {};

var bodyTypes = {
    Ship: require('../phaserbodies/Ship.js'),
    Asteroid: require('../phaserbodies/Asteroid.js'),
    Crystal: require('../phaserbodies/Crystal.js'),
    Bullet: require('../phaserbodies/Bullet.js'),
    GenericOrb: require('../phaserbodies/GenericOrb.js')
};

WorldApi.prototype.addBody = function (type, config) {
    var ctor = bodyTypes[type];
    var playerShip = false;
    if (!ctor) {
        this.log('Unknown body type:', type);
        this.log(config);
        return;
    }
    if (type === 'Ship' && config.properties.playerid === this.player.id) {
        config.tag = this.player.username;
        // Only the player's own ship is treated as dynamic in the local physics sim
        config.mass = this.config.physicsProperties.Ship.mass;
        playerShip = true;
    }
    var body = new ctor(this.game, config);
    this.game.add.existing(body);
    if (playerShip) {
        this.game.camera.follow(body);
    }
    return body;
};

WorldApi.prototype.removeBody = function (sprite) {
    sprite.kill();
    this.game.physics.p2.removeBody(sprite.body);
};

module.exports = WorldApi;
