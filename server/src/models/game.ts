// Model representations for game and game elements
import { ILocationData, Player, Fruit, GameState } from './interfaces.ts';

export class Game {
    players: { [id: string]: Player}
    fruits: Fruit[];
    state: GameState;

    constructor(creator: Player, fruits: Fruit[]) {
        this.players = {};
        this.players[creator.id] = creator;
    }

    public updateLocation(playerId: string, newLocation: ILocationData) {
        if(!this.players[playerId]) {
            throw Error(`No player found with id ${playerId}.`);
        }

        this.players[playerId].location = newLocation;
        this._eval();
    }

    public addPlayer(player: Player) {
        if(this.players[player.id]) {
            throw Error(`Player ${player.id} is already in the game!`);
        }

        this.players[player.id] = player;
        this._eval();
    }

    public removePlayer(playerId: string) {
        if(!this.players[playerId]) {
            throw Error(`Player ${playerId} does not exist!`);
        }

        delete this.players[playerId];
        this._eval();
    }

    private _eval() {
        //TODO: update game state, like eating fruits, killing pacman, etc
    }
}