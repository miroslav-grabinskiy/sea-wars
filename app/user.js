"use strict";

const Battlefield = require('./battlefield');

const User = function(socket, id, login) {
	this.socket = socket;
	this.login = login;
	this.id = id;
	this.game = null;
};

User.prototype.setGame = function setGame(game) {
	this.game = game;
}

User.prototype.getGame = function getGame() {
	return this.game;
}

User.prototype.clearGame = function clearGame() {
	this.game = null;
}

User.prototype.startGame = function startGame() {
    const gameInfo = this.game.getStartInfo(this.id);
    this.socket.emit('start game', gameInfo);
}

User.prototype.getFullInfo = function getFullInfo() {
	return {
		login: this.login,
		id: this.id
	};
}

User.prototype.authorize = function authorize(socket) {
    if (this.socket === null) {
        this.socket = socket;
        return true;
    } 
}

User.prototype.unAuthorize = function unAuthorize() {
    this.socket = null;
}

User.prototype.getInfo = function getInfo() {
	return {
		login: this.login
	};
}

module.exports = User;