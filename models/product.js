var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var schema=new Schema({
	// imagePath:{type:String,require:true},
	// title:{type:String,require:true},
	// description:{type:String,require:true},
	// price:{type:String,require:true}
	imagePath:String,
	title:String,
	description:String,
	price:String
});
module.exports=mongoose.model("Product",schema);