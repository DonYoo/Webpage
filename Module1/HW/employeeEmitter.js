var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var _ = require('underscore');

// Custom class 
function EmployeeEmitter(args) {
	this.data = args;
	EventEmitter.call(this);
}
inherits(EmployeeEmitter, EventEmitter);

// Sample member function that raises an event
EmployeeEmitter.prototype.lookupById = function (pid) {

	this.emit('lookupById', pid);
	// rest of code
	var employee = _.findWhere(this.data, { id: pid });
	return (employee == null) ? undefined : employee;
};

EmployeeEmitter.prototype.lookupByLastName = function (LastName) {
	this.emit('lookupByLastName', LastName);

	var originData = this.data;
	var employeeList = new Array();
	for (var i = 0; i < originData.length; i++) {
		if (originData[i].lastName == LastName) {
			// push add to the array.
			employeeList.push(originData[i]);
		}
	}
	return employeeList;
};

EmployeeEmitter.prototype.addEmployee = function (firstName, lastName) {
	this.emit('addEmployee', firstName, lastName);
	var originData = this.data;
	var newData = { id: originData.length + 1, firstName: firstName, lastName: lastName };
	originData.push(newData);
}

module.exports.EmployeeEmitter = EmployeeEmitter;

