"use strict";

const randomstring = require('randomstring');

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomString = (len) => randomstring.generate({
    length: len,
    charset: 'alphabetic'
});

module.exports = {
	getRandomInt,
    getRandomString
};