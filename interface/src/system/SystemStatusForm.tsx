import React, { Fragment, useState } from 'react';

import { Avatar, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@material-ui/core';
import { List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';

import DevicesIcon from '@material-ui/icons/Devices';
import MemoryIcon from '@material-ui/icons/Memory';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import FolderIcon from '@material-ui/icons/Folder';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import AppsIcon from '@material-ui/icons/Apps';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';

import { redirectingAuthorizedFetch, AuthenticatedContextProps, withAuthenticatedContext } from '../authentication';
import { RestFormProps, FormButton, ErrorButton } from '../components';
import { FACTORY_RESET_ENDPOINT, RESTART_ENDPOINT } from '../api';

import { SystemStatus, EspPlatform } from './types';

interface SystemStatusFormState {
  confirmRestart: boolean;
  confirmFactoryReset: boolean;
  processing: boolean;
}

type SystemStatusFormProps = AuthenticatedContextProps & RestFormProps<SystemStatus>;

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

const SystemStatusForm = (props: SystemStatusFormProps) => {

    const [confirmRestart, setConfirmRestart] = useState(false);
    const [confirmFactoryReset, setConfirmFactoryReset] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { data } = props;
    const listItems = (
      <>
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <DevicesIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Device (Platform / SDK)" secondary={data.esp_platform + ' / ' + data.sdk_version} />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <ShowChartIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="CPU Frequency" secondary={data.cpu_freq_mhz + ' MHz'} />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <MemoryIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Heap (Free / Max Alloc)" secondary={formatNumber(data.free_heap) + ' / ' + formatNumber(data.max_alloc_heap) + ' bytes ' + (data.esp_platform === EspPlatform.ESP8266 ? '(' + data.heap_fragmentation + '% fragmentation)' : '')} />
        </ListItem>
        {
          (data.esp_platform === EspPlatform.ESP32 && data.psram_size > 0) && (
            <Fragment>
              <Divider variant="inset" component="li" />
              <ListItem >
                <ListItemAvatar>
                  <Avatar>
                    <AppsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="PSRAM (Size / Free)" secondary={formatNumber(data.psram_size) + ' / ' + formatNumber(data.free_psram) + ' bytes'} />
              </ListItem>
            </Fragment>)
        }
        <Divider variant="inset" component="li" />
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <DataUsageIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Sketch (Size / Free)" secondary={formatNumber(data.sketch_size) + ' / ' + formatNumber(data.free_sketch_space) + ' bytes'} />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <SdStorageIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Flash Chip (Size / Speed)" secondary={formatNumber(data.flash_chip_size) + ' bytes / ' + (data.flash_chip_speed / 1000000).toFixed(0) + ' MHz'} />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem >
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="File System (Used / Total)" secondary={formatNumber(data.fs_used) + ' / ' + formatNumber(data.fs_total) + ' bytes (' + formatNumber(data.fs_total - data.fs_used) + '\xa0bytes free)'} />
        </ListItem>
        <Divider variant="inset" component="li" />
      </>
    );

    const onRestartConfirmed = () => {
        setProcessing(true);
        redirectingAuthorizedFetch(RESTART_ENDPOINT, { method: 'POST' })
            .then(response => {
                if (response.status === 200) {
                    props.enqueueSnackbar("Device is restarting", { variant: 'info' });
                    setConfirmRestart(false);
                    setProcessing(false);
                } else {
                    throw Error("Invalid status code: " + response.status);
                }
            })
            .catch(error => {
                props.enqueueSnackbar(error.message || "Problem restarting device", { variant: 'error' });
                setConfirmRestart(false);
                setProcessing(false);
            });
      }

    const restartDialog = (
        <Dialog
            open={confirmRestart}
            onClose={() => setConfirmRestart(false)}
        >
            <DialogTitle>Confirm Restart</DialogTitle>
            <DialogContent dividers>
            Are you sure you want to restart the device?
            </DialogContent>
            <DialogActions>
            <Button variant="contained" onClick={() => setConfirmRestart(false)} color="secondary">
                Cancel
            </Button>
            <Button startIcon={<PowerSettingsNewIcon />} variant="contained" onClick={onRestartConfirmed} disabled={processing} color="primary" autoFocus>
                Restart
            </Button>
            </DialogActions>
        </Dialog>
        );

    const onFactoryResetConfirmed = () => {
        setProcessing(true);
        redirectingAuthorizedFetch(FACTORY_RESET_ENDPOINT, { method: 'POST' })
        .then(response => {
            if (response.status === 200) {
            props.enqueueSnackbar("Factory reset in progress.", { variant: 'error' });
            setProcessing(false);
            setConfirmFactoryReset(false);
            } else {
            throw Error("Invalid status code: " + response.status);
            }
        })
        .catch(error => {
            props.enqueueSnackbar(error.message || "Problem factory resetting device", { variant: 'error' });
            setProcessing(false);
            setConfirmFactoryReset(false);
        });
    }

    const factoryResetDialog = (
      <Dialog
        open={confirmFactoryReset}
        onClose={() => setConfirmFactoryReset(false)}
      >
        <DialogTitle>Confirm Factory Reset</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to reset the device to its factory defaults?
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setConfirmFactoryReset(false)} color="secondary">
            Cancel
          </Button>
          <ErrorButton startIcon={<SettingsBackupRestoreIcon />} variant="contained" onClick={onFactoryResetConfirmed} disabled={processing} autoFocus>
            Factory Reset
          </ErrorButton>
        </DialogActions>
      </Dialog>
    )

    const me = props.authenticatedContext.me;
    return (
      <Fragment>
        <List>
          {listItems}
        </List>
        <Box display="flex" flexWrap="wrap">
          <Box flexGrow={1} padding={1}>
            <FormButton startIcon={<RefreshIcon />} variant="contained" color="secondary" onClick={props.loadData}>
              Refresh
            </FormButton>
          </Box>
          {me.admin &&
            <Box flexWrap="none" padding={1} whiteSpace="nowrap">
              <FormButton startIcon={<PowerSettingsNewIcon />} variant="contained" color="primary" onClick={() => setConfirmRestart(true)}>
                Restart
              </FormButton>
              <ErrorButton startIcon={<SettingsBackupRestoreIcon />} variant="contained" onClick={() => setConfirmFactoryReset(true)}>
                Factory reset
              </ErrorButton>
            </Box>
          }
        </Box>
        {restartDialog}
        {factoryResetDialog}
      </Fragment>
    );

}

export default withAuthenticatedContext(SystemStatusForm);
