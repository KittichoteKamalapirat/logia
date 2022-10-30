import React, { ReactNode } from "react";

interface Props {
  content: ReactNode;
  color?: string;
  bg?: string;
  extraClass?: string;
  size?: "sm" | "md" | "lg";
}

const Tag = ({
  content,
  extraClass = "",
  size = "md",
  color = "text-primary-primary",
}: Props) => {
  const sizeStyle = (() => {
    switch (size) {
      case "sm":
        return "px-1 py-0.2 text-sm";
      case "lg":
        return "px-1 py-1 text-lg";

      default:
        return "px-1 text-md";
    }
  })();
  return (
    <div
      aria-label="tag-icon"
      className={`m-0.5 w-fit border-2 border-primary-primary border-solid rounded-md ${color} ${sizeStyle} ${extraClass} `}
    >
      {content}
    </div>
  );
};
export default Tag;
