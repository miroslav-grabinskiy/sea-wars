"use strict";

const _ = require('lodash');

const libs = require('./libs'),
	config = require('./config');

const COLNAMES = config.COLNAMES,
	ROWNAMES = config.ROWNAMES,
	BFLENGTH = config.BFLENGTH,
	ships = config.ships,
	DEFAULTINDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const Autofill = function(battlefield) {
	this._COLNAMES = COLNAMES;
	this._ROWNAMES = ROWNAMES;
	this._BFLENGTH = BFLENGTH;
	this._ships = ships;
	
	this.battlefield = battlefield;
}


Autofill.prototype.fill = function fill() {
	this._ships.forEach( shipLength => {
		this._placeShip(shipLength);
	});
}

Autofill.prototype._placeShip = function placeShip(shipLength) {
	let isPlaced = false;
	let indexes = _.clone(DEFAULTINDEXES);
	let route = libs.getRandomInt(0, 1) ? 'horizontal' : 'vertical';
	
	while (!isPlaced) {
		const randomIndex = libs.getRandomInt(0, indexes.length - 1);
		let lineIndex = indexes[randomIndex];
		
		if ( this._getMaxEmptyLineTogetherCount(route, lineIndex) >= shipLength ) {
			const lineIndex2 = this._getFirstPlacedField(shipLength, route, lineIndex);
			
			this._place(shipLength, route, lineIndex, lineIndex2);
			isPlaced = true;
		} else {
			indexes.splice(randomIndex, 1);
			
			if (indexes.length === 0) {
				route = route === 'vertical' ? 'horizontal' : 'vertical';
				indexes = _.clone(DEFAULTINDEXES);;
			}
		}
	}
}

Autofill.prototype._place = function place(shipLength, route, lineIndex, lineIndex2) {
	const shipFieldsIndexes = [];
	let shipFields;
	
	switch (route) {
		case 'horizontal': 
			for (let i = lineIndex2, end = lineIndex2 + shipLength; i < end; i++) {
				shipFieldsIndexes.push([lineIndex, i]);
			}
			break;
		case 'vertical': 
			for (let i = lineIndex2, end = lineIndex2 + shipLength; i < end; i++) {
				shipFieldsIndexes.push([i, lineIndex]);
			}
			break;
	}
	
	shipFields = shipFieldsIndexes.map( ([index1, index2]) => {
		return this.battlefield.getFieldByIndexes(index1, index2);
	});
	
	shipFieldsIndexes.forEach( ([index1, index2]) => this._setShipPart(index1, index2, shipFields) );
}

Autofill.prototype._setShipPart = function setShipPart(index1, index2, shipFields) {
	const field = this.battlefield.getFieldByIndexes(index1, index2);
	
    //remove this field from all ship
    shipFields = shipFields.reduce( (acc, shipField) => {
        if (field !== shipField) {
            acc.push(shipField);
        }
        
        return acc;
    }, [])
    
	field.emptyForShip = false;
	field.ship = shipFields;
	field.placing = true;
	
	const nearFields = this.battlefield.getNearFields(index1, index2);
	
	nearFields.forEach( field => field.emptyForShip = false );
}

Autofill.prototype._getFirstPlacedField = function getFirstPlacedField(shipLength, route, lineIndex) {
	let openedPlaces;
	const possibleFirstPlacesIndexes = [];
	
	switch (route) {
		case 'horizontal':
			const rowName = this.battlefield.getRowName(lineIndex);
			openedPlaces = this.battlefield.getRow(rowName).map( item => {
				return item.emptyForShip;
			});
			break;
		case 'vertical': 
			openedPlaces = this.battlefield.getRows().map( rowName => {
				return this.battlefield.getField( rowName, this.battlefield.getColName(lineIndex) ).emptyForShip;
			});
			break;
	}
	
	openedPlaces.forEach( (isOpened, index) => {
		if (!isOpened) return;
		
		if (index + shipLength > BFLENGTH) return;
		
		if ( openedPlaces.slice(index, index + shipLength).every(item => item) ) {
			possibleFirstPlacesIndexes.push(index);
		}
	});
	
	const firstField = possibleFirstPlacesIndexes[ libs.getRandomInt(0, possibleFirstPlacesIndexes.length - 1) ];
	
	return firstField;
}

Autofill.prototype._getMaxEmptyLineTogetherCount = function getMaxEmptyLineTogetherCount(route, lineIndex) {
	let maxEmptyCount = 0;
	
	switch (route) {
		case 'horizontal':
			const rowName = this.battlefield.getRowName(lineIndex);
			this.battlefield.getRow(rowName).reduce( (acc, item) => {
				if (item.emptyForShip) {
					acc++;
					if (acc > maxEmptyCount) maxEmptyCount = acc;
					return acc;
				} else {
					return 0;
				}

			}, 0);
			break;
		case 'vertical':
			this.battlefield.getRows().reduce( (acc, rowName) => {
				if (this.battlefield.getField(rowName, this.battlefield.getColName(lineIndex) ).emptyForShip) {
					acc++;
					if (acc > maxEmptyCount) maxEmptyCount = acc;
					return acc;
				} else {
					return 0;
				}
			}, 0);
			break;
	}
	
	return maxEmptyCount;
}

module.exports = Autofill;