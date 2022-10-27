import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { signInWithEmailAndPassword } from "firebase/auth";
import Layout from "../components/layouts/Layout";
import Button from "../components/Buttons/Button";
import LinkButton from "../components/Buttons/LinkButton";
import { auth, loginWithEmail } from "../firebase/client";

enum FormNames {
  EMAIL = "email",
  PASSWORD = "password",
}

interface FormValues {
  email: string;
  password: string;
}
interface UserError {
  key?: string | null | undefined;
  message?: string;
}

const defaultValues: FormValues = {
  email: "",
  password: "",
};

const Login = () => {
  const [passwordIsShown, setPasswordIsShown] = useState(false);
  const [user, userLoading] = useAuthState(auth);

  console.log("user", user);

  const [genericErrorMessage, setGenericErrorMessage] = useState("");
  const {
    control,
    handleSubmit,
    setError,
    watch,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const togglepasswordIsShown = () => {
    setPasswordIsShown(!passwordIsShown);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      loginWithEmail(data.email, data.password); // nothing else to do, AuthDisplay handle change
    } catch (error) {
      console.log("⛔  error registering");
    }
  };

  return (
    <Layout alignItems="items-center">
      <div className="w-3/4">
        <p>Log in</p>
        <div className="mt-2">
          <p>Email</p>
          <div>
            <input
              {...register("email", { required: true })}
              placeholder="Type title"
            />
          </div>

          {errors.email ? <p>This is required.</p> : null}
        </div>

        <div className="mt-2">
          <p className="p-white">Password</p>

          <div>
            <input
              {...register("password", { required: true })}
              placeholder="Type title"
            />
          </div>

          {errors.password && <p>This is required.</p>}
        </div>

        <div className="mt-6">
          <Button label="Log in" onClick={handleSubmit(onSubmit)} />
        </div>

        <div className="flex-row justify-center mt-2">
          <p>Don&apos;t have an account?</p>
          <LinkButton label="Sign up" href="/register" />
        </div>
      </div>
    </Layout>
  );
};

export default Login;
