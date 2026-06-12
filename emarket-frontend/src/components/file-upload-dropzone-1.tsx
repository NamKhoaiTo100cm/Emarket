"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

export const title = "Basic Dropzone";

interface Props {
  fileType: string;
  onFilesChange: (files: File[]) => void;
  images?: any[];
}

const FileUploadDropzone1 = ({ fileType, onFilesChange, images }: Props) => {
  const [files, setFiles] = React.useState<File[]>([]);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);


  async function urlToFile(
    url: string,
    fileName: string
  ): Promise<File> {
    const response = await fetch(url);

    const blob = await response.blob();

    return new File(
      [blob],
      fileName,
      {
        type: blob.type,
      }
    );
  }

  React.useEffect(() => {
    console.log('inputFiles', images)
    if (images) {
      Promise.all(
        images.map((item) => urlToFile(item.imageUrl, "photo_product_" + item.id))
      ).then((files) => {
        console.log('files', files)
        setFiles(files);
      });
    }
  }, [images]);

  React.useEffect(() => {
    if (fileType === "image") {
      onFilesChange(files);
    } else if (fileType === "video") {
      onFilesChange(files);
    }
  }, [files, onFilesChange, fileType]);

  return (
    <FileUpload
      accept={fileType === "image" ? "image/*" : "video/*"}
      maxFiles={5}
      maxSize={5 * 1024 * 1024}
      className="w-full"
      value={files}
      onValueChange={setFiles}
      onFileReject={onFileReject}
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground">
            Or click to browse (max 5 files, up to 5MB each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file}>
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <X className="size-4" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
};

export default FileUploadDropzone1;
