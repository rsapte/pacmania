// Game server that uses Socket.IO to communicate to players
import Http = require('http');
import Fs = require('fs');
import Express = require('express');
import ExpressStatic = require('express-serve-static-core');
import SocketIO = require('socket.io');
import { ILocationUpdatedEvent, IInitPlayerEvent, Events, IUpdateGameStateEvent, Player, PlayerType, GameState } from "./models/interfaces";
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

        if(this._game && this._game.state !== GameState.Active) {
            socket.disconnect(true);
            return;
        }

        socket.on(Events.INIT_PLAYER, (payload: string) => this._onInitPlayer(socket, payload));
        socket.on(Events.UPDATE_LOCATION, (payload: string) => this._onUpdateLocation(socket, payload));

        socket.on('disconnect', () => this._onClientDisconnect(socket));
    }

    private _onInitPlayer(socket: SocketIO.Socket, event: string) {
        let payload: IInitPlayerEvent = JSON.parse(event);
        if(!this._game) {
            let pacman = new Player(socket.id, payload.player.location, PlayerType.Pacman);
            this._game = new Game(pacman, payload.fruits);
        }
        else {
            let ghost = new Player(socket.id, payload.player.location, PlayerType.Ghost);
            this._game.addGhost(ghost);
        }        

        this._broadcastGameState();
    }
    
    private _onClientDisconnect(socket: SocketIO.Socket) {
        if(this._game) {
            this._game.removePlayer(socket.id);
        }

        this._broadcastGameState();
        console.log('Client disconnected.');
    }

    private _onUpdateLocation(socket: SocketIO.Socket, event: string) {
        let payload: ILocationUpdatedEvent = JSON.parse(event);
        this._game.updateLocation(socket.id, payload.location);
        this._broadcastGameState();
    }

    private _broadcastGameState() {
        let players: Player[] = [];
        for(let id in this._game.ghosts) {
            if(this._game.ghosts.hasOwnProperty(id)) {
                players.push(this._game.ghosts[id]);
            }
        }

         let updateEvent: IUpdateGameStateEvent = {
             pacman: this._game.pacman,
             ghosts: players,
             fruits: this._game.fruits,
             state: this._game.state
        };
        
        this._io.sockets.emit(Events.UPDATE_GAME_STATE, updateEvent);
    }
}

let serverConfig: IGameServerConfig = { port: 3000 };
let gameServer = new GameServer(serverConfig);

gameServer.start();