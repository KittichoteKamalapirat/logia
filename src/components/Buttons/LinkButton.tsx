import { Link } from "react-router-dom";
import React, { ReactNode } from "react";
import Button, { ButtonTypes } from "./Button";

interface Props {
  label: string;
  pathname?: string;
  href?: any;
  leftIcon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  extraClass?: string;
  type?: ButtonTypes;
}

const LinkButton = ({
  label,
  href,
  pathname,
  leftIcon,
  extraClass,
  type = ButtonTypes.PRIMARY,
}: Props) => {
  return (
    <Link to={href || { pathname }}>
      <Button
        label={label}
        startIcon={leftIcon}
        type={type}
        extraClass={`${extraClass}`}
      />
    </Link>
  );
};

export default LinkButton;
