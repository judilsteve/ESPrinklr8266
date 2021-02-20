import React, { Fragment, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import UTC from 'dayjs/plugin/utc';

import { WithTheme, withTheme } from '@material-ui/core/styles';
import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Button } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@material-ui/core';

import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DNSIcon from '@material-ui/icons/Dns';
import UpdateIcon from '@material-ui/icons/Update';
import AvTimerIcon from '@material-ui/icons/AvTimer';
import RefreshIcon from '@material-ui/icons/Refresh';

import { RestFormProps, FormButton, HighlightAvatar } from '../components';
import { isNtpActive, ntpStatusHighlight, ntpStatus } from './NTPStatus';
import { NTPStatus, Time } from './types';
import { redirectingAuthorizedFetch, withAuthenticatedContext, AuthenticatedContextProps } from '../authentication';
import { TIME_ENDPOINT } from '../api';
import { DateTimePicker } from '@material-ui/pickers';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(UTC);

type NTPStatusFormProps = RestFormProps<NTPStatus> & WithTheme & AuthenticatedContextProps;

const NTPStatusForm = (props: NTPStatusFormProps) => {

    const [settingTime, setSettingTime] = useState(false);
    const [localTime, setLocalTime] = useState(dayjs().local());
    const [processing, setProcessing] = useState(false);

    const openSetTime = () => {
        setLocalTime(dayjs().local());
        setSettingTime(true);
    }

    const createAdjustedTime = (): Time => {
        return {
            time_utc: localTime.local().format("YYYY-MM-DDTHH:mm:ss[Z]")
        };
    }

    const { enqueueSnackbar, loadData } = props;

    const configureTime = () => {
        setProcessing(true);
        redirectingAuthorizedFetch(TIME_ENDPOINT,
        {
            method: 'POST',
            body: JSON.stringify(createAdjustedTime()),
            headers: {
            'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 200) {
                enqueueSnackbar("Time set successfully", { variant: 'success' });
                setSettingTime(false);
                setProcessing(false);
                loadData();
            } else {
                throw Error("Error setting time, status code: " + response.status);
            }
        })
        .catch(error => {
            enqueueSnackbar(error.message || "Problem setting the time", { variant: 'error' });
            setSettingTime(false);
            setProcessing(false);
        });
    }

    const setTimeDialog = <Dialog
            open={settingTime}
            onClose={() => setSettingTime(false)}
        >
            <DialogTitle>Set Time</DialogTitle>
            <DialogContent dividers>
            <Box mb={2}>Enter local date and time below to set the device's time.</Box>
            <DateTimePicker value={localTime} onChange={newTime => newTime && setLocalTime(newTime)}/>
            </DialogContent>
            <DialogActions>
            <Button variant="contained" onClick={() => setSettingTime(false)} color="secondary">
                Cancel
            </Button>
            <Button startIcon={<AccessTimeIcon />} variant="contained" onClick={configureTime} disabled={processing} color="primary" autoFocus>
                Set Time
            </Button>
            </DialogActions>
        </Dialog>;

    const { data, theme } = props;
    const me = props.authenticatedContext.me;
    return (
      <Fragment>
        <List>
          <ListItem>
            <ListItemAvatar>
              <HighlightAvatar color={ntpStatusHighlight(data, theme)}>
                <UpdateIcon />
              </HighlightAvatar>
            </ListItemAvatar>
            <ListItemText primary="Status" secondary={ntpStatus(data)} />
          </ListItem>
          <Divider variant="inset" component="li" />
          {isNtpActive(data) && (
            <Fragment>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <DNSIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="NTP Server" secondary={data.server} />
              </ListItem>
              <Divider variant="inset" component="li" />
            </Fragment>
          )}
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AccessTimeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Local Time" secondary={dayjs(data.time_local).format('MMMM D, YYYY @ HH:mm:ss')} />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <SwapVerticalCircleIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="UTC Time" secondary={dayjs(data.time_utc).utc().format('MMMM D, YYYY @ HH:mm:ss')} />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AvTimerIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Uptime" secondary={dayjs.duration(data.uptime, 'seconds').humanize()} />
          </ListItem>
          <Divider variant="inset" component="li" />
        </List>
        <Box display="flex" flexWrap="wrap">
          <Box flexGrow={1} padding={1}>
            <FormButton startIcon={<RefreshIcon />} variant="contained" color="secondary" onClick={props.loadData}>
              Refresh
            </FormButton>
          </Box>
          {me.admin && !isNtpActive(data) && (
            <Box flexWrap="none" padding={1} whiteSpace="nowrap">
              <Button onClick={openSetTime} variant="contained" color="primary" startIcon={<AccessTimeIcon />}>
                Set Time
              </Button>
            </Box>
          )}
        </Box>
        {setTimeDialog}
      </Fragment>
    );
}

export default withAuthenticatedContext(withTheme(NTPStatusForm));
