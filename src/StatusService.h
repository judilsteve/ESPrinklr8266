#ifndef statusService_h
#define statusService_h

#include <WebSocketTxRx.h>

#define STATUS_WS_PATH "/ws/status"

enum SystemState {
    Idle,
    Testing,
    RunningManual,
    RunningScheduled,
    DisabledUntil,
    INVALID
};

class Status {
    public:
    int ActivePin;
    String ActiveStation;
    long EnteredStateTime;
    long LeavingStateTime;
    SystemState State;

    static SystemState parseSystemState(String const & stateString) {
        if(stateString == "Idle") return Idle;
        else if(stateString == "Testing") return Testing;
        else if(stateString == "RunningManual") return RunningManual;
        else if(stateString == "RunningScheduled") return RunningScheduled;
        else if(stateString == "DisabledUntil") return DisabledUntil;
        else return INVALID;
    }

    static String serialiseSystemState(SystemState const & state) {
        switch(state) {
            case Idle: return "Idle";
            case Testing: return "Testing";
            case RunningManual: return "RunningManual";
            case RunningScheduled: return "RunningScheduled";
            case DisabledUntil: return "DisabledUntil";
            case INVALID:
            default:
                return "INVALID";
        };
    }

    static void read(Status const & status, JsonObject & root) {
        root["activePin"] = status.ActivePin;
        root["activeStation"] = status.ActiveStation;
        root["enteredStateTime"] = status.EnteredStateTime;
        root["leavingStateTime"] = status.LeavingStateTime;
        root["state"] = serialiseSystemState(status.State);
    }

    static StateUpdateResult update(JsonObject const & root, Status & status) {
        auto result = StateUpdateResult::UNCHANGED;

        int const activePin = root["activePin"] | -1;
        if(activePin < 0) {
            return StateUpdateResult::ERROR;
        }
        if(status.ActivePin != activePin) {
            status.ActivePin = activePin;
            result = StateUpdateResult::CHANGED;
        }

        String const activeStation = root["activeStation"] | "";
        if(status.ActiveStation != activeStation) {
            status.ActiveStation = activeStation;
            result = StateUpdateResult::CHANGED;
        }

        long const enteredStateTime = root["enteredStateTime"] | -1;
        if(enteredStateTime != status.EnteredStateTime) {
            status.EnteredStateTime = enteredStateTime;
            result = StateUpdateResult::CHANGED;
        }

        long const leavingStateTime = root["leavingStateTime"] | -1;
        if(leavingStateTime != status.LeavingStateTime) {
            status.LeavingStateTime = leavingStateTime;
            result = StateUpdateResult::CHANGED;
        }

        SystemState const state = parseSystemState(root["state"] | "");
        if(state == INVALID) return StateUpdateResult::ERROR;
        if(state != status.State) {
            status.State = state;
            result = StateUpdateResult::CHANGED;
        }

        return result;
    }
};

class StatusService : public StatefulService<Status> {
    public:
    StatusService(
        SecurityManager * securityManager,
        AsyncWebServer * server);
    void begin();

    private:
    WebSocketTxRx<Status> webSocket;
};

#endif
