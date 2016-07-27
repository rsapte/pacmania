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
        this.changes = [];
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
        this.changes = [];
        if (!this._started) {
            if (!this.pacman) {
                this.state = interfaces_1.GameState.GhostsWin;
            }
            return;
        }
        if (!this.pacman && Object.keys(this.ghosts).length > 0) {
            this.state = interfaces_1.GameState.GhostsWin;
            console.log('No pacman, ghosts win');
            return;
        }
        if (this.pacman && this.fruits.length === 0) {
            console.log('No more fruits, pacman wins');
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        if (this.pacman && Object.keys(this.ghosts).length === 0) {
            console.log('All ghosts left. Pacman wins.');
            this.state = interfaces_1.GameState.PacmanWins;
            return;
        }
        for (let id in this.ghosts) {
            let ghost = this.ghosts[id];
            let distance = this._computeDistance(this.pacman.location, ghost.location);
            if (distance < 10) {
                let msg = `Ghost ${ghost.id} eats pacman ${this.pacman.id}, ghosts win`;
                console.log(msg);
                ghost.score += 1000;
                this.changes.push(msg);
                this.pacman = null;
                this.state = interfaces_1.GameState.GhostsWin;
                return;
            }
        }
        for (let i = 0; i < this.fruits.length; i++) {
            let fruit = this.fruits[i];
            let distance = this._computeDistance(fruit.location, this.pacman.location);
            if (distance < 5) {
                this.pacman.score += fruit.value;
                this.changes.push(`Pacman ate fruit '${fruit.name} for ${fruit.value} points.`);
                this.fruits.splice(i, 1);
                i--;
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