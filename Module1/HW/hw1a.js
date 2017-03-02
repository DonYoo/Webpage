
var foo = require('./employeeModule.js');
var colors = require('colors');

console.log("\nLookup by last name (Smith)".red);
console.log(foo.lookupByLastName('Smith'));
console.log("\nAdding employee Willioam Smith".red);
foo.addEmployee('William', 'Smith');
console.log("\nLookup by last name (Smith)".red);
console.log(foo.lookupByLastName('Smith'));
console.log("\nLookup by id (2)".red);
var testing = foo.lookupById(2);
console.log(testing);
console.log("\nChanging first name...".red);
testing.firstName = 'Mary';
console.log("\nLookup by id (2)".red);
console.log(foo.lookupById(2));
console.log("\nLookup by last name (Smith)".red);
console.log(foo.lookupByLastName('Smith'));


/*
console.log("\n***Extra for prevent the variables from the user***\n".bgGreen)
var don = require('./employeeFixedModule.js');

console.log("\nLookup by id (2)".green);
var testing = don.lookupById(2);
console.log(testing);
console.log("\nChanging first name...".green);
try
{
    testing.firstName = 'Mary';
}
catch(err){
    console.log(err.message.red, err.name.red);;
}

console.log("\nLookup by id (2)".green);
console.log(don.lookupById(2));
*/