var socket = io.connect('http://localhost:3000');
	socket.on('authorized', function (data) {
		console.log('authorized', data);
	});
	
	socket.on('err', function (data) { 
		console.log('err', data);
	});
	
	socket.on('start game', function (data) {
		console.log('start game', data);
		
		print(data.battlefield);
		console.log('___');
		printOpponent(data.opponentBattlefield);
		
		function print(data) {
			Object.keys(data).map(rowName => data[rowName])
				.map( row => row.map( f => f.placing? f.wounded ? f.killed ? 'x' : '+' : 'o' : f.shoted ? '*' : '-') )
				.forEach(row => console.log(row.join(' ')));
		}
		function printOpponent(data) {
			Object.keys(data).map(rowName => data[rowName])
				.map( row => row.map( f => f.shoted ? f.wounded ? f.killed ? 'x' : '+' : '*' : '-') )
				.forEach(row => console.log(row.join(' ')));
		}
	});
	
	socket.on('shot', function (data) {
		console.log('shot', data);
	});
	
	/*
    socket.emit('authorize', { login: 'mirko' });
    socket.emit('create game', {});
    socket.emit('shot', { rowName: 'a', colName: 5 });
	*/