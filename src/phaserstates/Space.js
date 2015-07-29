/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var SimpleParticle = require('../phaserbodies/SimpleParticle.js');
var ThrustGenerator = require('../phaserbodies/ThrustGenerator.js');
var MiniMap = require('../phaserui/MiniMap.js');
var Toast = require('../phaserbodies/Toast.js');

var Controls = require('../phaserplugins/Controls.js');
var SyncClient = require('../phaserplugins/SyncClient.js');

var Space = function () {};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.init = function () {
    this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    this.starcoder.syncclient = this.starcoder.attachPlugin(SyncClient,
        this.starcoder.socket, this.starcoder.cmdQueue);
    this.stage.disableVisibilityChange = true;
};

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    SimpleParticle.cacheTexture(this.game, 'tractor', '#eeeeee', 8, true);
    //this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    //this.game.load.audio('chime', 'assets/sounds/chime.mp3');
    //this.game.load.atlas('joystick', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');
    //this.game.load.bitmapFont('readout-yellow',
    //    'assets/bitmapfonts/heavy-yellow24.png', 'assets/bitmapfonts/heavy-yellow24.xml');
};

Space.prototype.create = function () {
    //console.log('create');
    //var rng = this.game.rnd;
    var wb = this.starcoder.config.worldBounds;
    var ps = this.starcoder.config.physicsScale;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.call(this.world, wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Debugging
    //this.game.time.advancedTiming = true;

    // Set up DOM
    this.starcoder.layoutDOMSpaceState();

    this.starcoder.controls.reset();

    // Virtual joystick
    this.starcoder.controls.addVirtualControls('joystick');
    //this.game.vcontrols = {};
    //this.game.vcontrols.stick = this.game.joystick.addStick(
    //    this.game.width - 150, this.game.height - 75, 100, 'joystick');
    //this.game.vcontrols.stick.scale = 0.5;
    //this.game.vcontrols.firebutton = this.game.joystick.addButton(this.game.width - 50, this.game.height - 75,
    //    'joystick', 'button1-up', 'button1-down');
    //this.game.vcontrols.firebutton.scale = 0.5;

    // Sounds
    this.game.sounds = {};
    this.game.sounds.playerthrust = this.game.sound.add('playerthrust', 1, true);
    this.game.sounds.chime = this.game.sound.add('chime', 1, false);
    this.game.sounds.planttree = this.game.sound.add('planttree', 1, false);
    this.game.sounds.bigpop = this.game.sound.add('bigpop', 1, false);
    this.game.sounds.littlepop = this.game.sound.add('littlepop', 1, false);
    this.game.sounds.tagged = this.game.sound.add('tagged', 1, false);

    // Background
    //var starfield = this.game.make.bitmapData(600, 600);
    //this.starcoder.drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, this.starcoder.starfield);

    this.starcoder.syncclient.start();
    //this.starcoder.socket.emit('client ready');
    this.starcoder.socket.emit('ready');
    this._setupMessageHandlers(this.starcoder.socket);

    // Groups for particle effects
    this.game.thrustgenerator = new ThrustGenerator(this.game);

    // Group for game objects
    this.game.playfield = this.game.add.group();

    // UI
    this.game.ui = this.game.add.group();
    this.game.ui.fixedToCamera = true;

    // Inventory
    var label = this.game.make.text(this.game.width - 100, 25, 'INVENTORY', {font: '24px Arial', fill: '#ff9900', align: 'center'});
    label.anchor.setTo(0.5);
    this.game.ui.add(label);
    //this.game.inventorytext = this.game.make.text(this.game.width - 100, 50, '0 crystals',
    //    {font: '24px Arial', fill: '#ccc000', align: 'center'});
    this.game.inventorytext = this.game.make.bitmapText(this.game.width - 100, 50, 'readout-yellow', '0');
    this.game.inventorytext.anchor.setTo(0.5);
    this.game.ui.add(this.game.inventorytext);

    //MiniMap
    this.game.minimap = new MiniMap(this.game, 300, 300);
    this.game.ui.add(this.game.minimap);
    this.game.x = 10;
    this.game.y = 10;

    // Helpers
    //function randomNormal () {
    //    var t = 0;
    //    for (var i=0; i<6; i++) {
    //        t += rng.normal();
    //    }
    //    return t/6;
    //}
    //
    //function drawStar (ctx, x, y, d, color) {
    //    ctx.strokeStyle = color;
    //    ctx.beginPath();
    //    ctx.moveTo(x-d+1, y-d+1);
    //    ctx.lineTo(x+d-1, y+d-1);
    //    ctx.moveTo(x-d+1, y+d-1);
    //    ctx.lineTo(x+d-1, y-d+1);
    //    ctx.moveTo(x, y-d);
    //    ctx.lineTo(x, y+d);
    //    ctx.moveTo(x-d, y);
    //    ctx.lineTo(x+d, y);
    //    ctx.stroke();
    //}
    //
    //function drawStarField (ctx, size, n) {
    //    var xm = Math.round(size/2 + randomNormal()*size/4);
    //    var ym = Math.round(size/2 + randomNormal()*size/4);
    //    var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
    //        [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
    //    var color;
    //    var i, j, l, q;
    //
    //    n = Math.round(n/4);
    //    for (i=0, l=quads.length; i<l; i++) {
    //        q = quads[i];
    //        for (j=0; j<n; j++) {
    //            color = 'hsl(60,100%,' + rng.between(90,99) + '%)';
    //            drawStar(ctx,
    //                rng.between(q[0]+7, q[2]-7), rng.between(q[1]+7, q[3]-7),
    //                rng.between(2,4), color);
    //        }
    //    }
    //}

};

Space.prototype.resize = function () {
    console.log('resize');
};

Space.prototype.update = function () {
    // FIXME: just a mess for testing
    var self = this;
    this.starcoder.controls.processQueue(function (a) {
        if (a.type === 'up_pressed') {
            self.game.playerShip.localState.thrust = 'starting';
            //self.game.sounds.playerthrust.play();
            //self.game.thrustgenerator.startOn(self.game.playerShip);
        } else if (a.type === 'up_released') {
            self.game.playerShip.localState.thrust = 'shutdown';
            //self.game.sounds.playerthrust.stop();
            //self.game.thrustgenerator.stopOn(self.game.playerShip);
        }
    });
};

Space.prototype.render = function () {
    //console.log('+render+');
    //if (this.starcoder.tempsprite) {
    //    var d = this.starcoder.tempsprite.position.x - this.starcoder.tempsprite.previousPosition.x;
    //    console.log('Delta', d, this.game.time.elapsed, d / this.game.time.elapsed);
    //}
    //console.log('--------------------------------');
    //this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    //this.game.vcontrols.stick.debug(true, true);
    //this.game.debug.cameraInfo(this.game.camera, 100, 20);
    //if (this.ship) {
    //    this.game.debug.spriteInfo(this.ship, 420, 20);
    //}
};

Space.prototype._setupMessageHandlers = function (socket) {
    var self = this;
    socket.on('msg crystal pickup', function (val) {
        self.game.sounds.chime.play();
        Toast.spinUp(self.game, self.game.playerShip.x, self.game.playerShip.y, '+' + val + ' crystals!');
    });
    socket.on('msg plant tree', function (val) {
        self.game.sounds.planttree.play();
    });
    socket.on('msg asteroid pop', function (size) {
        if (size > 1) {
            self.game.sounds.bigpop.play();
        } else {
            self.game.sounds.littlepop.play();
        }
    });
    socket.on('msg tagged', function (val) {
        self.game.sounds.tagged.play();
    });
};

module.exports = Space;
