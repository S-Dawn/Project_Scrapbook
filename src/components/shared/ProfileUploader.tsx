import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";
import { SmartImage } from "@/components/shared";

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  imageId?: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl, imageId }: ProfileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} className="cursor-pointer" />      <div className="cursor-pointer flex-center gap-4">
        <SmartImage
          src={fileUrl}
          alt="image"
          imageId={imageId}
          className="h-24 w-24 rounded-full object-cover object-top"
          fallbackSrc="/assets/icons/profile-placeholder.svg"
        />
        <p className="text-primary-500 small-regular md:bbase-semibold">
          Change profile photo
        </p>
      </div>
    </div>
  );
};

export default ProfileUploader;
