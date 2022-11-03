import getBlobDuration from "get-blob-duration";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import Button from "./components/Buttons/Button";
import Range from "./components/Range";
import Spinner from "./components/Spinner";
import PageHeading from "./components/typography/PageHeading";
import SubHeading from "./components/typography/SubHeading";

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
  "/videos/1-com.mp4",
  "/videos/1.mp4",
  "/videos/2.mp4",
  "/videos/3.mp4",
  "/videos/4.mp4",
];
const audsPath = ["/audios/1.mp3", "/audios/2.mp3", "/audios/3.mp3"];

interface Props {}

const ffmpeg = createFFmpeg({
  log: true,
});

const GenVid = ({}: Props) => {
  const [ready, setReady] = useState(false);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [loop, setLoop] = useState("");

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsLoading(true);
      console.log("data", data);
      await handleGenLoop(data);
      setIsLoading(false);
    } catch (error) {
      console.log("⛔  error registering");
    }
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

      const imgRes = await fetch("/images/2.jpg", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      const imgBlob = await imgRes.blob();

      const audRes = await fetch(input.audioPath);
      const audBlob = await audRes.blob();

      const vidDuration = await getBlobDuration(vidBlob); // in sec
      const audDuration = await getBlobDuration(audBlob);

      const loopNum = Math.ceil(
        (parseFloat(input.durationHours) * 60 * 60) / vidDuration
      );
      console.log("loop num", loopNum);

      // Write the file to memory
      ffmpeg.FS("writeFile", "video.mp4", await fetchFile(vidBlob));
      console.log("wrote video");
      ffmpeg.FS("writeFile", "image.jpg", await fetchFile(imgBlob));
      console.log("wrote image");

      ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audBlob));

      console.log("wrote audio");

      // video x audio
      // await ffmpeg.run(
      //   "-stream_loop", // input
      //   "2", // loop video infinitely
      //   "-i", // input
      //   "video.mp4",
      //   "-stream_loop", // loop audio infinitely
      //   "-1",
      //   "-i", // input
      //   "audio.mp3",
      //   "-c:v", // codec (compress) video
      //   "copy", // type of cypress (h.264, h.265, vp9, copy) ex. h264
      //   "-c:a", // codec audio
      //   "aac", // type of cypress (mpeg-4, aac,wav,mp3,etc)
      //   "-map",
      //   "0:v:0", // <inputNo>:<streamNo> pick the video of the first input stream
      //   "-map",
      //   "1:a:0", // pick the audio of the second input stream
      //   "-shortest", // select the shortest length of input streams, which is the video legnth since the audio will be looped infinity
      //   // "-fs", limit the output size
      //   // "1800M",
      //   "out.mp4" // output
      // );

      // image x audio => not working give audio as output somehow
      // await ffmpeg.run(
      //   "-loop", // input
      //   "1", // loop video infinitely
      //   "-i", // input
      //   "image.jpg",
      //   "-stream_loop", // loop audio infinitely
      //   "1",
      //   "-i", // input
      //   "audio.mp3",
      //   "-c:v",
      //   "copy",
      //   "-tune",
      //   "stillimage",
      //   "-shortest", // select the shortest length of input streams, which is the video legnth since the audio will be looped infinity
      //   "-c:a", // codec audio = -acodec
      //   "aac", // type of compress (mpeg-4, aac,wav,mp3,etc)
      //   // "-fs",
      //   // "1000M",
      //   "out.mp4" // output
      // );

      // image x audio (simplify)
      // await ffmpeg.run("-i", "image.jpg", "-i", "audio.mp3", "out.mp4");

      // this one works! => 20 mins 0.04 gb

      // await ffmpeg.run(
      //   "-r",
      //   "1",
      //   "-loop",
      //   "1",
      //   "-i",
      //   "image.jpg",
      //   "-stream_loop",
      //   "10",
      //   "-i",
      //   "audio.mp3",
      //   "-acodec",
      //   "copy",
      //   "-r",
      //   "1",
      //   "-shortest",
      //   "-vf",
      //   "scale=1280:720",
      //   "out.mp4"
      // );

      // also works, pretty much the same
      await ffmpeg.run(
        "-r",
        "1",
        "-loop",
        "1",
        "-y",
        "-i",
        "image.jpg",
        "-stream_loop",
        "10",
        "-i",
        "audio.mp3",
        "-acodec",
        "copy",
        "-r",
        "1",
        "-vcodec",
        "libx264",
        "-shortest",
        "out.mp4"
      );

      // await ffmpeg.run(
      //   "-stream_loop", // input
      //   "200", // loop video infinitely
      //   "-i", // input
      //   "video.mp4",
      //   "-stream_loop", // loop audio infinitely
      //   "-1",
      //   "-i", // input
      //   "audio.mp3",
      //   "-c:v", // codec (compress) video = -vcodec
      //   "copy", // type of cypress (h.264, h.265, vp9, copy) ex. h264
      //   // "-crf", // -crf
      //   // "30", // the higher, the lower bitrate, the smaller 0-51 is good
      //   "-c:a", // codec audio = -acodec
      //   "aac", // type of cypress (mpeg-4, aac,wav,mp3,etc)
      //   "-map",
      //   "0:v:0", // <inputNo>:<streamNo> pick the video of the first input stream
      //   "-map",
      //   "1:a:0", // pick the audio of the second input stream
      //   "-shortest", // select the shortest length of input streams, which is the video legnth since the audio will be looped infinity
      //   // "-fs", limit the output size
      //   // "1800M",
      //   "out.mp4" // output
      // );

      console.log("combined");
      // Read the result
      const data = ffmpeg.FS("readFile", "out.mp4");

      console.log("here is data", data);

      // Create a URL
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      // if download
      // const link = downloadLinkRef.current as HTMLAnchorElement;
      // link.href = URL.createObjectURL(
      //   new Blob([data.buffer], { type: "video/mp4;codecs=H264" })
      // );
      // link.download = `logia-video-${input.durationHours}-hrs-vid`;
      // link.click();

      console.log("url", url);
      setLoop(url);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

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

                  <video key={index} controls loop playsInline>
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
                  className="ml-2 text-sm font-medium text-gray-900"
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
          <div className="flex w-full"></div>

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

      {loop ? (
        <video key="asdadsff" controls loop playsInline className="w-60">
          <source src={loop} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : null}

      {/* {loop ? (
        <audio controls key="asdfasdfadsf" className="w-full">
          <source src={loop} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      ) : null} */}

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

      <a ref={downloadLinkRef} className={`${loop ? "" : "invisible"}`}>
        Download
      </a>
    </div>
  );
};
export default GenVid;
