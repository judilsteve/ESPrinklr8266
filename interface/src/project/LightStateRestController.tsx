import React, { useEffect, useState } from 'react';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { Checkbox, Fab, Grid, IconButton, List, ListItem } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

import { ENDPOINT_ROOT } from '../api';
import { restController, RestControllerProps, RestFormLoader, RestFormProps, FormActions, FormButton, SectionContent } from '../components';

import Schedule, { ScheduledStation } from './types/Schedule';
import { Add, Delete } from '@material-ui/icons';

export const SCHEDULE_SETTINGS_ENDPOINT = ENDPOINT_ROOT + "schedule";

type ScheduleRestControllerProps = RestControllerProps<Schedule>;

const ScheduleRestController = (props: ScheduleRestControllerProps) => {

    const { loadData } = props;
    useEffect(loadData, [loadData]);

    return (
      <SectionContent title='Schedule' titleGutter>
        <RestFormLoader
          {...props}
          render={props => (
            <ScheduleRestControllerForm {...props} />
          )}
        />
      </SectionContent>
    );

}

export default restController(SCHEDULE_SETTINGS_ENDPOINT, ScheduleRestController);

type ScheduleFormProps = RestFormProps<Schedule>;

type StationFormValue = {
    name: string,
    pin: string,
    durationSeconds: string
};

const makeStationFormValues = (stations: ScheduledStation[]) => {
    if(stations.length) {
        return stations.map(s => ({
            name: s.name,
            pin: s.pin.toString(),
            durationSeconds: s.durationSeconds.toString()
        }));
    } else {
        return [{
            name: '',
            pin: '',
            durationSeconds: ''
        }];
    }
}

const makeStation = (station: StationFormValue): ScheduledStation => {
    return {
        pin: parseInt(station.pin),
        durationSeconds: parseInt(station.durationSeconds),
        name: station.name
    };
}

const ScheduleRestControllerForm = (props: ScheduleFormProps) => {
  const { data, setData, saveData, handleValueChange } = props;

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const [stations, setStations] = useState(makeStationFormValues(data.stations));

  const addStation = () => {
    setStations([...stations, { name: '', pin: '', durationSeconds: '' }]);
  };

  const deleteStation = (stationIndex: number) => {
    setStations(stations.filter((_, i) => i !== stationIndex));
  }

  const renameStation = (stationIndex: number, newName: string) => {
    console.debug(newName);
    const station = stations[stationIndex];
    station.name = newName;
    setStations([...stations]);
    if(station.name) {
        setData({...data, stations: stations.map(makeStation)});
    }
  };

  const setStationDuration = (stationIndex: number, newDuration: string) => {
    const station = stations[stationIndex];
    station.durationSeconds = newDuration;
    setStations([...stations]);
    if(parseInt(station.durationSeconds).toString() === station.durationSeconds) {
        setData({...data, stations: stations.map(makeStation)});
    }
  };

  const setStationPin = (stationIndex: number, newPin: string) => {
    const station = stations[stationIndex];
    station.pin = newPin;
    setStations([...stations]);
    if(parseInt(station.pin).toString() === station.pin) {
        setData({...data, stations: stations.map(makeStation)});
    }
  };

  return (
    <ValidatorForm onSubmit={saveData}>
      <SectionContent title='Quick Actions' titleGutter>
        <>TODO_JU Test, disable today, and run now buttons</>
      </SectionContent>
      <SectionContent title='Days of Week' titleGutter>
        <List>
            {
                daysOfWeek.map(d => <ListItem key={d}>
                    <Checkbox
                    checked={data[d.toLowerCase() as keyof Schedule] as boolean}
                    onChange={handleValueChange(d.toLowerCase() as keyof Schedule)}
                    color="primary" />{d}
                </ListItem>)
            }
        </List>
      </SectionContent>
      <SectionContent title='Start Time' titleGutter>
          TODO_JU Start Time
      </SectionContent>
      <SectionContent title='Stations' titleGutter>{/* TODO_JU Cards to delimit each station? */}
          <List>
              {
                  stations.map((s, i) => <ListItem key={i}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} lg={6}>
                            <TextValidator
                                label="Name"
                                fullWidth
                                required
                                name="name"
                                value={s.name}
                                /* Typescript annotations for this component are bullshit, hence the "as any" */
                                onChange={e => renameStation(i, (e as any).target.value as string)}
                                validators={['required']}
                                errorMessages={['A name is required']}/>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <TextValidator
                                label="Duration (seconds)"
                                fullWidth
                                required
                                name="duration"
                                value={s.durationSeconds}
                                /* Typescript annotations for this component are bullshit, hence the "as any" */
                                onChange={e => setStationDuration(i, (e as any).target.value as string)}
                                validators={['required', 'isNumber', 'isPositive']}
                                errorMessages={['A duration is required', 'Duration must be a whole number', 'Duration must be positive']}/>
                        </Grid>
                        <Grid item xs={12} lg={1}>
                            <TextValidator
                                label="Pin"
                                fullWidth
                                required
                                name="pin"
                                value={s.pin}
                                /* Typescript annotations for this component are bullshit, hence the "as any" */
                                onChange={e => setStationPin(i, (e as any).target.value as string)}
                                validators={['required', 'isNumber', 'isPositive']}
                                errorMessages={['A pin is required', 'Pin must be a whole number', 'Pin must be positive']}/>
                        </Grid>
                        <Grid item xs={12} lg={1}>
                            <IconButton disabled={stations.length === 1} onClick={() => deleteStation(i)}>
                                <Delete />
                            </IconButton>
                        </Grid>
                      </Grid>
                  </ListItem>)
              }
              <ListItem>
                <Fab color="primary" onClick={addStation}>
                    <Add />
                </Fab>
              </ListItem>
          </List>
      </SectionContent>
      * Value is required
      <FormActions>
        <FormButton startIcon={<SaveIcon />} variant="contained" color="primary" type="submit">
          Save
        </FormButton>
      </FormActions>
    </ValidatorForm>
  );
}
