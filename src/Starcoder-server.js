/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');
var SyncServer = require('./server-components/SyncServer.js');
var ControlEndPoint = require('./server-components/ControlEndPoint.js');
var CollisionHandlers = require('./server-components/CollisionHandlers.js');

var World = require('./serverbodies/World.js');

var Player = require('./players/Player.js');
var Guest = require('./players/Guest.js');

Starcoder.mixinPrototype(Starcoder.prototype, SyncServer.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, ControlEndPoint.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, CollisionHandlers.prototype);

/**
 * Initialize Starcoder server
 *
 * @param app {object} - Express app object for REST interface
 * @param io {object} Socket.io object for bidirectional communication
 */
Starcoder.prototype.init = function (app, io) {
    this.app = app;
    this.io = io;
    this.players = {};          // Logged in players
    this.world = new World(this.config.worldBounds, this.config.initialBodies);
    this.world.starcoder = this;
    this.world.log = this.log;
    this.initCollisionHandlers();
    this.initSync();
    this.world.start(1/60);
};

Starcoder.prototype.addPlayer = function (socket, type, descriptor) {
    if (!type) {
        type = Guest;
    } else {
        type = Players.playerTypes[type];
    }
    var player = new type(socket, descriptor);
    this.players[socket.id] = player;
    return player;
};

Starcoder.prototype.forEachPlayer = function (cb) {
    var keys = Object.keys(this.players);
    for (var i = 0, l = keys.length; i < l; i++) {
        cb(id, this.players[keys[i]]);
    }
};

Starcoder.prototype.role = 'server';

// FIXME: Extend object

module.exports = Starcoder;
