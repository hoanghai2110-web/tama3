"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const suggestedActions = [
  {
    title: "Hướng dẫn mẹo học tập giúp tiếp thu nhanh",
    label: "Giúp bạn học hiệu quả hơn!",
    action: "Hãy chia sẻ một mẹo học tập giúp hiểu bài nhanh và nhớ lâu hơn!",
  },
  {
    title: "Trò đùa hài hước giúp thư giãn sau giờ học",
    label: "Kể một câu chuyện cười nào!",
    action: "Bạn có thể kể một câu chuyện cười thú vị giúp thư giãn không?",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });
    setAttachments([]);
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;
        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );
        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className="relative w-full max-w-[50rem] flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[500px]">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="border-none bg-gray-100 dark:bg-gray-800 w-full text-left border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ease-out flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-gray-500 dark:text-gray-400">{suggestedAction.label}</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll pb-2">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

     <div className="relative">
  <Textarea
    ref={textareaRef}
    placeholder="What do you want to know?"
    value={input}
    onChange={handleInput}
    className="min-h-[24px] h-[110px] w-full resize-none rounded-2xl text-base bg-white dark:bg-[hsl(var(--muted)/.5)] border border-gray-300 dark:border-gray-700 shadow-sm transition-all duration-200 ease-out hover:border-gray-400 dark:hover:border-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 py-4 px-4"
    rows={5}
    onKeyDown={(event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (isLoading) {
          toast.error("Please wait for the model to finish its response!");
        } else {
          submitForm();
        }
      }
    }}
  />

        {isLoading ? (
          <Button
            className="rounded-full p-2 size-8 absolute bottom-3 right-3 bg-gray-800 text-white hover:bg-black transition-all duration-200 ease-out hover:scale-105"
            onClick={(event) => {
              event.preventDefault();
              stop();
            }}
          >
            <StopIcon size={14} />
          </Button>
        ) : (
          <Button
            className="rounded-full p-2 size-8 absolute bottom-3 right-3 bg-black text-white hover:bg-gray-900 transition-all duration-200 ease-out hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={(event) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0 || uploadQueue.length > 0}
          >
            <ArrowUpIcon size={14} />
          </Button>
        )}

        <Button
          className="rounded-full p-2 size-8 absolute bottom-3 right-14 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-out hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={(event) => {
            event.preventDefault();
            fileInputRef.current?.click();
          }}
          variant="outline"
          disabled={isLoading}
        >
          <PaperclipIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
