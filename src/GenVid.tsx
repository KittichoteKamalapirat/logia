import getBlobDuration from "get-blob-duration";
import React, { useEffect, useRef, useState } from "react";
import vid2 from "/videos/2.mp4";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
// import { createFFmpegCore } from "../@ffmpeg/core/dist/ffmpeg-core.js";

interface Props {}

// const ffmpeg = createFFmpeg({ log: true });
const ffmpeg = createFFmpeg({
  log: false,
  //   corePath: "./../../../../public/@ffmpeg/core/dist/ffmpeg-core.js", // in public
});

const GenVid = ({}: Props) => {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState("");
  const [loop, setLoop] = useState("");
  const [aud, setAud] = useState("");
  const vidRef = useRef();

  const loadFFmpeg = async () => {
    try {
      await ffmpeg.load();
      setReady(true);
    } catch (error) {
      console.log("load error", error);
    }
  };

  const handleLoadedMetadata = () => {
    const video = vidRef.current;
    if (!video) return;
    setVideo(video);
    console.log(`The video is ${video?.duration} seconds long.`);
  };

  const handleGenGif = async () => {
    const res = await fetch("http://127.0.0.1:5173/videos/2.mp4");
    const blob = await res.blob();
    console.log("res", res);
    console.log("blob", blob);
    // Write the file to memory
    ffmpeg.FS("writeFile", "test.mp4", await fetchFile(blob));

    // Run the FFMpeg command
    await ffmpeg.run(
      "-i", // input
      "test.mp4",
      "-t", // length of the vid
      "2.5",
      "-ss", // starting second
      "2.0",
      "-f", // format
      "gif",
      "out.gif" // output
    );

    // Read the result
    const data = ffmpeg.FS("readFile", "out.gif");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setGif(url);
  };

  const handleGenLoop = async () => {
    try {
      const vidRes = await fetch("/videos/3.mp4", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      const vidBlob = await vidRes.blob();

      const audRes = await fetch("/audios/2.mp3");
      const audBlob = await audRes.blob();

      const vidDuration = await getBlobDuration(vidBlob); // in sec
      const audDuration = await getBlobDuration(audBlob);

      const loopNum = Math.ceil((60 * 5) / vidDuration);
      console.log("==========");
      console.log(vidDuration, audDuration);

      console.log("res", vidRes);
      console.log("blob", vidBlob);

      console.log("audRes", audRes);
      console.log("audBlob", audBlob);

      // Write the file to memory
      ffmpeg.FS("writeFile", "video.mp4", await fetchFile(vidBlob));
      ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audBlob));

      await ffmpeg.run(
        "-stream_loop", // input
        loopNum.toString(), // loop video infinitely
        "-i", // input
        "video.mp4",
        "-stream_loop", // loop audio infinitely
        "-1",
        "-i", // input
        "audio.mp3",
        "-c:v", // codec (compress) video
        "copy", // type of cypress (h.264, h.265, vp9)
        "-c:a", // codec audio
        "aac", // type of cypress (mpeg-4, aac,wav,mp3,etc)
        "-map",
        "0:v:0", // <inputNo>:<streamNo> pick the video of the first input stream
        "-map",
        "1:a:0", // pick the audio of the second input stream
        "-shortest", // select the shortest length of input streams, which is the video legnth since the audio will be looped infinity
        "out.mp4" // output
      );

      // Read the result
      const data = ffmpeg.FS("readFile", "out.mp4");

      // Create a URL
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      setLoop(url);

      // audio test delete this later
      const audioData = ffmpeg.FS("readFile", "audio.mp3");
      const audUrl = URL.createObjectURL(
        new Blob([audioData.buffer], { type: "audio/mpeg" })
      );
      setAud(audUrl);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  // // save video ref to a video state
  // useEffect(() => {
  //   if (!vidRef.current) return;
  //   setVideo(vidRef.current);
  // }, [vidRef.current]);

  if (!ready) return <div>Loading...</div>;
  return (
    <div>
      <p>create</p>
      <p className="text-xl">xxx</p>
      {/* {Array.from(Array(3).keys()).map((num) => {
        const src = `/videos/${num + 1}.mp4`;

        return (
          <video key={num} controls loop playsInline className="w-60">
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      })} */}

      <video
        ref={vidRef}
        key="asdfxx"
        controls
        loop
        playsInline
        className="w-60"
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src="/videos/1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <video
        key="asdf"
        controls
        loop
        playsInline
        className="w-60"
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={vid2} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {Array.from(Array(3).keys()).map((num) => {
        const src = `/audios/${num + 1}.mp3`;

        return (
          <audio controls key={num}>
            <source src={src} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      })}

      {aud && (
        <audio controls key={"asdf3d"}>
          <source src={aud} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
      {gif && <img src={gif} width="250" />}
      {loop && (
        <video
          key="asdadsff"
          controls
          loop
          playsInline
          className="w-60"
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={loop} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div>
        <button onClick={handleGenGif}>generate gif</button>
      </div>

      <button onClick={handleGenLoop}>generate loop</button>
    </div>
  );
};
export default GenVid;
