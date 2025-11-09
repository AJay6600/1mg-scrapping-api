import React from "react";
import type { UploadChangeParam, UploadProps } from "antd/lib/upload";
import { useController, type UseControllerProps } from "react-hook-form";
import { Upload as AntdUpload } from "antd";

const { Dragger } = AntdUpload;

// This is the type of props coming from parent component
type UploadComponentPropsType = {
  // Name is the name of upload field in the form
  name: string;
  // prop use to make upload button dynamic
  children: React.ReactNode;
  // This is the controller props of react-hook-form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rhfControllerProps: Omit<UseControllerProps<any>, "name">;
  /* prop to decide if the field is valid or not */
  hasError?: boolean;
  // This is the props for upload field
  antdUploadProps?: Omit<
    UploadProps,
    "onChange" | "onRemove" | "beforeUpload" | "fileList" | "maxCount"
  >;
  // This function is called when functionality is different from the regular onChange
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rhfOnChange: (...event: any[]) => void,
    info: UploadChangeParam
  ) => void;
};

// upload functional component
export const Upload = ({
  name,
  rhfControllerProps,
  antdUploadProps,
  children,
  hasError,
  onChange,
}: UploadComponentPropsType) => {
  // form controllers to handle companyRegistration form field values
  const { field } = useController({ name, ...rhfControllerProps });

  // destructuring react hook form onChange function from field
  const { onChange: rhfOnChange } = field;

  return (
    // <div className="flex flex-col gap-2">
    <Dragger
      className="flex flex-col gap-2"
      style={{ borderColor: hasError ? "red" : "" }}
      onChange={(info) => {
        if (onChange) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          onChange(rhfOnChange, info);
        } else {
          rhfOnChange({ file: info.file, fileList: info.fileList });
        }
      }}
      beforeUpload={() => false}
      onRemove={() => {
        rhfOnChange({ file: null, fileList: [] });
        return false;
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      fileList={field.value ? field.value.fileList : []}
      // maxCount to upload only one file and replace existing incase use try to upload other
      maxCount={1}
      {...antdUploadProps}
    >
      {children}
    </Dragger>
    // </div>
  );
};

Upload.defaultProps = {
  antdUploadProps: {},
  onChange: undefined,
  hasError: false,
};

export default Upload;
