const express = require('express');
const app = express();

// setup handlebars view engine
const handlebars = require('express-handlebars');

app.engine('handlebars', 
	handlebars({defaultLayout: 'main_logo'}));

app.set('view engine', 'handlebars');

// static resources
app.use(express.static(__dirname + '/public'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET request to the homepage
app.get('/', (req, res) => {
	res.render('home');
});

// Bring the employeeModule file
const employee = require('./employeeModule');

// get the employee data by Id in 3 different types
app.get('/id/:id', (req, res) => {
	var idList = employee.lookupById(req.params.id);

	res.format({
		'application/json': ()=> {
			res.json(idList);
		},
		'application/xml': () => {
			let idXml =
			'<?xml version="1.0?>\n'	 +
			 ' <employee id="' + idList.id + '">\n' +
				'<firstName>' + idList.firstName + '</firstName>\n' +
				'<lastName>' + idList.lastName + '</lastName>\n' +
		     '</employee>\n';

			res.type('application/xml');
			res.send(idXml);
		},
		'text/html':() => {
			res.render('employee', 
			{id: idList.id, 
			Fname: idList.firstName, 
			Lname: idList.lastName});
		},

		'default': () => {
			res.status(404);
			res.render(404);
		}
	});	
});

// get the employee data by Last Name in 3 different types
app.get('/lastName/:name', (req, res) => {
		var LastNameList = employee.lookupByLastName(req.params.name);

		res.format({
		'application/json': ()=> {
			res.json(employee.lookupByLastName(req.params.name));
		},

		'application/xml': () => {
			let idXml =
			'<?xml version="1.0?>\n<employees>\n'	 +
			LastNameList.map(function(c){
				return ' <employee id="' + c.id + '">\n' +
				'<firstName>' + c.firstName + '</firstName>\n' +
				'<lastName>' + c.lastName + '</lastName>\n' +
				'</employee>';
			}).join('\n') + '\n<employees>\n';

			res.type('application/xml');
			res.send(idXml);
		},
		'text/html':() => {
			res.render('employeeList', 
			{Lname: req.params.name,
			employeeList: LastNameList});
		},

		'default': () => {
			res.status(404);
			res.render(404);
		}
	});	
});

// addEmployee GET method. 
app.get('/addEmployee', (req, res) => {
	res.render('addEmployee');
});

// addEmployeee Post. 
app.post('/addEmployee', (req, res) => {
	employee.addEmployee(req.body.Fname, req.body.Lname);
	var LastNameList = employee.lookupByLastName(req.body.Lname);
	res.render('employeeList', 
	{Lname: req.body.Lname,
	employeeList: LastNameList});
});

app.use((req, res) => {
	res.type('text/html');
	res.status(404);
	res.render('404');
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});