"use strict";

const libs = require('./libs'),
      Game = require('./game');

const games = new Map(),
      GAMEIDLENGTH = 20;

let	waitGame = null;
	
const waitGameExist = () => !!waitGame;

const createGame = (user) => {
	if ( !waitGameExist() ) {
        waitGame = {
            user
        };
    } else {
        const gameId = libs.getRandomString(GAMEIDLENGTH);
        const game = new Game(gameId, waitGame.user, user);
        waitGame = null;
        games.set(gameId, game);
        game.start();
    }
}

const finishGame = (gameId) => {
    games.delete(gameId);
}

module.exports = {
    createGame,
    finishGame
};