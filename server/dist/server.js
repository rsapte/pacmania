"use strict";
// Game server that uses Socket.IO to communicate to players
const Http = require('http');
const Express = require('express');
const SocketIO = require('socket.io');
const interfaces_1 = require("./models/interfaces");
const game_1 = require('./models/game');
class GameServer {
    constructor(config) {
        this._config = config;
        // create http server and register routes
        let app = Express();
        this._httpServer = Http.createServer(app);
        // serve up index.html
        app.get('/', function (request, response) {
            response.sendFile(__dirname + '/web/views/index.html');
        });
        this._io = SocketIO(this._httpServer);
        this._registerEvents();
    }
    start() {
        let port = this._config ? this._config.port : 8000;
        this._httpServer.listen(port, function () {
            console.log(`HTTP server is listening on port ${port}`);
        });
    }
    _registerEvents() {
        this._io.on('connection', (socket) => this._onSocketConnected(socket));
    }
    _onSocketConnected(socket) {
        console.log(`Client connected, socket id ${socket.id}`);
        socket.on(interfaces_1.Events.INIT_PLAYER, (payload) => this._onInitPlayer(socket, payload));
        socket.on(interfaces_1.Events.UPDATE_LOCATION, (payload) => this._onUpdateLocation(socket, payload));
        socket.on('disconnect', () => this._onClientDisconnect(socket));
    }
    _onInitPlayer(socket, event) {
        console.log(`Received player init event ${event}`);
        let payload = JSON.parse(event);
        if (!this._game || this._game.state !== interfaces_1.GameState.Active) {
            console.log('Starting a new game.');
            let pacman = new interfaces_1.Player(socket.id, payload.player.location, interfaces_1.PlayerType.Pacman);
            this._game = new game_1.Game(pacman, payload.fruits);
        }
        else {
            let ghost = new interfaces_1.Player(socket.id, payload.player.location, interfaces_1.PlayerType.Ghost);
            this._game.addGhost(ghost);
        }
        this._broadcastGameState();
    }
    _onClientDisconnect(socket) {
        console.log('Client disconnected.');
        if (this._game) {
            this._game.removePlayer(socket.id);
        }
        this._broadcastGameState();
    }
    _onUpdateLocation(socket, event) {
        console.log(`Received location update event ${event}`);
        let payload = JSON.parse(event);
        if (!this._game) {
            console.log(`No game exists, ignoring event.`);
            return;
        }
        this._game.updateLocation(socket.id, payload.location);
        this._broadcastGameState();
    }
    _broadcastGameState() {
        let players = [];
        for (let id in this._game.ghosts) {
            if (this._game.ghosts.hasOwnProperty(id)) {
                players.push(this._game.ghosts[id]);
            }
        }
        let updateEvent = {
            pacman: this._game.pacman,
            ghosts: players,
            fruits: this._game.fruits,
            state: this._game.state
        };
        console.log(`Pushing state update to sockets ${JSON.stringify(updateEvent)}`);
        this._io.sockets.emit(interfaces_1.Events.UPDATE_GAME_STATE, updateEvent);
    }
}
let serverConfig = { port: 3000 };
let gameServer = new GameServer(serverConfig);
gameServer.start();
//# sourceMappingURL=server.js.map