/**
 * NetworkInterface.js
 * Client side
 */
'use strict';

module.exports = {
    finalize: function () {
        // FIXME: Use config
        this.msgBufOut = this.newMsgBuffer(4 * 1024);
        this.msgBufIn = this.newMsgBuffer();
    },

    connect: function (socket) {
        var self = this;
        self.socket.emit('login', self.ticketid);
        self.socket.on('loginSuccess', function (player) {
            self.player = player;
            self.connected = true;
            // Do these go here? Hmmmm
            self.socket.on('disconnect', function () {
                self.game.paused = true;
                throw 'Death by debugging';
            });
            self.socket.on('reconnect', function () {
                self.game.paused = false;
            });
            self.socket.on('timesync', function (data) {
                self._latency = data - self.game.time.now;
            });
        });
        // Stopgap implementation
        //self.socket.on('update', function (data) {
        //    //this.latestUpdate = data.wu;
        //    //console.log('update--');
        //    self.events.emit('sync', data.wu);
        //    self.events.emit('msg', data.msg);
        //});
        self.socket.on('message', function (data) {
            self.msgBufIn.reset(new Buffer(data));
            self.events.emit('syncB');
            self.events.emit('msgB');
        });
    },

    serverConnect: function () {
        var self = this;
        if (this.socket) {
            delete this.socket;
            this.connected = false;
            this.lastNetError = null;
        }
        $.ajax({
            url: '/api/identity',
            method: 'GET',
            success: function (data, status) {
                //console.log('data', data);
                var serverUri = data.serverUri;
                self.ticketid = data.ticketid;      // FIXME
                //self.player = data.player;
                self.socket = self.io(serverUri, self.config.ioClientOptions);
                self.socket.on('connect', function () {
                    self.events.emit('connect', self.socket);
                })
            }
        })
    }
};