const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: String });
const Model = mongoose.model("Test", schema);
console.log(typeof Model.insertOne);
console.log(typeof Model.create);
