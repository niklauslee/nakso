import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

export interface TextFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  label?: React.ReactNode;
  value?: string | undefined;
  onChange?: (value: string) => void;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, id, title, disabled, value, onChange, className, type, ...props },
    ref
  ) => {
    const [state, setState] = useState<string>("");
    const internalId = nanoid();

    useEffect(() => {
      setState(value ?? "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && typeof state === "string" && onChange) {
        onChange(state);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof state === "string" && value !== state && onChange) {
        onChange(state);
      }
    };

    return (
      <span className="relative w-full">
        <input
          id={label ? internalId : id}
          title={title}
          type={type}
          value={state}
          className={cn(
            "flex h-7 w-full rounded-md border-input bg-accent px-2 py-1 text-xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            label && "pl-7",
            className
          )}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={internalId}
            className={cn(
              "absolute left-0 top-0 w-7 h-7 font-normal flex justify-center items-center text-xs bg-transparent text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
            title={title}
          >
            {label}
          </label>
        )}
      </span>
    );
  }
);
TextField.displayName = "TextField";
