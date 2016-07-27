export interface ILocationData {
    x: number;
    y: number;
}

export interface ILocationUpdatedEvent {
    location: ILocationData;
}

export interface IInitPlayerEvent {
    player: Player;
    fruits: Fruit[];
}

export enum GameState {
    Active, 
    PacmanWins,
    GhostsWin
}

export interface IUpdateGameStateEvent {
    pacman: Player;
    ghosts: Player[];
    fruits: Fruit[];
    state: GameState;
    change: string;
}

export class Events {
    public static UPDATE_LOCATION = 'update-location';
    public static INIT_PLAYER = 'init-player';
    public static UPDATE_GAME_STATE = 'update-game-state';
}

class Sprite {
    location: ILocationData;

    constructor(location: ILocationData) {
        this.location = location;
    }
}

export enum PlayerType {
    Pacman,
    Ghost
}

export class Fruit extends Sprite {
    value: number;
    name: string;
}

export class Player extends Sprite {
    id: string;
    score: number;
    type: PlayerType;

    constructor(id: string, initialLocation: ILocationData, playerType: PlayerType) {
        super(initialLocation);
        this.id = id;
        this.score = 0;
        this.type = playerType;
    }
}