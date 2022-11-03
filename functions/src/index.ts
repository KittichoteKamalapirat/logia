import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import * as functions from "firebase-functions";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const randomNumber = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  const randomNum = Math.round(Math.random() * 100);
  response.send(String(randomNum));
});

export const sayHello = functions.https.onCall((data, context) => {
  console.log("data", data);
  console.log("ok");

  return "Hello from callable";
});

export * from "./generateVid";
export * from "./loadSecretAndUploadVideo";
