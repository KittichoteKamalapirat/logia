import { Suspense } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { brandName } from "../constants/brand";
import { auth } from "../firebase/client";
import AuthDisplay from "./AuthDisplay";

import { ButtonTypes } from "./Buttons/Button";
import LinkButton from "./Buttons/LinkButton";
import { Loading } from "./Loading";

interface Props {}

const Navbar = ({}: Props) => {
  const [user, userLoading] = useAuthState(auth);

  return (
    <div className="flex justify-center py-2 px-10 w-full top-0 fixed bg-primary text-grey-0 z-50">
      <div className="flex justify-between items-center md:max-w-7xl w-full ">
        <div className="flex">
          {/* <div className="mr-4">logo image</div> */}
          <a className="text-xl" href="/">
            <div className="flex gap-2 items-center">
              <img src="/logo/white-logo.png" alt="Logo" className="w-8 h-8" />
              <div>{brandName}</div>
            </div>
          </a>
        </div>
        <div>
          <ul className="flex gap-4">
            {/* <Link>Contact</Link> */}
            {!user?.displayName ? (
              <LinkButton
                href="/pricing"
                type={ButtonTypes.TEXT}
                extraClass="text-grey-0"
                label="Pricing"
              />
            ) : null}

            <Suspense fallback={<Loading />}>
              <AuthDisplay />
            </Suspense>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
