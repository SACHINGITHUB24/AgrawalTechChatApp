

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://ChatAppData:CHATAPPDATA@chatappdata.ua6pnti.mongodb.net/?retryWrites=true&w=majority&appName=ChatAppData"); 


const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true }, 
  email: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  profilePic: { type: String, default: "" }
});



module.exports = mongoose.model("User", userSchema);
