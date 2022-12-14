import getBlobDuration from "get-blob-duration";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Basic } from "unsplash-js/dist/methods/photos/types";
import AudioCard from "./components/AudioCard";
import Button from "./components/Buttons/Button";
import ImgCard from "./components/ImgCard";
import Range from "./components/Range";
import Searchbar from "./components/Searchbar";
import Spinner from "./components/Spinner";
import PageHeading from "./components/typography/PageHeading";
import SubHeading from "./components/typography/SubHeading";
import { brandName } from "./constants/brand";
import ProgressBar from "./ProgressBar";
import { FreeSoundResponse } from "./types/FreeSound";
import { unsplash } from "./unsplash/unsplash";

import Layout from "./components/layouts/Layout";
import { Loading } from "./components/Loading";
import {
  generateVid,
  loadSecretAndUploadVideo,
  sayHello,
} from "./firebase/client";

interface FormValues {
  imageUrl: string;
  audioPath: string;
  durationHours: string;
}

const defaultValues: FormValues = {
  imageUrl: "",
  audioPath: "",
  durationHours: "0",
};

interface Props {}

const ffmpeg = createFFmpeg({
  log: false,
});

const GenImgVid = ({}: Props) => {
  const [ready, setReady] = useState(false);

  // unsplash
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [freeSoundPage, setfreeSoundPage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [photos, setPhotos] = useState<Basic[]>();
  const [unsplashQuery, setUnsplashQuery] = useState("rain");
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // freesound
  const [freeSoundResponse, setFreeSoundResponse] =
    useState<FreeSoundResponse>();
  const [freeSoundQuery, setFreeSoundQuery] = useState("rain");

  const [isLoading, setIsLoading] = useState(false);

  const [loop, setLoop] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const imgUrl = watch("imageUrl");
  const audUrl = watch("audioPath");
  const durationHr = watch("durationHours");

  const loadFFmpeg = async () => {
    try {
      await ffmpeg.load();

      setReady(true);
    } catch (error) {
      console.log("load error", error);
    }
  };

  // load on scroll starts

  const imageObserver = useRef<IntersectionObserver | null>(null);
  const audioObserver = useRef<IntersectionObserver | null>(null);

  const lastImgRef = useCallback(
    // node is basically the current last post
    (node: HTMLDivElement) => {
      if (imageObserver.current) imageObserver.current.disconnect(); // disconnect from the previous last element
      imageObserver.current = new IntersectionObserver((entries) => {
        // entries is an array of everything it is watching
        // in our case, there is just one thing
        if (entries[0].isIntersecting) {
          unsplash.search
            .getPhotos({
              query: unsplashQuery,
              page: unsplashPage,
              perPage: 10,
              orientation: "landscape",
            })
            .then((result) => {
              if (result.errors) {
                // handle error here
                console.log("error occurred: ", result.errors[0]);
              } else {
                const newPhotos = result.response.results;
                setPhotos([...(photos || []), ...newPhotos]);
              }
            });
          setUnsplashPage(unsplashPage + 1);
        }
      });
      if (node) imageObserver.current.observe(node); // observe our last node
    },
    [unsplashPage]
  );

  const lastAudioRef = useCallback(
    // node is basically the current last post
    (node: HTMLDivElement) => {
      if (audioObserver.current) audioObserver.current.disconnect(); // disconnect from the previous last element
      audioObserver.current = new IntersectionObserver((entries) => {
        // entries is an array of everything it is watching
        // in our case, there is just one thing
        if (entries[0].isIntersecting) {
          const fetchFreesound = async () => {
            const response = await fetch(freeSoundResponse?.next as string, {
              headers: new Headers({
                Authorization: `Token ${
                  import.meta.env.VITE_FREESOUND_CLIENT_SECRET
                }`,
              }),
            });
            const newData = (await response.json()) as FreeSoundResponse;

            const combinedData = {
              ...newData,
              results: [
                ...(freeSoundResponse?.results || []),
                ...newData.results,
              ],
            };
            setFreeSoundResponse(combinedData);
          };
          fetchFreesound();
        }
      });
      if (node) audioObserver.current.observe(node); // observe our last node
    },
    [freeSoundResponse, freeSoundPage]
  );

  // load on scroll ends

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsLoading(true);

      await handleGenLoop(data);
      setIsLoading(false);
    } catch (error) {
      console.log("???  error registering");
    }
  };

  const handleGenLoop = async (input: FormValues) => {
    try {
      const imgRes = await fetch(input.imageUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      const imgBlob = await imgRes.blob();
      const audRes = await fetch(input.audioPath);

      const audBlob = await audRes.blob();

      const audDuration = await getBlobDuration(audBlob); // in seconds

      const loopNum =
        input.durationHours !== "12"
          ? Math.ceil((parseFloat(input.durationHours) * 60 * 60) / audDuration)
          : Math.floor(
              (parseFloat(input.durationHours) * 60 * 60) / audDuration
            ); // Youtube maximum is 12 hours

      // time in secs of the output
      ffmpeg.setProgress((arg) => {
        const seconds = parseFloat(input.durationHours) * 60 * 60;
        const percent = Math.floor(((arg as any).time * 100) / seconds);
        setProgressPercent(percent);
      });

      console.log("creating a ", input.durationHours, " hours video");
      console.log("loop num", loopNum);

      // Write the file to memory
      console.log("-----blob--------", imgBlob);
      ffmpeg.FS("writeFile", "image.jpg", await fetchFile(imgBlob));
      console.log("wrote image");

      ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audBlob));

      console.log("wrote audio");

      // this one works! => 20mins vid 0.04 gb

      await ffmpeg.run(
        "-r",
        "1",
        "-loop",
        "1",
        "-i",
        "image.jpg",
        "-stream_loop",
        // "1",
        String(loopNum), // total will be 1 + loopNum
        "-i",
        "audio.mp3",
        "-acodec",
        "aac", // if copy => no sound for quicktime, but yes for vlc
        "-r",
        "1",
        "-shortest",
        "-vf",
        "scale=1280:720",
        "out.mp4"
      );

      // Read the result
      const data = ffmpeg.FS("readFile", "out.mp4");

      // Create a URL
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      // if download
      const link = downloadLinkRef.current as HTMLAnchorElement;
      // H265 works but no sound
      // H264 works but no sound
      //
      const linkHref = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      link.href = linkHref;
      link.download = `${freeSoundQuery}-video-${brandName}`;
      link.click();

      setLoop(url);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  // useEffect(() => {
  //   const fetchUnsplash = async () => {
  //     const response = await fetch(
  //       `https://api.unsplash.com/photos?client_id=${
  //         import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  //       }`
  //     );
  //     const data = await response.json();
  //     console.log(
  //       "VITE_UNSPLASH_ACCESS_KEY",
  //       import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  //     );

  //     console.log("data", data);
  //   };

  //   fetchUnsplash();
  // }, []);

  const handleSearchUnsplash = (query: string) => {
    unsplash.search
      .getPhotos({
        query,
        page: unsplashPage,
        perPage: 10,
        orientation: "landscape",
      })
      .then((result) => {
        if (result.errors) {
          // handle error here
          console.log("error occurred: ", result.errors[0]);
        } else {
          // handle success here
          const photos = result.response.results;
          console.log("photos", photos);
          setPhotos(photos);
        }
      });
  };

  const handleSearchFreeSound = (query: string) => {
    const fetchFreesoound = async () => {
      const response = await fetch(
        `https://freesound.org/apiv2/search/text/?query=${query}&fields=previews,created,type,tags,description,avg_rating,id,name,url,filesize,duration,download,license,username`,
        {
          headers: new Headers({
            Authorization: `Token ${
              import.meta.env.VITE_FREESOUND_CLIENT_SECRET
            }`,
          }),
        }
      );
      const data = (await response.json()) as FreeSoundResponse;
      console.log("sounds", data);
      setFreeSoundResponse(data);
    };

    fetchFreesoound();
  };

  useEffect(() => {
    handleSearchUnsplash(unsplashQuery);
    handleSearchFreeSound(freeSoundQuery);

    setUnsplashPage(unsplashPage + 1);
  }, []);

  if (!ready)
    return (
      <Layout>
        <Loading isFullPage={true} />
      </Layout>
    );
  return (
    <div>
      <PageHeading
        heading="Create Chill Rain Videos"
        extraClass="font-bold text-center mb-10"
      />

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
        <div id="left" className="col-span-1">
          {/* Select Vids Section */}
          <SubHeading
            heading="1. Select an image"
            extraClass="text-left text-xl mb-4 font-bold"
          />

          <div
            id="select-vid-section"
            className="overflow-y-scroll h-[60vh] p-10 my-4 border-2 border-grey-50 border-solid rounded-md"
          >
            <Searchbar
              query={unsplashQuery}
              onChange={(text) => setUnsplashQuery(text)}
              handleSearch={() => handleSearchUnsplash(unsplashQuery)}
            />

            <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
              {photos?.map((photo, index) => {
                const currentPhotoUrl = watch("imageUrl");
                const selectedClass =
                  "border-2 border-primary-500 border-solid rounded-md bg-primary-50";
                const isSelected = currentPhotoUrl === photo.urls.regular;

                return (
                  <div
                    key={index}
                    className={`col-span-1 p-4 hover:bg-primary-50 ${
                      isSelected ? selectedClass : ""
                    }`}
                    ref={photos?.length === index + 1 ? lastImgRef : null}
                  >
                    <input
                      id={photo.urls.regular} // need id for htmlFor to work (can click label instead of input radio)
                      {...register("imageUrl", {
                        required: "Please select a video",
                      })}
                      type="radio"
                      value={photo.urls.regular}
                      name="imageUrl"
                      className="w-4 h-4 invisible"
                    />
                    <label htmlFor={photo.urls.regular}>
                      {/* add empty div so it is clickable outside the radio button itself */}

                      {/* <Article key={image.id} {...image} /> */}
                      <ImgCard photo={photo} />
                      <div>
                        <br></br>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {errors.imageUrl && (
              <p className="text-red">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>

        <div id="right" className="col-span-1">
          <SubHeading
            heading="2. Select an audio"
            extraClass="text-left text-xl mb-4 font-bold"
          />
          {/* Select Audios Section */}
          <div
            id="select-aud-section"
            className="overflow-y-scroll h-[60vh] p-10 my-4 border-2 border-grey-50 border-solid rounded-md"
          >
            <Searchbar
              query={freeSoundQuery}
              onChange={(text) => setFreeSoundQuery(text)}
              handleSearch={() => handleSearchFreeSound(freeSoundQuery)}
            />

            <div className="grid grid-cols-1 gap-4 mt-4">
              {freeSoundResponse?.results.map((sound, index) => {
                const previewUrl = sound.previews["preview-lq-mp3"];
                const currentAudPath = watch("audioPath");
                const selectedClass =
                  "border-2 border-primary-500 border-solid rounded-md bg-primary-50";
                const isSelected = currentAudPath === previewUrl;

                return (
                  <div
                    key={index}
                    className={`col-span-1 p-4 hover:bg-primary-50 ${
                      isSelected ? selectedClass : ""
                    }`}
                    // ref={
                    //   freeSoundResponse.results?.length === index + 1
                    //     ? lastAudioRef
                    //     : null
                    // }
                    ref={lastAudioRef}
                  >
                    <input
                      id={String(sound.id)}
                      {...register("audioPath", {
                        required: "Please select an audio",
                      })}
                      type="radio"
                      value={previewUrl} // for react-hook-form
                      name="audioPath"
                      className="w-4 h-4 invisible"
                    />

                    <label htmlFor={String(sound.id)} className="ml-2">
                      <br />
                      <AudioCard sound={sound} />
                    </label>
                  </div>
                );
              })}
            </div>
            {errors.audioPath && (
              <p className="text-red">{errors.audioPath.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* duration input */}

      <div id="select-duration-section" className="mt-10">
        <SubHeading
          heading="3. Select a duration"
          extraClass="text-left text-xl mb-4 font-bold"
        />
        <div className="p-10 my-4 border-2 border-grey-50 border-solid rounded-md">
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
      </div>

      {loop ? (
        <video
          key="asdadsff"
          controls
          loop
          playsInline
          className="w-1/2 mx-auto"
        >
          <source src={loop} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : null}

      <div className="my-10">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center items-center w-full">
              <Spinner size="h-10 w-10" />
              <div className="text-center">
                <p className="text-primary-500 text-xl font-bold mt-4">
                  Generating...
                </p>
                <p className="text-primary-500 text-lg font-bold">
                  This might take a few minutes
                </p>
              </div>
              <ProgressBar percent={progressPercent} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              label="Generate"
              onClick={handleSubmit(onSubmit)}
              fontSize="text-xl"
              extraClass={`${loop ? "hidden" : ""}`}
            />
          </div>
        )}

        <div className="flex justify-center w-full">
          <a ref={downloadLinkRef} className={`${loop ? "" : "invisible"}`}>
            <Button label="Download" fontSize="text-xl" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default GenImgVid;
