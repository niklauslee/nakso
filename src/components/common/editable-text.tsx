import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface EditableTextProps extends React.HTMLProps<HTMLDivElement> {
  value: string;
  onValueChange?: (value: string) => Promise<void>;
}

export interface EditableTextHandle {
  startEdit: () => void;
}

export const EditableText = forwardRef<EditableTextHandle, EditableTextProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [editable, setEditable] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const commitedRef = useRef(false);

    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const startEdit = () => {
      commitedRef.current = true; // ignore blur events
      setEditable(true);
      setTimeout(() => {
        commitedRef.current = false; // care blur events
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    };

    useImperativeHandle(ref, () => ({
      startEdit,
    }));

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(e.target.value);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      startEdit();
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitedRef.current = true;
        if (currentValue !== value) await onValueChange?.(currentValue);
        setTimeout(() => {
          setEditable(false);
        }, 10);
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
          className={cn(
            "inline-block text-nowrap",
            className,
            editable && "hidden"
          )}
          onDoubleClick={handleDoubleClick}
          {...props}
        >
          {value}
        </span>
      </>
    );
  }
);
