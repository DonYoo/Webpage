var colors = require('colors');

var EmployeeEmitter = require('./employeeEmitter').EmployeeEmitter;

// Usage
var data = [
  {id:1, firstName:'John',lastName:'Smith'},
  {id:2, firstName:'Jane',lastName:'Smith'},
  {id:3, firstName:'John',lastName:'Doe'}
 ];

var employees = new EmployeeEmitter(data);

employees.on('lookupById', function (args) {
    console.log('Event lookupById raised!'.blue, args, '\n');
});
employees.on('lookupByLastName', function (args) {
    console.log('Event lookupByLastName raised!'.blue, args, '\n');
});
employees.on('addEmployee', function (firstName, lastName) {
    console.log('Event addEmployee raised!'.blue, firstName, lastName, '\n');
});

console.log("\nLookup by last name (Smith)".red);
console.log(employees.lookupByLastName('Smith'));

console.log("\nAdding employee William Smith".red);
employees.addEmployee('William', 'Smith');

console.log("\nLookup by last name (Smith)".red);
console.log(employees.lookupByLastName('Smith'));

console.log("\nLookup by id (2)".red);
console.log(employees.lookupById(2));
