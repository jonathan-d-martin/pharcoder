/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Asteroid;

var Crystal = require('./Crystal.js');

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Asteroid.js');

var Asteroid = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Asteroid.prototype = Object.create(SyncBodyBase.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, UpdateProperties.prototype);

Asteroid.prototype.clientType = 'Asteroid';
Asteroid.prototype.serverType = 'Asteroid';

//Asteroid.prototype.lineColor = '#ff00ff';
//Asteroid.prototype.fillColor = '#00ff00';
//Asteroid.prototype.shapeClosed = true;
//Asteroid.prototype.lineWidth = 1;
//Asteroid.prototype.fillAlpha = 0.25;
Asteroid.prototype._shape = Paths.octagon;

Asteroid.prototype.deadly = true;
Asteroid.prototype.tractorable = true;

Asteroid.prototype.explode = function (respawn) {
    this.worldapi.addSyncableBody(Crystal, {
        x: this.position[0],
        y: this.position[1],
        mass: 10
    });
    this.worldapi.removeSyncableBody(this);
    if (respawn) {
        this.worldapi.addSyncableBody(Asteroid, {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
            angularVelocity: {random: 'float', lo: -5, hi: 5},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 10
        });
    }
};

Asteroid.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Bullet':
            this.starcoder.sendMessage(other.firer.player, 'asteroid', this.vectorScale);
            this.explode(true);
            other.removeSelfFromWorld();
            break;
        case 'Tree':
            this.world.removeConstraint(other.attachmentConstraint);
            other.removeSelfFromWorld();
            break;
    }
};

module.exports = Asteroid;
