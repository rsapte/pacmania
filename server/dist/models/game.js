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
        if (this.pacman && playerId === this.pacman.id) {
            this.pacman.location = newLocation;
        }
        else {
            if (!this.ghosts[playerId]) {
                console.log(`No player found with id ${playerId}.`);
                return;
            }
            this.ghosts[playerId].location = newLocation;
        }
        this._eval();
    }
    addGhost(player) {
        if (this.ghosts[player.id]) {
            console.log(`Player ${player.id} is already in the game!`);
            return;
        }
        this.ghosts[player.id] = player;
        this._started = true;
        this._eval();
    }
    removePlayer(playerId) {
        if (this.pacman && playerId === this.pacman.id) {
            this.pacman = null;
        }
        else {
            if (!this.ghosts[playerId]) {
                console.log(`Player ${playerId} does not exist!`);
                return;
            }
            delete this.ghosts[playerId];
        }
        this._eval();
    }
    _eval() {
        if (!this._started) {
            return;
        }
        if (!this.pacman && Object.keys(this.ghosts).length > 0) {
            this.state = interfaces_1.GameState.GhostsWin;
            console.log('No pacman, ghosts win');
            return;
        }
        if (this.fruits.length === 0) {
            console.log('No more fruits, pacman wins');
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        if (Object.keys(this.ghosts).length === 0) {
            console.log('All ghosts left. Pacman wins.');
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        for (let id in this.ghosts) {
            let ghost = this.ghosts[id];
            let distance = this._computeDistance(this.pacman.location, ghost.location);
            if (distance === 0) {
                console.log(`Ghost ${ghost.id} eats pacman ${this.pacman.id}, ghosts win`);
                this.pacman = null;
                this.state = interfaces_1.GameState.GhostsWin;
                return;
            }
        }
        for (let fruit of this.fruits) {
            let distance = this._computeDistance(this.pacman.location, fruit.location);
            if (distance === 0) {
                delete this.fruits[this.fruits.indexOf(fruit)];
                if (this.fruits.length === 0) {
                    console.log('No more fruits, pacman wins');
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