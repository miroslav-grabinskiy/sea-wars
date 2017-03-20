"use strict";

const Battlefield = require('./battlefield'),
      libs = require('./libs');
    
const Game = function(id, user1, user2) {
    this.user1 = user1;
    this.user2 = user2;
    this.id = id;
    this.battlefield1 = new Battlefield();
    this.battlefield2 = new Battlefield();
    this.state = 'turn';
    this.turn = libs.getRandomInt(0, 1) ? user1.id : user2.id;
    user1.setGame(this);
    user2.setGame(this);
};
    

Game.prototype.start = function start() {
    this.user1.startGame();
    this.user2.startGame();
}

Game.prototype.getStartInfo = function gameInfo(userId) {
    const [user, opponent] = userId === this.user1.id ? ['user1', 'user2'] : ['user2', 'user1'];
    const battlefield = user === 'user1' ? this.battlefield1 : this.battlefield2;
    const opponentBattlefield = user === 'user1' ? this.battlefield2 : this.battlefield1;
    //battlefield.print();
    return {
        battlefield: battlefield.getBattlefield(),
        opponentBattlefield: opponentBattlefield.getShooted(),
        turn: this.checkTurn(userId),
        opponent: this[opponent].login
    };
}

Game.prototype.gameInfo = function gameInfo(userId) {
    
}

Game.prototype.checkTurn = function gameInfo(userId) {
    return this.turn === userId && this.state === 'turn';
}

Game.prototype.changeTurn = function changeTurn(user) {
    this.turn = this.turn === this.user1.id ? this.user2.id : this.user1.id;
}

Game.prototype.validateCoordinates = function validateCoordinates(coords) {
    if (!coords || ! (coords instanceof Object) || !coords.hasOwnProperty('colName') || !coords.hasOwnProperty('rowName') || typeof coords.colName === 'object' || typeof coords.rowName === 'object') {
        return false;
    }
    
    return this.battlefield1.checkValidField(coords.rowName, coords.colName);
}

Game.prototype.shoot = function shoot(userId, coords) {
    const currentUser = this.user1.id === userId ? 'user1' : 'user2';
    const battleField = currentUser === 'user1' ? this.battlefield2 : this.battlefield1;

    const isValidCoords = this.validateCoordinates(coords);
    if (!isValidCoords) {
        return this[currentUser].socket.emit('err', {message: 'invalid coordinates'});
    }
    
    if ( battleField.wasShooted(coords.rowName, coords.colName) ) {
        return this[currentUser].socket.emit('err', {message: 'already shooted'});
    }
    
    const shotStatus = battleField.shoot(coords.rowName, coords.colName);
    
    this.user1.socket.emit('shot', {coords, shotStatus});
    this.user2.socket.emit('shot', {coords, shotStatus});
    
    switch (shotStatus) {
        case 'past': 
            this.changeTurn(); break;
        case 'finish': 
            this.state = 'end'; 
            this.user1.clearGame();
            this.user2.clearGame();
            this.user1.socket.state = 'waitStartGame';
            this.user2.socket.state = 'waitStartGame';
            break;
        default: break;
    }
    
    return [shotStatus === 'finish', this.id];
}

module.exports = Game;