import { useCallback, useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldError,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { Basic } from "unsplash-js/dist/methods/photos/types";
import AudioCard from "./components/AudioCard";
import Button from "./components/Buttons/Button";
import ImgCard from "./components/ImgCard";
import Range from "./components/Range";
import Searchbar from "./components/Searchbar";
import Spinner from "./components/Spinner";
import PageHeading from "./components/typography/PageHeading";
import SubHeading from "./components/typography/SubHeading";
import ProgressBar from "./ProgressBar";
import { FreeSoundResponse } from "./types/FreeSound";
import { unsplash } from "./unsplash/unsplash";

import Layout from "./components/layouts/Layout";
import { Loading } from "./components/Loading";
import TextAreaField from "./components/TextAreaField";
import TextField, { TextFieldTypes } from "./components/TextField";
import { generateVid, loadSecretAndUploadVideo } from "./firebase/client";

const TITLE_EXAMPLES = [
  "10 Hours of Rain Sound Relaxation / Ultimate Stress Relief, Deep Sleep, Meditation, Yoga",
  "Rain On Window with Thunder Sounds - Rain in Forest at Night - 10 Hours",
  "Rain Sound On Window with Thunder SoundsㅣHeavy Rain for Sleep, Study and Relaxation, Meditation",
];

enum FormNames {
  TITLE = "title",
  DESCRIPTION = "description",
  IMAGE_URL = "imageUrl",
  AUDIO_URL = "audioUrl",
  DURATION_HOURS = "durationHours",
}

interface FormValues {
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  durationHours: string;
}

const defaultValues: FormValues = {
  title: "",
  description: "",
  imageUrl: "",
  audioUrl: "",
  durationHours: "0",
};

const CreateUpload = () => {
  // unsplash
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [freeSoundPage, setfreeSoundPage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [photos, setPhotos] = useState<Basic[]>();
  const [unsplashQuery, setUnsplashQuery] = useState("rain");

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
  const audUrl = watch("audioUrl");
  const durationHr = watch("durationHours");

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

      setIsLoading(false);
    } catch (error) {
      console.log("⛔  error registering");
    }
  };

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

  return (
    <div className="sm:f-ull lg:w-3/4">
      <PageHeading
        heading="Create Chill Rain Videos"
        extraClass="font-bold text-center mb-10"
      />

      <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-2 ">
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
                const currentAudPath = watch("audioUrl");
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
                      {...register("audioUrl", {
                        required: "Please select an audio",
                      })}
                      type="radio"
                      value={previewUrl} // for react-hook-form
                      name="audioUrl"
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
            {errors.audioUrl && (
              <p className="text-red">{errors.audioUrl.message}</p>
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

      {/* metadata */}

      <div>
        <SubHeading
          heading="4. Add metadata"
          extraClass="text-left text-xl mb-4 font-bold"
        />
        <div className="mb-10">
          <TextField
            required
            name={FormNames.TITLE}
            control={control as unknown as Control}
            label="Video Title on Youtube"
            type={TextFieldTypes.OUTLINED}
            error={errors[FormNames.TITLE]}
          />
          <ul>
            Ex.{" "}
            {TITLE_EXAMPLES.map((title, index) => (
              <li key={index}>- {title}</li>
            ))}
          </ul>
        </div>

        <TextAreaField
          required
          {...register(FormNames.DESCRIPTION, {})}
          label="Description on Youtube"
          labelClass="text-grey-420"
          error={errors[FormNames.DESCRIPTION] as FieldError}
        />
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

        <Button
          label="Gen in backend"
          onClick={() => {
            generateVid({ imgUrl, audUrl, durationHr });
          }}
        />

        <Button
          label="Upload to youtube"
          onClick={() => {
            console.log("hi 5");
            loadSecretAndUploadVideo({
              title: "title",
              descirption: "description",
              tags: ["tags"],
            });
            console.log("hi 6");
          }}
        />
      </div>
    </div>
  );
};
export default CreateUpload;
