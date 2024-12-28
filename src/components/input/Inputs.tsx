/* LIBRAIRIES */
import React from "react";
import { useFormContext } from "react-hook-form";
import { getNestedValue } from "@/utils/customLoadash.utils";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

/**
 * ErrorMessage Component for Inputs
 * @param errorMessage: string
 */
const ErrorMessage = ({ errorMessage }: { errorMessage: string }) => {
  if (!errorMessage) return null;
  return (
    <span role="alert" className="text-red-400 text-sm min-h-3 text-center">
      {errorMessage}
    </span>
  );
};
/**
 * Wrapper Component for Inputs
 * @param children: React.ReactNode
 * @param className: string
 * @param wIsRaw: boolean (default: false)
 */
const Wrapper = ({
  children,
  className,
  wIsRaw = true,
}: {
  children: React.ReactNode;
  className?: string;
  wIsRaw?: boolean;
}) => {
  return (
    <div
      className={`flex ${
        wIsRaw
          ? "flex-col md:flex-row md:items-center md:text-right items-start gap-0 md:gap-2"
          : " flex-col items-start gap-0 "
      } flex-1  ${className}`}
    >
      {children}
    </div>
  );
};

type TInputBase = {
  wIsRaw?: boolean;
  name: string;
  placeholder?: string;
  label?: string;
  className?: string;
  errorsName?: string;
  disabled?: boolean;
};

type InputProps = TInputBase & {
  type: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string | number;
};

/**
 * Input Component
 * @param name: string
 * @param type: string
 * @param placeholder: string
 * @param label: string
 * @param className: string
 * @param onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
 * @param errorsName: string
 */
export const Input = ({
  name,
  type,
  disabled = false,
  placeholder,
  label,
  className,
  onChange,
  defaultValue,
  errorsName = name,
  wIsRaw = true,
}: InputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // Utiliser useFormContext pour accéder à register et errors

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <Wrapper wIsRaw={wIsRaw} className={className && className}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-light opacity-70 min-w-28  "
        >
          {label}
        </label>
      )}
      <div className="flex flex-col flex-1 gap-0 w-full">
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          onChange={onChange}
          className={`${ClassNameForInput(errorMessage)} ${
            disabled ? "opacity-70" : ""
          }  ${type === "number" ? "max-w-40" : ""}`}
          aria-invalid={errorMessage ? "true" : "false"}
          disabled={disabled}
          defaultValue={defaultValue}
        />
        <ErrorMessage errorMessage={errorMessage} />
      </div>
    </Wrapper>
  );
};

/**
 * SelectInput Component
 * @param name: string
 * @param options: { id: string; name: string }[]
 * @param label: string
 * @param className: string
 * @param errorsName: string
 */
export const SelectInput = ({
  name,
  options,
  label,
  className,
  errorsName = name,
  disabled = false,
  wIsRaw = true,
}: TInputBase & {
  options: { id: string; name: string }[];
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <Wrapper wIsRaw={wIsRaw} className={className}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-light opacity-70 min-w-5 max-w-20 "
        >
          {label}
        </label>
      )}
      <div className="flex flex-col gap-0 max-w-2/3">
        <select
          id={name}
          {...register(name)}
          className={`${ClassNameForInput(errorMessage)} ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        >
          <option value="">Sélectionnez une option</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ErrorMessage errorMessage={errorMessage} />
      </div>
    </Wrapper>
  );
};

/**
 * CheckboxInput Component
 * @param name: string
 * @param value: string
 * @param label: string
 * @param checked: boolean
 * @param onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
 * @param className: string
 * @param errorsName: string
 */
export const CheckboxInput = ({
  name,
  value,
  label,
  className,
  errorsName = name,
  checked,
  onChange,
}: TInputBase & {
  value?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        type="checkbox"
        value={value}
        {...register(name)}
        checked={checked}
        onChange={onChange}
        className={`mr-2 ${
          errorMessage
            ? "border-red-500 shadow-md shadow-red-500"
            : "focus:border-sky-500 focus:shadow-md focus:shadow-sky-500"
        }`}
        aria-invalid={errorMessage ? "true" : "false"}
      />
      {label && (
        <label htmlFor={name} className="text-sm font-light opacity-70">
          {label}
        </label>
      )}
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
};

/**
 * SimpleCheckboxInput Component
 * @param name: string
 * @param value: string
 * @param label: string
 * @param className: string
 * @param errorsName: string
 */
export const SimpleCheckboxInput = ({
  name,
  value,
  label,
  className,
  errorsName = name,
}: TInputBase & {
  value?: string;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        type="checkbox"
        value={value}
        {...register(name)}
        className={`mr-2 ${
          errorMessage
            ? "border-red-500 shadow-md shadow-red-500"
            : "focus:border-sky-500 focus:shadow-md focus:shadow-sky-500"
        }`}
        aria-invalid={errorMessage ? "true" : "false"}
      />
      {label && (
        <label htmlFor={name} className="text-sm font-light opacity-70">
          {label}
        </label>
      )}
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
};

/**
 * Textarea Component
 * @param name: string
 * @param label: string
 * @param className: string
 * @param placeholder: string
 * @param errorsName: string
 */
export const Textarea = ({
  name,
  label,
  className,
  placeholder,
  errorsName = name,
  rows = 3,
  cols = 30,
  wIsRaw = true,
}: {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
  errorsName?: string;
  rows?: number;
  cols?: number;
  wIsRaw?: boolean;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <Wrapper wIsRaw={wIsRaw} className={className}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-light opacity-70 min-w-28"
        >
          {label}
        </label>
      )}

      <textarea
        id={name}
        placeholder={placeholder}
        {...register(name)}
        className={ClassNameForInput(errorMessage)}
        aria-invalid={errorMessage ? "true" : "false"}
        rows={rows}
        cols={cols}
      />
      <ErrorMessage errorMessage={errorMessage} />
    </Wrapper>
  );
};

export const InputPhone = ({
  name,
  label,
  className,
  errorsName = name,
  wIsRaw = true,
}: TInputBase & {}) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const errorMessage = getNestedValue(errors, errorsName)?.message as string;

  return (
    <Wrapper wIsRaw={wIsRaw} className={className && className}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-light opacity-70 min-w-28 "
        >
          {label}
        </label>
      )}
      <div className="flex flex-col flex-1 gap-0 w-full ">
        <PhoneInput
          {...register(name)}
          name={name}
          preferredCountries={[
            "fr",
            "en",
            "be",
            "it",
            "de",
            "es",
            "pt",
            "nl",
            "pl",
            "pt",
            "ro",
            "sk",
            "tr",
          ]}
          forceDialCode={true}
          defaultCountry="fr"
          onChange={(value) => setValue(name, value)}
          value={getValues(name)}
          style={{
            border: "none",
            padding: "0",
          }}
          inputStyle={{
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
          className={
            errorMessage
              ? "border-red-500 shadow-md shadow-red-500"
              : "focus:border-sky-500 focus:shadow-md focus:shadow-sky-500"
          }
        />
        <ErrorMessage errorMessage={errorMessage} />
      </div>
    </Wrapper>
  );
};
/**
 * ClassNameForInput Function
 * @param errorMessage: string
 * @returns string
 */
const ClassNameForInput = (errorMessage: string) => {
  return `rounded-md border border-gray-300 bg-white py-2 px-2 md:px-6  text-base font-medium text-gray-700 outline-none transition-all duration-200 ${
    errorMessage
      ? "border-red-500 shadow-md shadow-red-500"
      : "focus:border-sky-500 focus:shadow-md focus:shadow-sky-500"
  }`;
};
