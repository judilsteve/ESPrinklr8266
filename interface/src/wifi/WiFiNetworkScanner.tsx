import React, { useEffect, useState } from 'react';
import { withSnackbar, WithSnackbarProps } from 'notistack';

import { createStyles, WithStyles, Theme, withStyles, Typography, LinearProgress } from '@material-ui/core';
import PermScanWifiIcon from '@material-ui/icons/PermScanWifi';

import { FormActions, FormButton, SectionContent } from '../components';
import { redirectingAuthorizedFetch } from '../authentication';
import { SCAN_NETWORKS_ENDPOINT, LIST_NETWORKS_ENDPOINT } from '../api';

import WiFiNetworkSelector from './WiFiNetworkSelector';
import { WiFiNetwork, WiFiNetworkList } from './types';

const NUM_POLLS = 10
const POLLING_FREQUENCY = 500
const RETRY_EXCEPTION_TYPE = "retry"

const styles = (theme: Theme) => createStyles({
  scanningSettings: {
    margin: theme.spacing(0.5),
  },
  scanningSettingsDetails: {
    margin: theme.spacing(4),
    textAlign: "center"
  },
  scanningProgress: {
    margin: theme.spacing(4),
    textAlign: "center"
  }
});

type WiFiNetworkScannerProps = WithSnackbarProps & WithStyles<typeof styles>;

let pollCount = 0;

const WiFiNetworkScanner = (props: WiFiNetworkScannerProps) => {

    const [scanningForNetworks, setScanningForNetworks] = useState(false);
    const [networkList, setNetworkList] = useState<WiFiNetworkList | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const schedulePollTimeout = () => {
        setTimeout(pollNetworkList, POLLING_FREQUENCY);
    }

    const pollNetworkList = () => {
        redirectingAuthorizedFetch(LIST_NETWORKS_ENDPOINT)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            }
            if (response.status === 202) {
                if (++pollCount < NUM_POLLS) {
                    schedulePollTimeout();
                    throw retryError;
                } else {
                    throw Error("Device did not return network list in timely manner.");
                }
            }
            throw Error("Device returned unexpected response code: " + response.status);
        })
        .then(json => {
            json.networks.sort(compareNetworks)
            setNetworkList(json);
            setErrorMessage(undefined);
            setScanningForNetworks(false);
        })
        .catch(error => {
            if (error.name !== RETRY_EXCEPTION_TYPE) {
                props.enqueueSnackbar("Problem scanning: " + error.message, {
                    variant: 'error',
                });
                setErrorMessage(error.message);
                setNetworkList(undefined);
                setScanningForNetworks(false);
            }
        });
    }

    const scanNetworks = () => {
        pollCount = 0;
        setScanningForNetworks(true);
        setNetworkList(undefined);
        setErrorMessage(undefined);
        redirectingAuthorizedFetch(SCAN_NETWORKS_ENDPOINT).then(response => {
            if (response.status === 202) {
                schedulePollTimeout();
                return;
            }
            throw Error("Scanning for networks returned unexpected response code: " + response.status);
        }).catch(error => {
            props.enqueueSnackbar("Problem scanning: " + error.message, {
                variant: 'error',
            });
            setScanningForNetworks(false);
            setNetworkList(undefined);
            setErrorMessage(error.message);
        });
    }

    useEffect(scanNetworks, []);

    const requestNetworkScan = () => {
        if (!scanningForNetworks) {
            scanNetworks();
        }
    };

    const retryError = {
        name: RETRY_EXCEPTION_TYPE,
        message: "Network list not ready, will retry in " + POLLING_FREQUENCY + "ms."
    };

    const compareNetworks = (network1: WiFiNetwork, network2: WiFiNetwork) => {
        if (network1.rssi < network2.rssi)
            return 1;
        if (network1.rssi > network2.rssi)
            return -1;
        return 0;
    }

    let networkScanner;
    const { classes } = props;
    if (scanningForNetworks || !networkList) {
        networkScanner = (
            <div className={classes.scanningSettings}>
            <LinearProgress className={classes.scanningSettingsDetails} />
            <Typography variant="h6" className={classes.scanningProgress}>
                Scanning&hellip;
            </Typography>
            </div>
        );
    } else if (errorMessage) {
        networkScanner = (
            <div className={classes.scanningSettings}>
            <Typography variant="h6" className={classes.scanningSettingsDetails}>
                {errorMessage}
            </Typography>
            </div>
        );
    } else {
        networkScanner = <WiFiNetworkSelector networkList={networkList} />;
    }

    return (
      <SectionContent title="Network Scanner">
        {networkScanner}
        <FormActions>
          <FormButton startIcon={<PermScanWifiIcon />} variant="contained" color="secondary" onClick={requestNetworkScan} disabled={scanningForNetworks}>
            Scan again&hellip;
          </FormButton>
        </FormActions>
      </SectionContent>
    );

}

export default withSnackbar(withStyles(styles)(WiFiNetworkScanner));
