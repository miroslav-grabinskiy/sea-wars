"use strict";

const server = require('http').createServer(),
	io = require('socket.io')(server);

const games = require('./games'),
      users = require('./users');
	  
io.on('connection', function(socket){
	socket.state = 'needAuthorize';
	
	socket.on('authorize', function(data) {
		if (socket.state !== 'needAuthorize') {
			return socket.emit('err', {message: 'you already authorized'});
		}
		
		if ( data.hasOwnProperty('userId') && data.userId ) {
			if ( !users.validateUserId(data.userId) ) {
				return socket.emit('err', {message: 'incorrect id'});
			}
			
			if ( !users.existUser(data.userId) ) {
				return socket.emit('err', {message: 'user not found'})
			}
            
			const user = users.getUser(data.userId);
            const successAuthorize = user.authorize(socket);
			
            if (!successAuthorize) {
				return socket.emit('err', {message: 'user already authorized'})
            } else {
                socket.user = user;
                socket.state = 'waitStartGame';
            }
			
            socket.state = 'waitStartGame';
			socket.emit( 'authorized', {user: socket.user.getFullInfo()} );
		} else {
            socket.user = users.createUser(socket, data.login);
            socket.state = 'waitStartGame';
			socket.emit( 'authorized', {user: socket.user.getFullInfo()} );
        }
	})
	
	socket.on('create game', function(data){
		if (socket.state !== 'waitStartGame') {
            if (socket.state === 'game') {
                return socket.emit('err', {message: 'game already started'});
            }
            if (socket.state === 'needAuthorize') {
                return socket.emit('err', {message: 'needAuthorize'});
            }
		}
		
		socket.game = socket.user.getGame();

		if ( !socket.game ) {
			games.createGame(socket.user);
		} else {
			socket.emit('start game', socket.user.getGame().getStartInfo(socket.user.id))
		}
        
        socket.state = 'game';
	});
	
	socket.on('shoot', function(data) {
        if (socket.state !== 'game') {
			return socket.emit('err', {message: 'not game now'});
		}
		
        if ( !socket.user.getGame().checkTurn(socket.user.id) ) {
            return socket.emit('err', {message: 'not your turn'});
        }
        
        if ( !socket.user.getGame().validateCoordinates(data) ) {
            return socket.emit('err', {message: 'invalid coordinates'});
        }
        
        const [finish, gameId] = socket.user.getGame().shoot(socket.user.id, data);
        
        if (finish) {
            games.finishGame(gameId);
        }
	});
	
	socket.on('disconnect', function() {
        if (socket.user)  socket.user.unAuthorize();
		console.log('bye');
	});
});
server.listen(3000);
console.log('start')