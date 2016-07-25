"use strict";
// Model representations for game and game elements
const interfaces_1 = require('./interfaces');
class Game {
    constructor(pacman, fruits) {
        this.ghosts = {};
        this.pacman = pacman;
        this.fruits = fruits;
        this.state = interfaces_1.GameState.Active;
        this._started = false;
    }
    updateLocation(playerId, newLocation) {
        if (playerId === this.pacman.id) {
            this.pacman.location = newLocation;
        }
        else {
            if (!this.ghosts[playerId]) {
                throw Error(`No player found with id ${playerId}.`);
            }
            this.ghosts[playerId].location = newLocation;
        }
        this._eval();
    }
    addGhost(player) {
        if (this.ghosts[player.id]) {
            throw Error(`Player ${player.id} is already in the game!`);
        }
        this.ghosts[player.id] = player;
        this._started = true;
        this._eval();
    }
    removePlayer(playerId) {
        if (playerId === this.pacman.id) {
            this.pacman = null;
        }
        else {
            if (!this.ghosts[playerId]) {
                throw Error(`Player ${playerId} does not exist!`);
            }
            delete this.ghosts[playerId];
        }
        this._eval();
    }
    _eval() {
        if (!this.pacman) {
            this.state = interfaces_1.GameState.GhostsWin;
            return;
        }
        if (this.fruits.length === 0) {
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        if (Object.keys(this.ghosts).length === 0 && this._started) {
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        for (let id in this.ghosts) {
            let ghost = this.ghosts[id];
            let distance = this._computeDistance(this.pacman.location, ghost.location);
            if (distance === 0) {
                this.state = interfaces_1.GameState.GhostsWin;
                return;
            }
        }
        for (let fruit of this.fruits) {
            let distance = this._computeDistance(this.pacman.location, fruit.location);
            if (distance === 0) {
                delete this.fruits[this.fruits.indexOf(fruit)];
                if (this.fruits.length === 0) {
                    this.state = interfaces_1.GameState.PacmanWins;
                    return;
                }
            }
        }
    }
    _computeDistance(location1, location2) {
        return Math.pow(location1.x - location2.x, 2) - Math.pow(location1.y - location2.y, 2);
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map