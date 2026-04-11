import React, { useRef, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

interface FileUploadProps {
  onChange?: (files: File[]) => void;
  name?: string;
  label?: string;
  error?: string;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export const FileUpload = ({
  onChange,
  name = "file-upload",
  label,
  error,
  accept = "image/*",
  disabled = false,
  multiple = false,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);
    onChange?.(nextFiles);
  };

  const openPicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="text-sm font-light opacity-70">
          {label}
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          const droppedFiles = Array.from(event.dataTransfer.files || []);
          updateFiles(multiple ? droppedFiles : droppedFiles.slice(0, 1));
        }}
        className={`rounded-md border border-gray-300 bg-white py-4 px-4 text-gray-700 outline-none transition-all duration-200 max-w-80 mx-auto ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer focus:border-sky-500 focus:shadow-md focus:shadow-sky-500"
        } ${isDragging ? "border-sky-500 shadow-md shadow-sky-500" : ""}`}
      >
        <input
          ref={fileInputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          multiple={multiple}
          onChange={(event) => {
            const selected = Array.from(event.target.files || []);
            updateFiles(multiple ? selected : selected.slice(0, 1));
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <MdCloudUpload className="text-4xl text-sky-600" />
          <p className="text-sm font-medium">
            Glissez vos photos ici ou cliquez pour sélectionner
          </p>
          {!!files.length && (
            <p className="text-xs opacity-70">
              {files.length} photo(s) sélectionnée(s)
            </p>
          )}
        </div>
      </div>

      {!!error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
