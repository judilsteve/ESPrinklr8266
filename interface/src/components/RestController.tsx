import React, { useState } from 'react';
import { withSnackbar, WithSnackbarProps } from 'notistack';

import { redirectingAuthorizedFetch } from '../authentication';

export interface RestControllerProps<D> extends WithSnackbarProps {
  handleValueChange: (name: keyof D) => (event: React.ChangeEvent<HTMLInputElement>) => void;

  setData: (data: D, callback?: () => void) => void;
  saveData: () => void;
  loadData: () => void;

  data?: D;
  loading: boolean;
  errorMessage?: string;
}

export const extractEventValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  switch (event.target.type) {
    case "number":
      return event.target.valueAsNumber;
    case "checkbox":
      return event.target.checked;
    default:
      return event.target.value
  }
}

export function restController<D, P extends RestControllerProps<D>>(endpointUrl: string, RestController: React.ComponentType<P & RestControllerProps<D>>) {
  return withSnackbar(
    (props : Omit<P, keyof RestControllerProps<D>> & WithSnackbarProps) => {

        const [data, setData] = useState<D | undefined>(undefined);
        const [loading, setLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

        const setNewData = (newData: D) => {
            setData(newData);
            setErrorMessage(undefined);
            setLoading(false);
        }

        const { enqueueSnackbar } = props;

        const loadData = async () => {
            setLoading(true);
            setData(undefined);
            setErrorMessage(undefined);
            try {
                const response = await redirectingAuthorizedFetch(endpointUrl);
                if (response.status === 200) {
                    const json = await response.json();
                    setData(json as D);
                } else throw Error("Invalid status code: " + response.status);
            } catch(error) {
                const errorMessage = error.message || "Unknown error";
                enqueueSnackbar(`Problem fetching: ${errorMessage}`, { variant: 'error' });
                setData(undefined);
                setErrorMessage(errorMessage);
            }
            setLoading(false);
        };

        const saveData = async () => {
            setLoading(true);
            const response = await redirectingAuthorizedFetch(endpointUrl, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            try {
                if (response.status === 200) {
                    const json = await response.json();
                    enqueueSnackbar("Update successful.", { variant: 'success' });
                    setData(json as D);
                    setErrorMessage(undefined);
                }
                else throw Error("Invalid status code: " + response.status);
            } catch(error) {
                const errorMessage = error.message || "Unknown error";
                enqueueSnackbar(`Problem updating: ${errorMessage}`, { variant: 'error' });
                setData(undefined);
                setErrorMessage(errorMessage);
            }
            setLoading(false);
        }

        const handleValueChange = (name: keyof D) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const newData = { ...data!, [name]: extractEventValue(event) };
            setData(newData);
        }

        return <RestController
            data={data}
            errorMessage={errorMessage}
            {...props as P}
            loading={loading}
            handleValueChange={handleValueChange}
            setData={setNewData}
            saveData={saveData}
            loadData={loadData}
            />;
  });
}
