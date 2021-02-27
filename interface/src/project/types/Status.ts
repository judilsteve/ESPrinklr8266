export default interface Status {
    activePin: number;
    activeStation: string;
    enteredStateTime: number;
    leavingStateTime: number;
    state: SystemState;
};

export enum SystemState {
    Idle,
    Testing,
    RunningManual,
    RunningScheduled,
    DisabledUntil
}