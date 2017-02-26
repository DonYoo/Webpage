var net = require('net');
var colors = require('colors');
var foo = require('./employeeModule.js');

// Keep track of client connections
var clients = [];

var server = net.createServer(
	function(socket){
		console.log("Client connection...".red);
		socket.write("Hello from server");
		clients.push(socket);

		socket.on('end', function(){
			console.log("Client disconnected...".red);
			// remove socket from list of clients
			var index = clients.indexOf(socket);
			if (index != -1) {
				clients.splice(index, 1);
			}
		});

		socket.on('data', function(data){
			var string_data = data.toString();
			console.log("...Received: ", string_data.green);
			// Split a string into an array of substring
			var argument = string_data.split(" ");
			command = argument[0];
			name1 = argument[1];
			name2 = argument[2];

			// Parsing the command
			if(command=="lookupByLastName"){
				try{
					socket.write(JSON.stringify(foo.lookupByLastName(name1)));
				}
				catch(error){
					socket.write(error.message);
				}
			}
			else if(command=="addEmployee"){
				try{
					socket.write(JSON.stringify(foo.addEmployee(name1, name2)));
				}
				catch(error){
					socket.write(error.message);
				}
			}
			else if(command=="lookupById"){
				try{
					socket.write(JSON.stringify(foo.lookupById(name1)));
				}
				catch(error){
					socket.write(error.message);
				}
			}
			else{
				socket.write("Invalid request");
			}
		});
	});

server.listen(3000, function() {
	console.log("Listening for connections");
});