// Game server that uses Socket.IO to communicate to players
import Http = require('http');
import Fs = require('fs');
import Express = require('express');
import ExpressStatic = require('express-serve-static-core');
import SocketIO = require('socket.io');
import { ILocationUpdatedEvent, IInitPlayerEvent, Events, IUpdateGameStateEvent, Player, PlayerType } from "./models/interfaces";
import { Game } from './models/game';

interface IGameServerConfig {
    port: number;
}

class GameServer {
    private _config: IGameServerConfig;
    private _io: SocketIO.Server;
    private _httpServer: Http.Server;
    private _game: Game;

    constructor(config?: IGameServerConfig) {
        this._config = config;

        // create http server and register routes
        let app = Express();
        this._httpServer = Http.createServer(app);

        // serve up index.html
        app.get('/', function(request, response) {
            response.sendFile(__dirname + '/web/views/index.html');
        });
        
        this._io = SocketIO(this._httpServer);
        this._registerEvents();
    }

    public start() {
        let port = this._config? this._config.port: 8000;

        this._httpServer.listen(port, function() {
            console.log(`HTTP server is listening on port ${port}`);
        });
    }

    private _registerEvents() {
        this._io.on('connection', (socket) => this._onSocketConnected(socket));
    }

    private _onSocketConnected(socket: SocketIO.Socket) {
        console.log(`Client connected, socket id ${socket.id}`);

        socket.on(Events.INIT_PLAYER, (payload: IInitPlayerEvent) => this._onInitPlayer(socket, payload));
        socket.on(Events.UPDATE_LOCATION, (payload: ILocationUpdatedEvent) => this._onUpdateLocation(socket, payload));

        socket.on('disconnect', () => this._onClientDisconnect(socket));
    }

    private _onInitPlayer(socket: SocketIO.Socket, payload: IInitPlayerEvent) {
        if(!this._game) {
            let player = new Player(socket.id, payload.player.location, PlayerType.Pacman);
            this._game = new Game(player, payload.fruits);
        }
        else {
            let player = new Player(socket.id, payload.player.location, PlayerType.Ghost);
            this._game.addPlayer(player);
        }        
    }
    
    private _onClientDisconnect(socket: SocketIO.Socket) {
        if(this._game) {
            this._game.removePlayer(socket.id);
        }
        
        console.log('Client disconnected.');
    }

    private _onUpdateLocation(socket: SocketIO.Socket, event: ILocationUpdatedEvent) {
        //TODO
        /*
        socket.broadcast.emit('update-location', {
            id: socket.id,
            x: event.location.x,
            y: event.location.y
        });
        */
        this._game.updateLocation(socket.id, event.location);
        let players: Player[] = [];
        for(let id in this._game.players) {
            if(this._game.players.hasOwnProperty(id)) {
                players.push(this._game.players[id]);
            }
        }

        let updateEvent: IUpdateGameStateEvent = {
            players: players,
            fruits: this._game.fruits,
            state: this._game.state
        };
        
        this._io.sockets.emit(Events.UPDATE_GAME_STATE, updateEvent);
    }
}

let serverConfig: IGameServerConfig = { port: 3000 };
let gameServer = new GameServer(serverConfig);

gameServer.start();