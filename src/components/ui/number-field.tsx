import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  label?: React.ReactNode;
  value?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  selectValues?: number[];
  unit?: React.ReactNode;
  onChange?: (value: number) => void;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label,
      id,
      title,
      value,
      minValue,
      maxValue,
      step = 1,
      selectValues,
      unit,
      disabled,
      onChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [state, setState] = useState<string>("");
    const internalId = nanoid();

    useEffect(() => {
      setState(value?.toString() ?? "");
    }, [value]);

    const setValue = (value: number) => {
      setState(value.toString());
      if (onChange) onChange(value);
    };

    const checkValue = (value: number): number => {
      if (typeof minValue === "number" && value < minValue) return minValue;
      if (typeof maxValue === "number" && value > maxValue) return maxValue;
      return value;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onChange) {
        const parsed = checkValue(parseFloat(state));
        if (!Number.isNaN(parsed) && parsed !== value) {
          setState(parsed.toString());
          onChange(parsed);
        } else {
          setState(value?.toString() ?? "");
        }
      } else if (e.key === "ArrowUp") {
        const parsed = parseFloat(state);
        if (!Number.isNaN(parsed)) {
          setState(checkValue(parsed + step).toString());
        }
      } else if (e.key === "ArrowDown") {
        const parsed = parseFloat(state);
        if (!Number.isNaN(parsed)) {
          setState(checkValue(parsed - step).toString());
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        e.target.select();
      }, 10);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onChange) {
        const parsed = checkValue(parseFloat(state));
        if (!Number.isNaN(parsed) && parsed !== value) {
          setState(parsed.toString());
          onChange(parsed);
        } else {
          setState(value?.toString() ?? "");
        }
      }
    };

    return (
      <span className="relative">
        <input
          id={label ? internalId : id}
          title={title}
          className={cn(
            "flex h-7 w-full rounded-sm border-input bg-background px-2 py-1 text-xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            label && "pl-6",
            className,
          )}
          value={state}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={internalId}
            className={cn(
              "absolute left-0 top-0 w-6 h-full font-normal flex justify-center items-center text-xs bg-transparent text-muted-foreground/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
            title={title}
          >
            {label}
          </label>
        )}
        {selectValues && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <span
                  className={cn(
                    "absolute right-0 top-0 h-7 w-7 flex items-center justify-center cursor-pointer",
                    disabled &&
                      "cursor-not-allowed opacity-50 pointer-events-none",
                  )}
                />
              }
            >
              <ChevronDownIcon size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuPositioner align="end">
              <DropdownMenuContent className="w-14">
                {selectValues.map((val) => (
                  <DropdownMenuItem
                    onClick={() => setValue(val)}
                    key={val}
                    className="justify-end"
                  >
                    {val}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenu>
        )}
        {unit && (
          <span
            className={cn(
              "absolute right-0 top-0 h-7 w-7 flex items-center justify-center text-muted-foreground text-xs",
              disabled && "cursor-not-allowed opacity-50 pointer-events-none",
            )}
          >
            {unit}
          </span>
        )}
      </span>
    );
  },
);
NumberField.displayName = "NumberField";
