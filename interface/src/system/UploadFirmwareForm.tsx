import React, { Fragment } from 'react';
import { SingleUpload } from '../components';
import { Box } from '@material-ui/core';

interface UploadFirmwareFormProps {
  uploading: boolean;
  progress?: ProgressEvent;
  onFileSelected: (file: File) => void;
  onCancel: () => void;
}

const UploadFirmwareForm = (props : UploadFirmwareFormProps) => {

    const handleDrop = (files: File[]) => {
        const file = files[0];
        if (file) {
            props.onFileSelected(files[0]);
        }
    };

    const { uploading, progress, onCancel } = props;
    return (
      <Fragment>
        <Box py={2}>
          Upload a new firmware (.bin) file below to replace the existing firmware.
        </Box>
        <SingleUpload accept="application/octet-stream" onDrop={handleDrop} uploading={uploading} progress={progress} onCancel={onCancel} />
      </Fragment>
    );

}

export default UploadFirmwareForm;
