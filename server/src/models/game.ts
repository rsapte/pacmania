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
        if(this.pacman && playerId === this.pacman.id) {
            this.pacman.location = newLocation;
        }
        else {
            if(!this.ghosts[playerId]) {
               console.log(`No player found with id ${playerId}.`);
               return;
            }

            this.ghosts[playerId].location = newLocation;
        }

        this._eval();
    }

    public addGhost(player: Player) {
        if(this.ghosts[player.id]) {
            console.log(`Player ${player.id} is already in the game!`);
            return;
        }

        this.ghosts[player.id] = player;
        this._started = true;
        this._eval();
    }

    public removePlayer(playerId: string) {
        if(this.pacman && playerId === this.pacman.id) {
            this.pacman = null;
        }
        else {
            if(!this.ghosts[playerId]) {
                console.log(`Player ${playerId} does not exist!`);
                return;
            }

            delete this.ghosts[playerId];
        }

        this._eval();
    }

    private _eval() {
        if(!this._started) {
            return;
        }
        
        if(!this.pacman && Object.keys(this.ghosts).length > 0) {
            this.state = GameState.GhostsWin;
            console.log('No pacman, ghosts win');
            return;
        }

        if(this.pacman && this.fruits.length === 0) {
            console.log('No more fruits, pacman wins');
            this.state = GameState.PacmanWins;
            return;
        }

        if(this.pacman && Object.keys(this.ghosts).length === 0) {
            console.log('All ghosts left. Pacman wins.')
            this.state = GameState.PacmanWins;
            return;
        }

        for(let id in this.ghosts) {
            let ghost = this.ghosts[id];
            let distance = this._computeDistance(this.pacman.location, ghost.location);

            if(distance === 0) {
                console.log(`Ghost ${ghost.id} eats pacman ${this.pacman.id}, ghosts win`);
                this.pacman = null;
                this.state = GameState.GhostsWin;
                return;
            }
        }

        for(let fruit of this.fruits) {
            let distance = this._computeDistance(this.pacman.location, fruit.location);
            if(distance === 0) {
                delete this.fruits[this.fruits.indexOf(fruit)];
                if(this.fruits.length === 0) {
                    console.log('No more fruits, pacman wins');
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