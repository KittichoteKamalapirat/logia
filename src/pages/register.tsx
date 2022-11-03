import { useAuthState } from "react-firebase-hooks/auth";
import { useDispatch } from "react-redux";

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "../components/Buttons/Button";
import LinkButton from "../components/Buttons/LinkButton";
import Layout from "../components/layouts/Layout";
import { auth, registerWithEmail } from "../firebase/client";
import { createUser, UserCredentials } from "../redux/slices/userReducer";

enum FormNames {
  EMAIL = "email",
  PASSWORD = "password",
  CONFIRM_PASSWORD = "confirmPassword",
}

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserError {
  key?: string | null | undefined;
  message?: string;
}

const defaultValues: FormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const [passwordIsShown, setPasswordIsShown] = useState(false);

  const dispatch = useDispatch();
  const [user, userLoading] = useAuthState(auth);
  const [genericErrorMessage, setGenericErrorMessage] = useState("");
  const {
    handleSubmit,
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
      registerWithEmail(data.email, data.password);
    } catch (error) {
      console.log("⛔  error registering");
    }
  };

  const password = watch(FormNames.PASSWORD);
  console.log("password", password);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const newUser: UserCredentials = {
        email: user?.email as string,
        password,
      };
      dispatch(createUser(newUser) as any); // TODO
    });

    return unsubscribe;
  }, []);
  return (
    <Layout alignItems="items-center">
      <div className="w-3/4">
        <p>Create Account</p>

        <div className="mt-2">
          <p>Email</p>
          <div>
            <input
              {...register("email", { required: true })}
              placeholder="Type title"
            />
          </div>
          {errors.email ? (
            <p className="p-grey-0">{errors.email?.message}</p>
          ) : null}
        </div>

        <div className="mt-2">
          <p>Password</p>

          <div>
            <input
              {...register("password", { required: true })}
              placeholder="Type title"
            />
          </div>

          {errors.password && <p>This is required.</p>}
        </div>

        <div className="mt-2">
          <p>Confirm Password</p>

          <div className="items-end">
            <div>
              <input
                {...register("confirmPassword", { required: true })}
                placeholder="Type title"
              />
            </div>
          </div>

          {errors.confirmPassword && <p>Password does not match.</p>}
        </div>

        <div className="mt-6">
          <Button label="Create account" onClick={handleSubmit(onSubmit)} />
        </div>

        <div className="flex-row justify-center mt-2">
          <p>Already have an account? </p>
          <LinkButton label="Log in" href="/login" />
        </div>
      </div>
    </Layout>
  );
};

export default Register;
