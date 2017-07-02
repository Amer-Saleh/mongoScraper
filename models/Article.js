var mongoose = require("mongoose");
//Create schema class
var Schema = mongoose.Schema;

//Create article schema
var ArticleSchema = new Schema({
	title: {
		type: String,
		unique: true,
		required: true
	},
	link: {
		type: String,
		required: false
	},
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	}

});// end of ArticaleSchema

// Create a model called Article with with ArticaleSchema characteristics.
var Article = mongoose.model("Article", ArticleSchema);

//Export the model
module.exports = Article;