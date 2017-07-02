//Dependencies
var express    = require("express");
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");

// Requiring Note and Article models
var Note    = require("./models/Note.js");
var Article = require("./models/Article.js");


//Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Requiring Note and Article models
// var Note    = require("./models/Note.js");
// var Article = require("./models/Article.js");

var app = express();

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/week18Homework");
var db = mongoose.connection;


//show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ",error);
});// end of on("error", )

//Once logged in to the dbthrough mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.");
		// db.dropDatabase(function (err) {
			// console.log('db dropped');
			//process.exit(0);
	    // });// end of dropDatabase
}); // end of once()

//Routes
//======
//A get request to scrap the website http://jamesclear.com/articles
app.get("/scrape", function(req, res) {
	request("http://www.jamesclear.com/articles", function(error, response, html) {
		var $ = cheerio.load(html);
		$(".archive-link").each(function(i, element) {
			var result = {};
			result.title = $(this).text();
			result.link  = $(this).attr("href"); 

			//Using Article model to create a new entry.
			//This effectively passes the result object - title and linke - to the entry.
			var entry = new Article(result);

			//Now, save that entry to the db
			entry.save(function(err, doc) {
				if(err) console.log(err);
				else console.log(doc);
			});// end of .save

		});// end of each
	});// end of request
	res.send("Scrape is Completed!");
});// end of get - scrape

//This will get the articles we scraped from monogoDB
app.get("/articles", function(req, res) {
	Article.find({}, function(error, doc) {
		if(error) console.log(error);
		else res.json(doc);
	});// end of Article
});// end of get

//Grab an article by its ObjectId
app.get("/articles/:id", function(req, res) {
	Article.findOne({"_id":req.params.id}).populate("note").exec(function(error, doc) {
		if (error) console.log(error);
		else res.json(doc);
	});// end of exec
});//end of get

// Create a new note or replace an existing note
app.post("/article/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});





app.listen(3000, function() {
	console.log("App is running on port 3000!");
});// end of listen

