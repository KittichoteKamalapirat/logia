import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import axios from "axios";
import * as functions from "firebase-functions";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { getAudioDurationInSeconds } from "get-audio-duration";

ffmpeg.setFfmpegPath(ffmpegPath.path);

interface GenerateVidInput {
  imgUrl: string;
  audUrl: string;
  durationHr: string;
}

export const generateVid = functions.https.onCall(
  async (data: GenerateVidInput, context) => {
    const { imgUrl, audUrl, durationHr } = data;
    console.log("imgUrl", imgUrl);
    console.log("audUrl", audUrl);
    console.log("durationHr", durationHr);
    try {
      const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });

      const imgBuffer = Buffer.from(imgRes.data, "binary");
      const imgFilePath = `${__dirname}/../tmp/image.jpg`;
      fs.writeFileSync(imgFilePath, imgBuffer);

      const audRes = await axios.get(audUrl, { responseType: "arraybuffer" });
      const audBuffer = Buffer.from(audRes.data, "binary");
      const audFilePath = `${__dirname}/../tmp/audio.mp3`;
      fs.writeFileSync(audFilePath, audBuffer);

      console.log("aud buff", audBuffer);

      // const audDuration = await getBlobDuration(audBlob);
      // console.log("duration", audDuration);

      const audDurationSec = await getAudioDurationInSeconds(audFilePath);
      console.log("duration", audDurationSec);

      // const audDuration = await getBlobDuration(audBlob); // in seconds
      const loopNumFloat = (parseFloat(durationHr) * 60 * 60) / audDurationSec;
      const loopNum =
        durationHr !== "12"
          ? Math.ceil(loopNumFloat)
          : Math.floor(loopNumFloat); // Youtube maximum is 12 hours
      console.log("creating a ", durationHr, " hours video");
      console.log("loop num", loopNum);
      // // Write the file to memory
      // TODO add file name, remove https:www. thingy

      console.log("before");

      const outputPath = `${__dirname}/../tmp/output3.mp4`;

      ffmpeg()
        .input(imgFilePath)
        // .loop(1)
        .inputOptions(["-r 1", "-loop 1"])
        .input(audFilePath)
        .inputOptions(["-r 1", `-stream_loop ${loopNum}`])
        .audioCodec("aac")
        // .size("1280x720")
        .outputOptions(["-vf scale=1280:720", "-shortest"])
        // .output(outputPath);
        .on("error", (error) => {
          console.log("error generating the output:", error);
        })
        .on("end", () => {
          console.log("Video Generated Successfully!");
        })
        .save(outputPath);

      console.log("after");

      // // Read the result
      // const data = ffmpeg.FS("readFile", "out.mp4");
    } catch (error) {
      console.log("error", error);
    }
    return;
  }
);
