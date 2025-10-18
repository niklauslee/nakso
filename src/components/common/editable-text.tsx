import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface EditableTextProps extends React.HTMLProps<HTMLDivElement> {
  value: string;
  onValueChange?: (value: string) => void;
}

export function EditableText({
  value,
  onValueChange,
  className,
  ...props
}: EditableTextProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editable, setEditable] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const commitedRef = useRef(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };

  const handleDoubleClickCapture = (e: React.MouseEvent<HTMLSpanElement>) => {
    setEditable(true);
    commitedRef.current = false;
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitedRef.current = true;
      if (currentValue !== value) onValueChange?.(currentValue);
      setEditable(false);
    } else if (e.key === "Escape") {
      commitedRef.current = true;
      setEditable(false);
      setCurrentValue(value);
    }
  };

  const handleBlur = () => {
    if (commitedRef.current) {
      commitedRef.current = false;
      return;
    }
    setEditable(false);
    if (currentValue !== value) onValueChange?.(currentValue);
  };

  return (
    <>
      <input
        ref={inputRef}
        className={cn(
          "inline-block border-none outline-0",
          className,
          !editable && "hidden"
        )}
        value={currentValue}
        onChange={handleValueChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <span
        className={cn("inline-block", className, editable && "hidden")}
        onDoubleClickCapture={handleDoubleClickCapture}
        {...props}
      >
        {value}
      </span>
    </>
  );
}
