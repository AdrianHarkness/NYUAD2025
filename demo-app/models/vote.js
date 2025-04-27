const mongoose = require("mongoose")

const voteSchema = new mongoose.Schema({
  secretId: String,
  encryptedVote: String,
  timestamp: String,
})

module.exports = mongoose.model("Vote", voteSchema)
