import getBlobDuration from "get-blob-duration";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import Button from "./components/Buttons/Button";
import Range from "./components/Range";
import Spinner from "./components/Spinner";
import PageHeading from "./components/typography/PageHeading";
import SubHeading from "./components/typography/SubHeading";
// import { createFFmpegCore } from "../@ffmpeg/core/dist/ffmpeg-core.js";

interface FormValues {
  videoPath: string;
  audioPath: string;
  durationHours: string;
}

const defaultValues: FormValues = {
  videoPath: "",
  audioPath: "",
  durationHours: "0",
};

const vidsPath = [
  "/videos/1.mp4",
  "/videos/2.mp4",
  "/videos/3.mp4",
  "/videos/4.mp4",
];
const audsPath = ["/audios/1.mp3", "/audios/2.mp3", "/audios/3.mp3"];

interface Props {}

// const ffmpeg = createFFmpeg({ log: true });
const ffmpeg = createFFmpeg({
  log: false,
  //   corePath: "./../../../../public/@ffmpeg/core/dist/ffmpeg-core.js", // in public
});

const GenVid = ({}: Props) => {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [gif, setGif] = useState("");
  const [loop, setLoop] = useState("");
  const [aud, setAud] = useState("");
  const vidRef = useRef();

  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const loadFFmpeg = async () => {
    try {
      await ffmpeg.load();
      setReady(true);
    } catch (error) {
      console.log("load error", error);
    }
  };

  console.log("form errors", errors);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsLoading(true);
      console.log("data", data);
      // await handleGenLoop(data);
      setIsLoading(false);
    } catch (error) {
      console.log("⛔  error registering");
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

  const handleGenLoop = async (input: FormValues) => {
    try {
      const vidRes = await fetch(input.videoPath, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      const vidBlob = await vidRes.blob();

      const audRes = await fetch(input.audioPath);
      const audBlob = await audRes.blob();

      const vidDuration = await getBlobDuration(vidBlob); // in sec
      const audDuration = await getBlobDuration(audBlob);

      const loopNum = Math.ceil(
        (parseInt(input.durationHours) * 60 * 60) / vidDuration
      );

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

      // // audio test delete this later
      // const audioData = ffmpeg.FS("readFile", "audio.mp3");
      // const audUrl = URL.createObjectURL(
      //   new Blob([audioData.buffer], { type: "audio/mpeg" })
      // );
      // setAud(audUrl);
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
      <PageHeading heading="Create Looped Rain Videos" />

      {/* Select Vids Section */}
      <div
        id="select-vid-section"
        className="p-10 my-4 border-2 border-grey-50 border-solid rounded-md"
      >
        <SubHeading
          heading="1. Select a video"
          extraClass="text-left text-xl mb-4 font-bold"
        />
        <div className="grid grid-cols-4 gap-4">
          {vidsPath.map((vidPath, index) => {
            const currentVidPath = watch("videoPath");
            const selectedClass =
              "border-2 border-primary-500 border-solid rounded-md bg-primary-50";
            const isSelected = currentVidPath === vidPath;
            console.log("cur", currentVidPath);
            console.log("map", vidPath);
            return (
              <div
                key={index}
                className={`col-span-1 p-4 ${isSelected ? selectedClass : ""}`}
              >
                <input
                  id={vidPath} // need id for htmlFor to work (can click label instead of input radio)
                  {...register("videoPath", {
                    required: "Please select a video",
                  })}
                  type="radio"
                  value={vidPath}
                  name="videoPath"
                  className={`w-4 h-4`}
                />
                <label htmlFor={vidPath}>
                  {/* add empty div so it is clickable outside the radio button itself */}
                  <div>
                    <br></br>
                  </div>

                  <video
                    key={index}
                    controls
                    loop
                    playsInline
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    <source src={vidPath} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div>
                    <br></br>
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {errors.videoPath && (
          <p className="text-red">{errors.videoPath.message}</p>
        )}
      </div>

      {/* Select Audios Section */}
      <div
        id="select-aud-section"
        className="p-10 my-4 border-2 border-grey-50 border-solid rounded-md"
      >
        <SubHeading
          heading="2. Select an audio"
          extraClass="text-left text-xl mb-4 font-bold"
        />
        <div className="grid grid-cols-4 gap-4">
          {audsPath.map((audPath, index) => {
            const currentAudPath = watch("audioPath");
            const selectedClass =
              "border-2 border-primary-500 border-solid rounded-md bg-primary-50";
            const isSelected = currentAudPath === audPath;

            return (
              <div
                key={index}
                className={`col-span-2 p-4 ${isSelected ? selectedClass : ""}`}
              >
                <input
                  id={audPath}
                  {...register("audioPath", {
                    required: "Please select an audio",
                  })}
                  type="radio"
                  value={audPath}
                  name="audioPath"
                  className="w-4 h-4"
                />

                <label
                  htmlFor={audPath}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  <div>
                    <br></br>
                  </div>

                  <audio controls key={index} className="w-full">
                    <source src={audPath} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                  <div>
                    <br></br>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
        {errors.audioPath && (
          <p className="text-red">{errors.audioPath.message}</p>
        )}
      </div>

      {/* duration input */}
      <div
        id="select-duration-section"
        className="p-10 my-4 border-2 border-grey-50 border-solid rounded-md"
      >
        <SubHeading
          heading="3. Select a duration"
          extraClass="text-left text-xl mb-4 font-bold"
        />
        <div>
          <div className="flex w-full">
            {/* <input
              type="number"
              id="website-admin"
              {...register("durationHours")}
              className="rounded-none rounded-l-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 "
              placeholder="Bonnie Green"
            />

            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-r-md border border-r-0 border-gray-300">
              minutes
            </span>
            */}
          </div>

          <Controller
            control={control}
            name="durationHours"
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <Range
                unit="Hours"
                value={parseFloat(value)}
                onChange={onChange}
                min={0}
                step={0.5}
                max={12}
              />
            )}
            rules={{
              required: {
                value: true,
                message: "Please select the duration of the video",
              },
              min: {
                value: 0.5,
                message: "Duration must be more than 0",
              },
            }}
          />
        </div>
        {errors.durationHours && (
          <p className="text-red">{errors.durationHours.message}</p>
        )}
      </div>

      {/* <video
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
      </video> */}
      {/* 
      {Array.from(Array(3).keys()).map((num) => {
        const src = `/audios/${num + 1}.mp3`;

        return (
          <audio controls key={num}>
            <source src={src} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      })} */}

      {aud && (
        <audio controls key={"asdf3d"}>
          <source src={aud} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
      {/* {gif && <img src={gif} width="250" />} */}

      {loop ? (
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
      ) : null}

      <div className="my-10">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center items-center">
              <Spinner size="h-20 w-20" />
              <p className="text-primary-500 text-xl font-bold mt-8">
                {"Generating...This might take a few minutes"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mt-6">
            <Button label="Generate" onClick={handleSubmit(onSubmit)} />
          </div>
        )}
      </div>

      <div>
        {/* <Button label="Randomize" onClick={handleGenLoop} extraClass="my-4" /> */}
      </div>
    </div>
  );
};
export default GenVid;
