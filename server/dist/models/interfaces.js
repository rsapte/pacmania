"use strict";
(function (GameState) {
    GameState[GameState["Active"] = 0] = "Active";
    GameState[GameState["PacmanWins"] = 1] = "PacmanWins";
    GameState[GameState["GhostsWin"] = 2] = "GhostsWin";
})(exports.GameState || (exports.GameState = {}));
var GameState = exports.GameState;
class Events {
}
Events.UPDATE_LOCATION = 'update-location';
Events.INIT_PLAYER = 'init-player';
Events.UPDATE_GAME_STATE = 'update-game-state';
exports.Events = Events;
class Sprite {
    constructor(location) {
        this.location = location;
    }
}
(function (PlayerType) {
    PlayerType[PlayerType["Pacman"] = 0] = "Pacman";
    PlayerType[PlayerType["Ghost"] = 1] = "Ghost";
})(exports.PlayerType || (exports.PlayerType = {}));
var PlayerType = exports.PlayerType;
class Fruit extends Sprite {
}
exports.Fruit = Fruit;
class Player extends Sprite {
    constructor(id, initialLocation, playerType) {
        super(initialLocation);
        this.id = id;
        this.score = 0;
        this.type = playerType;
    }
}
exports.Player = Player;
//# sourceMappingURL=interfaces.js.map