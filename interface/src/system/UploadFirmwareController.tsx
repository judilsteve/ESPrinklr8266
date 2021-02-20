import React, { useEffect, useState } from 'react';

import { SectionContent } from '../components';
import { UPLOAD_FIRMWARE_ENDPOINT } from '../api';

import UploadFirmwareForm from './UploadFirmwareForm';
import { redirectingAuthorizedUpload } from '../authentication';
import { withSnackbar, WithSnackbarProps } from 'notistack';

const UploadFirmwareController = (props: WithSnackbarProps) => {

    const [xhr, setXhr] = useState<XMLHttpRequest | undefined>(undefined);
    const [progress, setProgress] = useState<ProgressEvent | undefined>(undefined);

    useEffect(() => {
        return () => xhr?.abort();
    }, [xhr]);

    const uploadFile = (file: File) => {
        if (xhr) {
            return;
        }
        let upload = new XMLHttpRequest();
        setXhr(upload);
        redirectingAuthorizedUpload(upload, UPLOAD_FIRMWARE_ENDPOINT, file, setProgress).then(() => {
            if (upload.status !== 200) {
                throw Error("Invalid status code: " + upload.status);
            }
            props.enqueueSnackbar("Activating new firmware", { variant: 'success' });
            setProgress(undefined);
            setXhr(undefined);
        }).catch((error: Error) => {
            if (error.name === 'AbortError') {
                props.enqueueSnackbar("Upload cancelled by user", { variant: 'warning' });
            } else {
                const errorMessage = error.name === 'UploadError' ? "Error during upload" : (error.message || "Unknown error");
                props.enqueueSnackbar("Problem uploading: " + errorMessage, { variant: 'error' });
                setProgress(undefined);
            setXhr(undefined);
            }
        });
    };

    const cancelUpload = () => {
        if (xhr) {
            xhr.abort();
            setProgress(undefined);
            setXhr(undefined);
        }
    }

    return (
      <SectionContent title="Upload Firmware">
        <UploadFirmwareForm onFileSelected={uploadFile} onCancel={cancelUpload} uploading={!!xhr} progress={progress} />
      </SectionContent>
    );

}

export default withSnackbar(UploadFirmwareController);
