const mongoose = require('mongoose');

mongoose.connect("URL")
// mongoose.connect(process.env.URL)

const plm = require('passport-local-mongoose');
 
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    }
  ],
})

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema)