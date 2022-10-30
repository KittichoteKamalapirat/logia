import { Basic } from "unsplash-js/dist/methods/photos/types";
import dayjs from "dayjs";
import { Sound } from "../types/FreeSound";
import Tag from "./Tag";
import { ReviewStars } from "./ReviewStars";
interface Props {
  sound: Sound;
}
const AudioCard = ({ sound }: Props) => {
  const {
    id,
    url,
    name,
    filesize,
    duration,
    download,
    previews,
    type,
    tags,
    description,
    avg_rating,
    rate,
    license,
    username,
    created,
  } = sound;

  const previewUrl = previews["preview-lq-mp3"];

  return (
    <>
      <div className="rounded-b-2xl rounded-t-3xl shadow-md bg-white hover:cursor-pointer">
        <article key={id} className="rounded-t-2xl">
          <audio controls className="w-full" crossOrigin="same-origin">
            <source
              src={previewUrl} // for displaying
              type="audio/mp3"
            />
            Your browser does not support the audio element.
          </audio>

          {/* card details */}

          <div className="px-4 py-6 ">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <article className="flex items-center justify-start">
                {/* left side */}
                <div>
                  <div className="font-bold">{name.split(`.${type}`)[0]}</div>
                  <ul className="text-md">
                    <li className="text-grey-600 font-bold">
                      by{" "}
                      <a
                        href={url}
                        className="hover:text-primary-hovered"
                        target="_blank"
                      >
                        {username}
                      </a>
                    </li>
                    <li className="opacity-75">
                      {dayjs(created).format("DD MMMM YYYY")}
                    </li>
                  </ul>
                </div>
              </article>

              <article className="mt-5 md:mt-0">
                <a
                  href={`https://instagram.com/${user.instagram_username}`}
                  className="text-sm opacity-75"
                  target="_blank"
                  rel="noreferrer"
                >
                  filesize: {Math.floor(filesize / 1000000)} Mb
                </a>

                <ReviewStars reviewScore={avg_rating} />
              </article>
            </div>
            <div className="flex flex-wrap">
              {tags.map((tag) => (
                <Tag content={tag} />
              ))}
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default AudioCard;
