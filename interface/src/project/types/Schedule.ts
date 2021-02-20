export default interface Schedule {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    startOffsetFromMidnightSeconds: number;
    stations: ScheduledStation[];
    disableUntil: number;
    testStationPin: number;
    manualStartTime: number;
};

export interface ScheduledStation {
    pin: number;
    name: string;
    durationSeconds: number;
}