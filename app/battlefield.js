"use strict";

const _ = require('lodash');

const Autofill = require('./autofill'),
	config = require('./config');

const COLNAMES = config.COLNAMES,
	ROWNAMES = config.ROWNAMES,
	BFLENGTH = config.BFLENGTH,
	ships = config.ships;
	
const genBattlefield = () => {
	const battlefield = {};
	
	ROWNAMES.forEach( rowName => {
		battlefield[rowName] = [];
		
		COLNAMES.forEach( colName => {
			battlefield[rowName][colName] = {
				shoted: false,
				ship: null,
				placing: false,
                killed: null,
                wounded: null,
				emptyForShip: true
			};
		});
	});
	
	return battlefield;
}

const Battlefield = function() {
	this._COLNAMES = COLNAMES;
	this._ROWNAMES = ROWNAMES;
	this._BFLENGTH = BFLENGTH;
	this._ships = ships;
	this._shipsToWin = this._ships.length;
	
	this.battlefield = genBattlefield();
	
	new Autofill(this).fill();
}

Battlefield.prototype.getColName = function getColName(index) {
	return this._COLNAMES[index];
}

Battlefield.prototype.getRowName = function getRowName(index) {
	return this._ROWNAMES[index];
}

Battlefield.prototype.getRow = function getRow(rowName) {
	return this.battlefield[rowName];
}

Battlefield.prototype.getRows = function getRows() {
	return Object.keys(this.battlefield);
}
Battlefield.prototype.colExist = function colExist(colName) {
	return this._COLNAMES.includes(colName);
}

Battlefield.prototype.rowExist = function rowExist(rowName) {
	return this._ROWNAMES.includes(rowName);
}

Battlefield.prototype.getFieldByIndexes = function getFieldByIndexes(index1, index2) {
	return this.getField( this.getRowName(index1), this.getColName(index2) );
}


Battlefield.prototype.getField = function getField(rowName, colName) {
	return this.battlefield[rowName][colName];
}

Battlefield.prototype.checkValidField = function validateField(rowName, colName) {
    if ( 
        typeof rowName !== 'string' ||
        rowName.length !== 1 ||
        typeof colName !== 'number' ||
        isNaN(colName) ||
        !COLNAMES.includes(colName) || 
        !ROWNAMES.includes(rowName) 
    ) {
        return false;
    }
    
	return this.colExist(colName) && this.rowExist(rowName);
}

Battlefield.prototype.getNearFields = function getNearFields(index1, index2) {
    const nearFields = [];
	for (let i = index1 - 1, end = index1 + 1; i <= end; i++) {
		if (i === -1 || i === BFLENGTH) continue;
		
		for (let j = index2 - 1, end = index2 + 1; j <= end; j++) {
			if (j === -1 || j === BFLENGTH) continue;
            
			nearFields.push( this.getFieldByIndexes(i, j) );
		}
	}
    
    return nearFields;
}

Battlefield.prototype.shoot = function shoot(rowName, colName) {
	let shotStatus;
	
    const field = this.getField(rowName, colName);
    field.shoted = true;
    
	if (field.placing) {
        field.wounded = true;
        const nearFields = this.getNearFields( this._ROWNAMES.indexOf(rowName), this._COLNAMES.indexOf(colName) );
        
		if (field.ship.every(field => field.shoted)) {
			this._shipsToWin--;
            
            nearFields.forEach(field => field.shoted = true);
            
            field.ship.forEach(field => field.killed = true)
			
			shotStatus = this._shipsToWin === 0 ? 'finish' : 'kill';
		} else {
		  shotStatus = 'wound';
        }
	} else {
		shotStatus = 'past';
	}
	
	return shotStatus;
};

Battlefield.prototype.getBattlefield = function getBattlefield() {
    const clonedBattlefield = _.cloneDeep(this.battlefield);
    
    Object.keys(clonedBattlefield).forEach( rowName => {
        clonedBattlefield[rowName].forEach( field => field.ship = null );
    });
    
    return clonedBattlefield;
}

Battlefield.prototype.wasShooted = function shoot(rowName, colName) {
    const field = this.getField(rowName, colName) 
    
	return field.shoted;
};

Battlefield.prototype.getShooted = function shoot() {
    const clonedBattlefield = _.cloneDeep(this.battlefield);
    
    Object.keys(clonedBattlefield).forEach( rowName => {
        clonedBattlefield[rowName].forEach( field => {
            delete field.placing;
            delete field.ship;
            delete field.emptyForShip;
        });
    });
    
    return clonedBattlefield;
};

Battlefield.prototype.print = function print() {
	this.getRows()
		.map(rowName => this.getRow(rowName))
		.map( row => row.map( f => f.placing ? 'o' : '-') )
		.forEach(row => console.log(row.join(' ')));
}

//new Battlefield().print();

module.exports = Battlefield;