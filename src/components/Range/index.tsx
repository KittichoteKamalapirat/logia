import React, { ReactNode } from "react";

interface Props {
  label?: string | ReactNode;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Range = ({
  value = 0,
  label = "",
  min,
  unit = "",
  max,
  step = 0.1,
  onChange,
  onInput,
}: Props) => {
  return (
    <div className="flex items-center">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </label>

      <div className="grid grid-cols-6 items-center gap-1 w-full">
        <input
          id="default-range"
          type="range"
          min={min}
          step={step}
          max={max}
          value={value}
          onChange={onChange}
          onInput={onInput}
          className="col-span-5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <p className="col-span-1 text-primary-500 text-xl ml-2 font-bold">
          {Math.round(value * 10) / 10} {unit}
        </p>
      </div>
    </div>
  );
};
export default Range;
