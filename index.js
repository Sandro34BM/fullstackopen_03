require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", function getId(req) {
	return JSON.stringify(req.body);
});

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(cors());

app.get("/info", (request, response, next) => {
	const date = new Date();

	Person.find({})
		.then((result) => {
			response.send(
				`<p>Phonebook has info for ${result.length} people</p> <p>${date}</p>`
			);
		})
		.catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
	Person.find({})
		.then((result) => {
			response.json(result);
		})
		.catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then((result) => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const person = {
		name: request.body.name,
		number: request.body.number,
	};

	Person.findByIdAndUpdate(request.params.id, person, {
		new: true,
		runValidators: true,
	})
		.then((updatedPerson) => {
			console.log(`added ${person.name} number ${person.number} to phonebook`);
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
	const person = new Person({
		name: request.body.name,
		number: request.body.number,
	});

	person
		.save()
		.then((savedPerson) => {
			console.log(`added ${person.name} number ${person.number} to phonebook`);
			response.json(savedPerson);
		})
		.catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response
			.status(400)
			.send({ error: `Wrong format - ${error.message}` });
	} else if (error.name === "ValidationError") {
		return response
			.status(400)
			.send({ error: `Validation error - ${error.message}` });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
