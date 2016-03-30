/**
 * TutorialInterface.js
 */
'use strict';

var FSM = require('../util/FSM.js');

module.exports = {
    setTutorial: function (player) {
        var self = this;
        player.tutorial = new FSM(standardTutorial, 'init');
        player.tutorial.once('goalTurnRight', function () {
            self.send(player, 'tutorial', 'Use the joystick or arrow keys to turn your ship to the right.');
        });
        player.tutorial.once('achievedTurnRight', function () {
            player.getShip().crystals += 50;
            self.send(player, 'tutorial', 'Well done!');
            self.send(player, 'crystal pickup', 50);
        });
        player.tutorial.once('goalTurnLeft', function () {
            self.send(player, 'tutorial', 'Use the joystick or arrow keys to turn your ship to the left.');
        });
        player.tutorial.once('achievedTurnLeft', function () {
            player.getShip().crystals += 50;
            self.send(player, 'tutorial', 'Nice job!');
            self.send(player, 'crystal pickup', 50);
        });
        player.tutorial.once('goalThrust', function () {
            self.send(player, 'tutorial', 'Use the joystick or arrow keys to move your ship forward.');
        });
        player.tutorial.once('achievedThrust', function () {
            player.getShip().crystals += 50;
            self.send(player, 'tutorial', 'Great!');
            self.send(player, 'crystal pickup', 50);
        });
        player.tutorial.once('goalPlantTree', function () {
            self.send(player, 'tutorial', 'Now fly to a green planet and touch it to plant a tree.');
        });
        player.tutorial.once('achievedPlantTree', function () {
            self.send(player, 'tutorial', 'Fantastic! Now use the spacebar to shoot lasers at the red asteroids. Collect the blue crystals.');


		});
		player.tutorial.once('endTutorial1', function () {
			self.send(player, 'tutorial', 'Create space station blocks and use the T key to emit your tractor beam.');
		});
		player.tutorial.once('endTutorial2', function () {
			self.send(player, 'tutorial', '');
		});


    },

    login: function (socket, player) {
        this.setTutorial(player);
    },

    ready: function (player) {
        player.tutorial.transition('start');
    }
};

var standardTutorial = {
    init: {start: 'goalTurnRight'},
    goalTurnRight: {turnright: 'pendingTurnRight'},
    pendingTurnRight: {
        turnleft: 'goalTurnRight', stopturning: 'goalTurnRight',
        auto: 'achievedTurnRight', timeout: 500
    },
    achievedTurnRight: {auto: 'goalTurnLeft', timeout: 1500},
    goalTurnLeft: {turnleft: 'pendingTurnLeft'},
    pendingTurnLeft: {
        turnright: 'goalTurnLeft', stopturning: 'goalTurnLeft',
        auto: 'achievedTurnLeft', timeout: 500
    },
    achievedTurnLeft: {auto: 'goalThrust', timeout: 1500},
    goalThrust: {thrust: 'pendingThrust'},
    pendingThrust: {
        retrothrust: 'goalThrust', stopthrust: 'goalThrust',
        auto: 'achievedThrust', timeout: 500
    },
    achievedThrust: {auto: 'goalPlantTree', timeout: 1500},
    goalPlantTree: {planttree: 'achievedPlantTree'},
    achievedPlantTree: {auto: 'endTutorial1',timeout:7000},
	endTutorial1: {auto: 'endTutorial2',timeout:7000}
};