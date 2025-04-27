const mongoose = require("mongoose")

const voterSchema = new mongoose.Schema({
  name: String,
  Type: String,
  email: String,
  secretId: String,
})

module.exports = mongoose.model("Voter", voterSchema)
