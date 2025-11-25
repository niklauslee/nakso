import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface EditableTextProps extends React.HTMLProps<HTMLDivElement> {
  editable?: boolean;
  value: string;
  onValueChange?: (value: string) => Promise<void>;
}

export interface EditableTextHandle {
  startEdit: () => void;
}

export const EditableText = forwardRef<EditableTextHandle, EditableTextProps>(
  ({ editable = true, value, onValueChange, className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const commitedRef = useRef(false);

    useEffect(() => {
      setCurrentValue(value);
    }, [value]);

    const startEdit = () => {
      if (!editable) return;
      commitedRef.current = true; // ignore blur events
      setEditMode(true);
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
      if (!editable) return;
      if (editMode) return;
      startEdit();
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitedRef.current = true;
        if (currentValue !== value) await onValueChange?.(currentValue);
        setTimeout(() => {
          setEditMode(false);
        }, 10);
      } else if (e.key === "Escape") {
        commitedRef.current = true;
        setEditMode(false);
        setCurrentValue(value);
      }
    };

    const handleBlur = () => {
      if (commitedRef.current) {
        commitedRef.current = false;
        return;
      }
      setEditMode(false);
      if (currentValue !== value) onValueChange?.(currentValue);
    };

    return (
      <>
        <input
          ref={inputRef}
          className={cn(
            "inline-block border-none outline-0",
            className,
            !editMode && "hidden"
          )}
          value={currentValue}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onDoubleClick={handleDoubleClick}
        />
        <span
          className={cn(
            "inline-block text-nowrap",
            className,
            editMode && "hidden"
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
