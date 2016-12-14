/**
 * Planetoid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Planetoid;

var Tree = require('./Tree.js');
var Crystal = require('./Crystal.js');

var Planetoid = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    //this.damping = 0;
    //this.angularDamping = 0;
    this.trees = [];
    this.attachments = {};
    this.bloomed = false;
};

Planetoid.prototype = Object.create(SyncBodyBase.prototype);
Planetoid.prototype.constructor = Planetoid;

Starcoder.mixinPrototype(Planetoid.prototype, UpdateProperties.prototype);

Planetoid.prototype.clientType = 'Planetoid';
Planetoid.prototype.serverType = 'Planetoid';

Planetoid.prototype.tractorable = true;
Planetoid.prototype.defaults = {vectorScale: 5.75};

Planetoid.prototype.adjustShape = function () {
    SyncBodyBase.prototype.adjustShape.call(this);
    this.centerSensor = new p2.Circle({radius: 0.1, sensor: true});
    this.setCollisionGroup(this.centerSensor);
    this.setCollisionMask(this.centerSensor, ['StationBlock']);
    this.addShape(this.centerSensor);
};

Planetoid.prototype.plantTree = function (x, y, ship) {
    var tree = this.worldapi.addSyncableBody(Tree, {
        mass: 0.1,
        position: [this.position[0] + x, this.position[1] + y],
        angle: Math.atan2(x, -y),
        lineColor: ship.lineColor,
        owner: ship.player,
        depth: ship.seederProperties.depth,
        branchFactor: ship.seederProperties.branchFactor,
        branchDecay: ship.seederProperties.branchDecay,
        spread: ship.seederProperties.spread,
        trunkLength: ship.seederProperties.trunkLength
    });
    //tree.angle = Math.atan2(x, -y);
    tree.attachmentConstraint = new p2.LockConstraint(this, tree);
    this.world.addConstraint(tree.attachmentConstraint);
    var self = this;
    tree.on('fullygrown', function () {
        self.trees.push(tree);
        tree.planetoid = self;
        if (self.trees.length >= 5 && !self.bloomed) {
            self.bloom()
        }
    });
};

Planetoid.prototype.bloom = function () {
    for (var i = 0; i < this.trees.length; i++) {
        var tree = this.trees[i];
        var sf = 0.7;
        var cx = tree.position[0] + sf * (tree.position[0] - this.position[0]);
        var cy = tree.position[1] + sf * (tree.position[1] - this.position[1]);
        //console.log('Crystal at', cx, cy, ':', self.position[0], self.position[1]);
        var crystal = this.worldapi.addSyncableBody(Crystal, {
            collisionExclude: ['Crystal', 'Tree', 'Planetoid'],
            value: 400,
            fillColor: '#ff0000',
            position: [cx, cy]
        });
        crystal.attachmentConstraint = new p2.LockConstraint(this, crystal);
        this.world.addConstraint(crystal.attachmentConstraint);
    }
    this.bloomed = true;
};

Planetoid.prototype.beginContact = function (other, equations) {
    switch (other.serverType) {
        case 'Ship':
            // First make sure this is first impact
            for (var i = 0, l = equations.length; i < l; i++) {
                if (!equations[i].firstImpact) {
                    return;
                }
            }
            // Then make sure we have enough crystals
            if (other.crystals >= 150) {
                other.crystals -= 150;
                // Assume common case of single point contact
                equations = equations[0];
                if (equations.bodyA === this) {
                    var point = equations.contactPointA;
                } else {
                    point = equations.contactPointB;
                }
                this.starcoder.sendMessage(other.player, 'planttree');
                other.player.achieve('planttree');
                this.plantTree(point[0], point[1], other);
                other.player.stats.treesPlanted++;
                this.starcoder.updatePlayerScore('Trees Planted', other.player.id, other.player.stats.treesPlanted);
            }
            break;
    }
};

module.exports = Planetoid;
