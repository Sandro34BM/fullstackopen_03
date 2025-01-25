const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("connecting to ", url);

mongoose.set("strictQuery", false);

mongoose
	.connect(url)
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: [3, 'Minimum name length is 3'],
		required: [true, 'Name is required'],
	},
	number: {
		type: String,
		minLength: [8, 'Minimum phone number length is 8'],
		required: [true, 'Phone number is required'],
		validate: {
			validator: function (v) {
				return /([0-9]{2,3}-[0-9]{1,})/.test(v);
			},
            message: props => `${props.value} is not a valid phone number!`
		},
	},
});

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model("Person", personSchema);
