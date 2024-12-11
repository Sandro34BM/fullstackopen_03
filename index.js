const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require('cors')

app.use(express.json());
app.use(express.static('dist'))

morgan.token("body", function getId(req) {
	return JSON.stringify(req.body);
});

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(cors());

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

const generateId = () => {
	return Math.floor(Math.random() * 1000000000);
};

const validatePerson = (person) => {
	let errors = [];

	if (!person.name) {
		errors = errors.concat("Missing 'name' property");
	}
	if (!person.number) {
		errors = errors.concat("Missing 'number' property");
	}
	if (persons.find((p) => p.name === person.name)) {
		errors = errors.concat("Property 'name' must be unique");
	}

	return errors;
};

app.get("/info", (request, response) => {
	const date = new Date();

	response.send(
		`<p>Phonebook has info for ${persons.length} people</p> <p>${date}</p>`
	);
});

app.get("/api/persons", (request, response) => {
	response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
	const personId = Number(request.params.id);
	const person = persons.find((person) => person.id === personId);

	if (!person) {
		return response.status(404).json({
			error: "Person not found",
		});
	}

	response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
	const personId = Number(request.params.id);
	persons = persons.filter((person) => person.id !== personId);

	response.status(204).end();
});

app.post("/api/persons", (request, response) => {
	const errors = validatePerson(request.body);

	if (errors.length > 0) {
		return response.status(400).json({ errors: errors });
	}

	const person = {
		id: generateId(),
		name: request.body.name,
		number: request.body.number,
	};

	persons = persons.concat(person);
	response.json(person);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
