const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SocialMediaData = new Schema({
 platform: { type: String, required: true },
 page: { type: String, required: true },
 longLivedToken: { type: String, required: true },
 tokenExpiration: { type: Number, required: true },
 pageAccessToken: { type: String, required: true },
 pageId: { type: String, required: true },
});

module.exports = mongoose.model("SocialMedia", SocialMediaData);
