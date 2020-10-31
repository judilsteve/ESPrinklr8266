export default interface WeeklySchedule {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    startOffsetFromMidnightSeconds: number;
    stations: Array<ScheduledStation>;
    disableUntil: number;
    testStationPin: number;
    manualStartTime: number;
};

export interface ScheduledStation {
    pin: number;
    name: string;
    durationSeconds: number;
}