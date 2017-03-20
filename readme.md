# how start

1. install npm (current 3.10.9), node.js (current 6.9.2)
2. run "npm install" in app directory
3. run "node app.js" in app directory


## Structure

```
front/			example how use in front
app/			app
```

### events client -> server

`authorize` 
data: 
```
{
	"login": String, 
	"userId": String
}
```
login.length must be < 50 chars

if dont send userId - create new User,
if send userId - authorize user


`"create game"`
data: `null`

(need authorized)

`"shoot"`
data: 
```
 {
	rowName: String, 
	colName: String
}
```
rowName must be [a-j], colName [0-9]

create or connect to exist game


### events server -> client

"authorized", data: {"login": String, "userId": String}

`"start game"`
 data: 
```
{
	battlefield: Object,
	opponentBattlefield: Object,
	opponent: String (login),
	turn: Boolean (your turn or opponent)
}
```

example Battlefield
```
{
	"a": [
		0: {
			emptyForShip: Boolean, (only for self battlefield)
			placing: Boolean, (only for self battlefield)
			shoted: Boolean, 
			killed: Boolean or null,
			ship: Boolean or null, (only for self battlefield) //sorry, now this field is null always
			wounded: Boolean or null
		},
		1,
		
		...
		
		9
	],
		
	...
	
	"j"
}
```

`"shot"`
data: 
```
{
	shotStatus: Boolean, ('past', 'wound', 'kill', 'finish')
	coords: {
		rowName: String,
		colName: String
	}
}
```

game end when shotStatus === 'finish'

`"error"` 
data: 
```
{
	"message": String
}
```

custom error events


## logic

1. socket connect
2. emit client -> server event "authorize";
3. wait server -> client event "authorized"
4. emit client -> server event "create game"
5. wait server -> client event "start game"
6. emit client -> server event "shoot"
7. wait server -> client event "shot"
