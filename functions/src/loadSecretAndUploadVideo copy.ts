import assert from "assert";
import * as functions from "firebase-functions";
import fs from "fs";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { google } from "googleapis";
import readline from "readline";

const OAuth2 = google.auth.OAuth2;

const categoryIds = {
  Entertainment: "24",
  Education: "27",
  ScienceTechnology: "28",
};

const SECRET_PATH = `${__dirname}/../client_secret.json`;
const TOKEN_PATH = `${__dirname}/../client_oauth_token.json`;

// If modifying these scopes,
// delete your previously saved credentials in client_secret.json
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

const videoFilePath = `${__dirname}/../tmp/output.mp4`;
const thumbFilePath = `${__dirname}/../tmp/image.jpg`;

interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
}

export const loadSecretAndUploadVideo = functions.https.onCall(
  (data: VideoMetadata) => {
    console.log("starting...");
    const { title, description, tags } = data;
    assert(fs.existsSync(videoFilePath));
    assert(fs.existsSync(thumbFilePath));

    // Load client secrets from a local file.
    fs.readFile(SECRET_PATH, function processClientSecrets(err, content) {
      if (err) {
        console.log("Error loading client secret file: " + err);
        return;
      }
      // Authorize a client with the loaded credentials,
      // then call the YouTube API.
      authorize(JSON.parse(String(content)), (auth: GoogleAuth<JSONClient>) =>
        uploadToYoutube(auth, title, description, tags)
      );
    });
    console.log("ending...");
  }
);

const uploadToYoutube = async (
  auth: GoogleAuth<JSONClient>,
  title: string,
  description: string,
  tags: string[]
) => {
  console.log("inside upload to Youtube");
  const youtube = google.youtube("v3");

  console.log("before inserting");
  console.log("auth", auth);
  youtube.videos.insert(
    {
      auth,
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: categoryIds.ScienceTechnology,
          defaultLanguage: "en",
          defaultAudioLanguage: "en",
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      },
    },
    (err, response) => {
      if (err) {
        console.log("The insert API returned an error : " + err);
        return;
      }
      console.log(response?.data);

      console.log("Video uploaded. Uploading the thumbnail now.");
      youtube.thumbnails.set(
        {
          auth: auth,
          videoId: response?.data.id || "",
          media: {
            body: fs.createReadStream(thumbFilePath),
          },
        },
        (err, response) => {
          if (err) {
            console.log("The set API returned an error: " + err);
            return;
          }
          console.log(response?.data);
        }
      );
    }
  );
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials, callback) => {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectUrl = credentials.web.redirect_uris[0];

  console.log("clientId", clientId);
  console.log("clientSecret", clientSecret);
  console.log("redirectUrl", redirectUrl);

  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  console.log("oauth2Client", oauth2Client);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    console.log("read token");
    if (err) {
      console.log("error reading token");
      getNewToken(oauth2Client, callback);
    } else {
      console.log("no error reading token");
      console.log("token", token);
      console.log("1111");
      // token is buffer <Buffer 7b 0a 20 20 ... /> =>
      // turn it to json string

      const json = JSON.parse(String(token));
      console.log("json", json);
      oauth2Client.credentials = json;
      console.log("2222");
      console.log("oauth2Client.credentials", oauth2Client.credentials);

      callback(oauth2Client);
    }
  });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = (oauth2Client, callback) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  console.log("before create interface");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("before question");
  rl.question("Enter the code from that page here: ", (code) => {
    console.log("1");
    rl.close();
    console.log("2");
    oauth2Client.getToken(code, (err, token) => {
      console.log("3");
      if (err) {
        console.log("4");
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      console.log("5");
      oauth2Client.credentials = token;
      console.log("before store token");
      console.log("6");
      storeToken(token);
      callback(oauth2Client);
    });
  });
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = (token) => {
  console.log("7");
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    console.log("8");
    if (err) {
      console.log("error storing token");
      throw err;
    }
    console.log("Token stored to " + TOKEN_PATH);
  });
};
