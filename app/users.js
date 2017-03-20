"use strict";

const libs = require('./libs'),
      User = require('./user');

const users = new Map(),
	USERIDLENGTH = 16;

const existUser = (userId) => {
	return users.has(userId);
};

const createUser = (socket, login = 'unnamed') => {
	let userId;
	
	do {
		userId = libs.getRandomString(USERIDLENGTH);
	} while ( existUser(userId) );
	
	const user = new User(socket, userId, login);
	users.set(userId, user);
	
	return user;
}

const validateUserLogin = (login) => {
	return (typeof login === 'string' && login.length < 50);
}

const validateUserId = (id) => {
	return (typeof id === 'string' && id.length === USERIDLENGTH);
}

const getUser = (id) => {
	return users.get(id);
}

module.exports = {
	existUser,
	createUser,
	validateUserId,
    getUser
};