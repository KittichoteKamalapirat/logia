import { forwardRef } from "react";
import {
  ChangeHandler,
  FieldError,
  RefCallBack,
  UseFormRegisterReturn,
} from "react-hook-form";
import getErrorMessage from "../../utils/getErrorMessage";
export type { ChangeHandler } from "react-hook-form";
import FormFieldLabel from "../FormFieldLabel";
import FormHelperText from "../FormHelperText";
import styles from "./TextAreaField.module.css";

export enum TextAreaFieldTypes {
  FILLED = "filled",
  OUTLINED = "outlined",
  TEXT = "text",
}
interface Props {
  disabled?: boolean;
  ariaLabel?: string;
  error?: FieldError;
  extraClass?: string;
  helperText?: string;
  isError?: boolean;
  label?: string;
  labelClass?: string;
  labelFontColour?: string;
  optionalLabelStyle?: string;
  name?: string;
  onBlur?: ChangeHandler;
  onChange?: ChangeHandler;
  nonReactHookFormOnChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  type?: TextAreaFieldTypes;
  value?: string;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

const useClassNames = (
  type: TextAreaFieldTypes,
  extraClass: string,
  displayError: boolean,
  disabled: boolean
) => {
  const disabledBaseStyles = disabled ? "cursor-not-allowed opacity-60" : "";
  const disabledStyles = disabled ? `bg-grey-90 ${disabledBaseStyles}` : "";

  const commonInputClass = `${styles.input} ${disabledStyles} w-full appearance-none focus:outline-none`;

  const commonInputDivClass = `flex justify-between items-center appearance-none border rounded w-full ${disabledStyles} text-gray-700 text-xxs focus:outline-none ${extraClass}`;

  switch (type) {
    case TextAreaFieldTypes.OUTLINED:
      return {
        inputClass: commonInputClass,
        inputDivClass: `px-2.5 ${commonInputDivClass} ${
          displayError ? "border-red-500" : "border-grey-225"
        }`,
        labelBaseClass: disabledBaseStyles,
      };

    case TextAreaFieldTypes.TEXT:
      return {
        inputClass: `bg-white ${commonInputClass}`,
        inputDivClass: `w-full ${
          displayError ? "border-red-500" : "border-grey-225 "
        }`,
        labelBaseClass: disabledBaseStyles,
      };

    case TextAreaFieldTypes.FILLED:
    default:
      return {
        inputClass: commonInputClass,
        inputDivClass: `p-2.5 ${commonInputDivClass} ${
          displayError ? "border-red-500" : "border-grey-225"
        }`,
        labelBaseClass: disabledBaseStyles,
      };
  }
};

/* eslint-disable @typescript-eslint/no-empty-function */
const noopCallback = async () => {};
const nullRefCallback: RefCallBack = (_instance) => {};
/* eslint-enable @typescript-eslint/no-empty-function */

const TextAreaField = forwardRef(
  (
    {
      error,
      extraClass = "",
      helperText = "",
      disabled = false,
      isError: isInputError = false,
      label = "",
      ariaLabel = "",
      labelFontColour = "text-grey-420",
      optionalLabelStyle = "",
      labelClass = "mb-2",
      name = "",
      onBlur,
      onChange,
      placeholder = "",
      type = TextAreaFieldTypes.FILLED,
      value,
      rows = 5,
      required = false,
      maxLength,
      nonReactHookFormOnChange,
      autoFocus = false,
      inputRef,
      ...inputFields
    }: Props,
    ref
  ) => {
    // styling
    const isError = !!error || isInputError;
    const { inputClass, inputDivClass, labelBaseClass } = useClassNames(
      type,
      extraClass,
      isError,
      disabled
    );

    const errorMessage = getErrorMessage(label || name, error);
    const formRegisterFields: UseFormRegisterReturn | undefined = (() => {
      // react-hook-form not required when nonReactHookFormOnChange is provided
      if (nonReactHookFormOnChange) return undefined;

      return {
        onChange: onChange || noopCallback,
        onBlur: onBlur || noopCallback,
        ref: (ref as RefCallBack) || nullRefCallback,
        name: name || label || "",
        ...inputFields,
      };
    })();

    return (
      <>
        <FormFieldLabel
          label={label}
          ariaLabel={ariaLabel}
          extraClass={`${labelClass} ${labelBaseClass}`}
          fontColour={labelFontColour}
          displayOptionalLabel={!required}
          optionalLabelStyle={optionalLabelStyle}
        />
        <div
          aria-label={`${ariaLabel || label || name}-label`}
          className={inputDivClass}
        >
          <textarea
            ref={inputRef}
            autoFocus={autoFocus}
            maxLength={maxLength}
            required={required}
            placeholder={placeholder}
            aria-label={ariaLabel || label || name}
            className={inputClass}
            value={value}
            rows={rows}
            disabled={disabled}
            onChange={nonReactHookFormOnChange}
            {...formRegisterFields}
          />
        </div>
        <FormHelperText
          isError={isError}
          helperText={errorMessage || helperText}
        />
      </>
    );
  }
);

export default TextAreaField;
