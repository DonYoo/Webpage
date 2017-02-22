
var _ = require('underscore');

/*
underscore function

findWhere:  _.findWhere(
    where:  _.where(
    pluck:  _.pluck(data, 'firstName')
      max:  _.max( array )      _.max([10,20,30])
*/
var data = [
    { id: 1, firstName: 'John', lastName: 'Smith' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'John', lastName: 'Doe' },
    ];


var data = { };

Object.defineProperty(data, 'secret', {
    value: 42,
    writable : false,
    enumerable : true,
});

data.secret = 2;

console.log(data);
module.exports = {
    lookupById: function (id) {
        //findWhere : Looks through the list and returns the first value that matches all of the key-value pairs listed in properties.
        var employee = _.findWhere(data, {id: id});
        return (employee == null) ? undefined : employee;
    },

    lookupByLastName: function (LastName) {
        var employeeList = new Array();
        for(var i = 0; i<data.length; i++)
        {
            if(data[i].lastName == LastName) {
                // push add to the array.
                var holy = data[i];
                employeeList.push(holy);
            }
        }
        return employeeList;
    },

    addEmployee: function (firstName, lastName) {
        // the id value should be calculated as one more than max id.
        var newData = { id: data.length + 1, firstName: firstName, lastName: lastName};
        data.push(newData);
    }
};
