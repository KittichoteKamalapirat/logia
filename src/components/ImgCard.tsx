import { Basic } from "unsplash-js/dist/methods/photos/types";
import dayjs from "dayjs";
interface Props {
  photo: Basic;
}
const ImgCard = ({ photo }: Props) => {
  const { id, urls, user, created_at, likes } = photo;
  return (
    <>
      <div className="pb-5 rounded-2xl shadow-md bg-white hover:cursor-pointer">
        <article key={id} className="rounded-2xl">
          <img
            src={urls.small}
            alt={user.username}
            className="h-36 object-fit object-cover w-full lg:h-40 rounded-t-2xl"
          />

          <div className="p-2 pb-0 flex flex-col md:flex-row items-start md:items-center justify-between">
            <article className="flex items-center justify-start">
              <img
                src={user.profile_image.medium}
                alt={user.username}
                className="rounded-full mr-2 w-8 md:w-12"
              />
              <ul>
                <li className="text-slate-800 font-bold">{user.name}</li>
                <li className="text-sm text-slate-800 opacity-75">
                  {dayjs(created_at).format("DD MMMM YYYY")}
                </li>
              </ul>
            </article>

            <article className="mt-5 md:mt-0">
              <a
                href={`https://instagram.com/${user.instagram_username}`}
                className="text-sm text-slate-800 opacity-75 underline"
                target="_blank"
                rel="noreferrer"
              >
                {user.instagram_username}
              </a>
              <small className="text-slate-800 opacity-75 block">
                {likes} Likes
              </small>
            </article>
          </div>
        </article>
      </div>
    </>
  );
};

export default ImgCard;
