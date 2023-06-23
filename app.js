const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

// MODELS
const Schema = mongoose.Schema;

// Schema - describes and enforces the structure of the documents
const bookSchema = new Schema({
  title: String,
  year: Number,
  description: { type: String, maxlength: 1000 },
  quantity: { type: Number, min: 0, default: 0 },
  lastPublished: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author" // "Author" is the model to which we are creating a reference relationship
  }  
});

// model() - Defines a model (Book) and creates a 'books' collection in MongoDB
// Collection name will default to the lowercased, plural form of the model name:
//                          "Book" --> "books"
const Book = mongoose.model("Book", bookSchema);

const AuthorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  bio: String,
});

const Author = mongoose.model("Author", AuthorSchema);

mongoose
  .connect("mongodb://127.0.0.1:27017/mongoose-intro-dev")
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => console.error("Error connecting to mongo", err));

const app = express();

// MIDDLEWARE
app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.json());

// ROUTES
// const cities = ["Miami", "Madrid", "Barcelona"];

// app.get("/city-list", (req, res) => {
//   res.json({ cities: cities });
// });

//  POST  /books - Creates a new book in the database
app.post("/books", (req, res) => {
  // req.body contains the data sent by the client. 
  // This must match the structure defined in our Book schema.
  
  Book.create({
  	title: req.body.title,
    year: req.body.year,
    description: req.body.description,
    quantity: req.body.quantity,
    author: req.body.author,
  })
    .then((createdBook) => {
    	console.log("Book created ->", createdBook);
    	res.status(201).send(createdBook);
  })
    .catch((error) => {
      console.error("Error while creating the book ->", error);
      res.status(500).send({ error: "Failed to create the book" });
    });
});

//  GET  /books - Retrieve all books from the database
app.get("/books", (req, res) => {
  Book.find({})
    .populate("author")
    .then((books) => {
      console.log("Retrieved books ->", books);
    
      res.status(200).send(books);
    })
    .catch((error) => {
      console.error("Error while retrieving books ->", error);
      res.status(500).send({ error: "Failed to retrieve books" });
    });
});

//  PUT  /books/:id - Update a specific book by its id
app.put("/books/:id", (req, res) => {
  const bookId = req.params.id;
 
  Book.findByIdAndUpdate(bookId, req.body, { new: true })
    .then((updatedBook) => {
      console.log("Updated book ->", updatedBook);    
    
      res.status(200).send(updatedBook);
    })
    .catch((error) => {
      console.error("Error while updating the book ->", error);
      res.status(500).send({ error: "Failed to update the book" });
    });
});


//  DELETE  /books/:id - Delete a book by its id
app.delete("/books/:id", (req, res) => {
  Book.findByIdAndDelete(req.params.id)
    .then((result) => {
      console.log("Book deleted!")
    	res.status(200).send({ message: "Book deleted successfully" })
  	})
    .catch((error) => {
      console.error("Error while deleting the book ->", error);    
    	res.status(500).send({error: "Deleting book failed"})
  	});
});

//  POST  /authors - Create a new author
app.post('/authors', (req, res) => {
	Author.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio
  })
  .then((createdAuthor) => {
  	console.log("Author added ->", createdAuthor);
  
    res.status(201).send(createdAuthor);
  })
  .catch((error) => {
    console.error("Error while creating the author ->", error);
    res.status(500).send({ error: "Failed to create the author" });
  });
});

app.listen(3000, () => console.log("App listening on port 3000!"));
