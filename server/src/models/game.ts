// Model representations for game and game elements
import { ILocationData, Player, Fruit, GameState, PlayerType } from './interfaces';

export class Game {
    pacman: Player;
    ghosts: { [id: string]: Player}
    fruits: Fruit[];
    state: GameState;
    _started: boolean;

    constructor(pacman: Player, fruits: Fruit[]) {
        this.ghosts = {};
        this.pacman = pacman;
        this.fruits = fruits;
        this.state = GameState.Active;
        this._started = false;
    }

    public updateLocation(playerId: string, newLocation: ILocationData) {
        if(playerId === this.pacman.id) {
            this.pacman.location = newLocation;
        }
        else {
            if(!this.ghosts[playerId]) {
               throw Error(`No player found with id ${playerId}.`);
            }

            this.ghosts[playerId].location = newLocation;
        }

        this._eval();
    }

    public addGhost(player: Player) {
        if(this.ghosts[player.id]) {
            throw Error(`Player ${player.id} is already in the game!`);
        }

        this.ghosts[player.id] = player;
        this._started = true;
        this._eval();
    }

    public removePlayer(playerId: string) {
        if(playerId === this.pacman.id) {
            this.pacman = null;
        }
        else {
            if(!this.ghosts[playerId]) {
                throw Error(`Player ${playerId} does not exist!`);
            }

            delete this.ghosts[playerId];
        }

        this._eval();
    }

    private _eval() {
        if(!this.pacman) {
            this.state = GameState.GhostsWin;
            return;
        }

        if(this.fruits.length === 0) {
            this.state = GameState.PacmanWins;
            return;
        }

        if(Object.keys(this.ghosts).length === 0 && this._started) {
            this.state = GameState.PacmanWins;
            return;
        }

        for(let id in this.ghosts) {
            let ghost = this.ghosts[id];
            let distance = this._computeDistance(this.pacman.location, ghost.location);

            if(distance === 0) {
                this.state = GameState.GhostsWin;
                return;
            }
        }

        for(let fruit of this.fruits) {
            let distance = this._computeDistance(this.pacman.location, fruit.location);
            if(distance === 0) {
                delete this.fruits[this.fruits.indexOf(fruit)];
                if(this.fruits.length === 0) {
                    this.state = GameState.PacmanWins;
                    return;
                }
            }
        }
    }

    private _computeDistance(location1: ILocationData, location2: ILocationData): number {
        return Math.pow(location1.x - location2.x, 2) - Math.pow(location1.y - location2.y, 2);
    }
}