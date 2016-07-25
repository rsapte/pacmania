// Game server that uses Socket.IO to communicate to players
import Http = require('http');
import SocketIO = require('socket.io');
import { ILocationUpdatedEvent, ICreateGameEvent, IJoinGameEvent, Events } from "./models/interfaces";

interface IGameServerConfig {
    port: number;
}

class GameServer {
    private _config: IGameServerConfig;
    private _io: SocketIO.Server;

    constructor(config?: IGameServerConfig) {
        this._config = config;
        let httpServer = Http.createServer();
        this._io = SocketIO(httpServer);
    }

    public start() {
        this._io.listen(this._config? this._config.port: 8000);
        this._registerEvents();
    }

    private _registerEvents() {
        this._io.on('connection', (socket) => this._onSocketConnected(socket));
    }

    private _onSocketConnected(socket: SocketIO.Socket) {
        socket.on(Events.CREATE_GAME, (payload: ICreateGameEvent) => this._onCreateGame(socket, payload));
        socket.on(Events.JOIN_GAME, (payload: IJoinGameEvent) => this._onJoinGame(socket, payload));
        socket.on(Events.UPDATE_LOCATION, (payload: ILocationUpdatedEvent) => this._onUpdateLocation(socket, payload));
    }
    
    private _onUpdateLocation(socket: SocketIO.Socket, event: ILocationUpdatedEvent) {
        //TODO
    }

    private _onCreateGame(socket: SocketIO.Socket, event: ICreateGameEvent) {
        //TODO
    }

    private _onJoinGame(socket: SocketIO.Socket, event: IJoinGameEvent) {
        //TODO
    }
}

let serverConfig: IGameServerConfig = { port: 8000 };
let gameServer = new GameServer(serverConfig);

gameServer.start();