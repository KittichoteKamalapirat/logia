import React from "react";

interface Props {
  percent: number;
}

const ProgressBar = ({ percent }: Props) => {
  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className="bg-primary-primary text-grey-0 font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
        style={{ width: `${percent}%` }}
      >
        {percent}%
      </div>
    </div>
  );
};
export default ProgressBar;
