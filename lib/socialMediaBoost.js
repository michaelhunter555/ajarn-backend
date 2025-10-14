const dotenv = require("dotenv");
dotenv.config();
const Facebook = require("../models/SocialMedia");
const bcrypt = require("bcryptjs");
const { encryptData } = require("./encryption");
const { TwitterApi } = require("twitter-api-v2");

const PAGE_ID = "789126740954206";
    const x = new TwitterApi({
        appKey: process.env.X_API_KEY,
        appSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET,
    });

const createXTweet = async (jobInfo, applyLink) => {
    try {
        const tweet = await x.v2.tweet(
            `🚨🚨🚨 Teaching Job Alert
            ${jobInfo.title} - ${jobInfo.location}! ${jobInfo.salary}
            👉  Apply Here: ${applyLink}
            #teachingjobs #ajarn #${jobInfo.location.toLowerCase().replace(/\s+/g, '')}jobs #ajarnjobs`
        );
        console.log("✅ Tweet created: ", tweet);
    } catch(err) {
        console.log("❌ Error creating tweet: ", err);
    }
}



const createFacebookPost = async(jobInfo, applyLink, pageAccessToken) => {
    try {
        const pageId = PAGE_ID;

        const postData = {
            message: `🚨🚨🚨 Teaching Job Alert
      ${jobInfo.title} - ${jobInfo.location}! ${jobInfo.salary}
      👉 Apply Here: ${applyLink}
      #teachingjobs #ajarn #${jobInfo.location.toLowerCase().replace(/\s+/g, '')}jobs #ajarnjobs`,
            link: applyLink,
            published: true,
          };

        const res = await fetch(`https://graph.facebook.com/v23.0/${pageId}/feed?access_token=${pageAccessToken}`, {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { "Content-Type": "application/json" }
        })

        if(!res.ok) {
            const err = await res.json();
            throw new Error(`Error creating Facebook post:  ${res.status} - ${JSON.stringify(err)}`);
        }
        const data = await res.json();
        console.log("✅ Facebook post created:", data);
        return data;
    } catch (err) {
        console.error("❌ Facebook post error:", err.message);
        console.log(err);
    }
}

const facebookCallback = async(req, res, next) => {
    const { code } = req.query;
    if(!code) return res.status(400).json({ message: "No code provided" });

    try {
     const fbRes = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?` + new URLSearchParams({
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_SECRET,
        redirect_uri: `${process.env.FB_REDIRECT_URI}`, // must match
        code: code,
     }));

     if(!fbRes.ok) {
        throw new Error(`Error getting Facebook access token`);
     }

     const fbData = await fbRes.json()
     const shortLivedToken = fbData.access_token;

     const longTokenRes = await fetch(
        "https://graph.facebook.com/v23.0/oauth/access_token?" +
          new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_SECRET,
            fb_exchange_token: shortLivedToken,
          })
      );

      if(!longTokenRes.ok) {
        throw new Error(`Error getting long lived token`);
      }

      const longTokenData = await longTokenRes.json();
      const longToken = longTokenData.access_token;
      const expiresIn = longTokenData.expires_in;
      
      const pageRes = await fetch(
        `https://graph.facebook.com/v23.0/me/accounts?` +
        new URLSearchParams({
          access_token: longToken,
        })
      );

      if(!pageRes.ok) {
        throw new Error(`Error getting Facebook page access token`);
      }

      const pageData = await pageRes.json();
      const page = pageData.data.find((p) => p.id === PAGE_ID);

      if(!page) {
        throw new Error(`Facebook page not found`);
      }

      const pageAccessToken = page.access_token;
      const tokenExpiration = expiresIn ? new Date(Date.now() + expiresIn * 1000) : new Date(Date.now() + 60 * 60 * 24 * 60 * 1000);

      const encryptedLongToken = encryptData(longToken);
      const encryptedPageAccessToken = encryptData(pageAccessToken);
     
      const isExisting = await Facebook.findOne({ platform: 'Facebook' });
      if(isExisting) {
        await Facebook.findByIdAndUpdate(isExisting._id, {
          longLivedToken: encryptedLongToken,
          tokenExpiration: tokenExpiration,
          pageAccessToken: encryptedPageAccessToken,
        });
      } else {
        const fbToken = new Facebook({
          page: 'Ajarn Jobs',
          platform: 'Facebook',
          longLivedToken: encryptedLongToken,
          tokenExpiration: tokenExpiration,
          pageAccessToken: encryptedPageAccessToken,
          pageId: PAGE_ID,
        });
        await fbToken.save();
      }
      res.status(200).json({ message: "Facebook access token saved" });
    } catch (err) {
        console.log("[FB_CALLBACK] Error occurred:", err?.message);
        if (err?.stack) console.log("[FB_CALLBACK] Stack:", err.stack);
        res.status(500).json({ message: "Facebook access token save failed" });
    }
}

module.exports = {
    facebookCallback,
    createFacebookPost,
    createXTweet,
}
    