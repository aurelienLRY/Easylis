import { Editor, IAllProps } from "@tinymce/tinymce-react";

interface DynamicEditorProps extends Omit<IAllProps, "init"> {
  textareaName: string;
  apiKey?: string;
  initialValue: string;
  init?: IAllProps["init"];
  onEditorChange: (content: string) => void;
}

const defaultInit = {
  height: 300,
  menubar: false,
  plugins: ["lists", "emoticons"],
  toolbar:
    "undo redo | bold italic underline | alignleft aligncenter alignright alignfull | numlist bullist | emoticons",
  language: "fr_FR",
  browser_spellcheck: true,
};

export default function DynamicEditor({
  textareaName,
  apiKey,
  initialValue,
  init = defaultInit,
  onEditorChange,
}: DynamicEditorProps) {
  return (
    <Editor
      textareaName={textareaName}
      apiKey={apiKey}
      initialValue={initialValue}
      init={init}
      onEditorChange={onEditorChange}
    />
  );
}
