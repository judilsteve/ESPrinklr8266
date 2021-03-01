#include <ESP8266React.h>
#include <ScheduleService.h>
#include <StatusService.h>
#include <time.h>

#define SERIAL_BAUD_RATE 115200

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
ScheduleService scheduleService(&server, esp8266React.getSecurityManager(), esp8266React.getFS());
StatusService statusService(esp8266React.getSecurityManager(), &server);

int lastActiveStationPin = -1;

void handleStatusChange(Status const & newStatus, String const & updateSource) {
    if(newStatus.ActivePin != lastActiveStationPin) {
        if(lastActiveStationPin != -1) digitalWrite(lastActiveStationPin, LOW);
        if(newStatus.ActivePin != -1) {
            pinMode(newStatus.ActivePin, OUTPUT);
            digitalWrite(newStatus.ActivePin, HIGH);
            Serial.printf("Running pin %i (%s)\n", newStatus.ActivePin, updateSource.c_str());
            lastActiveStationPin = newStatus.ActivePin;
        } else {
            Serial.printf("Going idle (%s)\n", updateSource.c_str());
        }
    }
}

void setup() {
    // start serial and filesystem
    Serial.begin(SERIAL_BAUD_RATE);

    // start the framework and demo project
    esp8266React.begin();

    // load the initial schedule settings
    scheduleService.begin();

    // initialise status
    statusService.addUpdateHandler([&](String const & updateSource){
        statusService.read([&](Status const & newStatus) {
            handleStatusChange(newStatus, updateSource);
        });
    });
    statusService.begin();

    // start the server
    server.begin();
}

template<typename T> void updateStateValue(T& existingValue, T const & newValue, StateUpdateResult & updateResult) {
    if(newValue != existingValue) {
        existingValue = newValue;
        updateResult = StateUpdateResult::CHANGED;
    }
}

#define SECONDS_BETWEEN_STATIONS 5;

bool updateScheduledStatus(std::vector<Station> const & stations, time_t scheduleStartTime, time_t currentTime, bool isManualRun) {
    auto const actualSecondsIntoRun = currentTime - scheduleStartTime;
    if (actualSecondsIntoRun < 0) {
        return false;
    }

    auto testSecondsIntoRun = 0;
    auto const stationCount = stations.size();
    for (size_t i = 0; i < stationCount; i++) {
        auto const & testStation = stations[i];
        testSecondsIntoRun += testStation.DurationSeconds;
        if(actualSecondsIntoRun < testSecondsIntoRun) {
            statusService.update([&](Status & status){
                auto updateResult = StateUpdateResult::UNCHANGED;

                updateStateValue(status.State, isManualRun ? RunningManual : RunningScheduled, updateResult);
                updateStateValue(status.ActivePin, (int)testStation.Pin, updateResult);
                updateStateValue(status.ActiveStation, testStation.Name, updateResult);
                updateStateValue(status.EnteredStateTime, (long)testSecondsIntoRun - (long)testStation.DurationSeconds, updateResult); // TODO_JU This is wrong
                updateStateValue(status.LeavingStateTime, (long)testSecondsIntoRun, updateResult); // TODO_JU This is wrong

                return updateResult;
            }, isManualRun ? "manual run" : "scheduled run");
            return true;
        }
        if (i != stationCount - 1) {
            testSecondsIntoRun += SECONDS_BETWEEN_STATIONS;
            if(actualSecondsIntoRun < testSecondsIntoRun) {
                return false;
            }
        }
    }

    return false;
}

String const emptyStringConstant("");

void updateStatus(Schedule const & schedule) {
    // Test mode
    auto const testStationPin = schedule.TestStationPin;
    if(testStationPin != -1) {
        statusService.update([&](Status & status){
            auto updateResult = StateUpdateResult::UNCHANGED;

            updateStateValue(status.State, Testing, updateResult);
            updateStateValue(status.ActivePin, testStationPin, updateResult);
            updateStateValue(status.ActiveStation, emptyStringConstant, updateResult);
            updateStateValue(status.EnteredStateTime, -1l, updateResult);
            updateStateValue(status.LeavingStateTime, -1l, updateResult);

            return updateResult;
        }, "pin test");
    }

    // Manual run mode
    auto const actualTime = time(nullptr);
    auto const manualStartTime = schedule.ManualStartTime;
    if(manualStartTime < actualTime) {
        if(updateScheduledStatus(schedule.Stations, manualStartTime, actualTime, true)) {
            return;
        };
    }

    // Temporary disable (rain mode)
    if(schedule.DisableUntil > actualTime) {
        statusService.update([&](Status & status){
            auto updateResult = StateUpdateResult::UNCHANGED;

            updateStateValue(status.State, DisabledUntil, updateResult);
            updateStateValue(status.ActivePin, -1, updateResult);
            updateStateValue(status.ActiveStation, emptyStringConstant, updateResult);
            updateStateValue(status.EnteredStateTime, -1l, updateResult);
            updateStateValue(status.LeavingStateTime, schedule.DisableUntil, updateResult);

            return updateResult;
        }, "disabled");
    }

    auto const goIdle = [&](Status & status){
        auto updateResult = StateUpdateResult::UNCHANGED;

        updateStateValue(status.State, Idle, updateResult);
        updateStateValue(status.ActivePin, -1, updateResult);
        updateStateValue(status.ActiveStation, emptyStringConstant, updateResult);
        updateStateValue(status.EnteredStateTime, -1l, updateResult); // TODO_JU ?
        updateStateValue(status.LeavingStateTime, -1l, updateResult); // TODO_JU ?

        return updateResult;
    };

    // Check day of week
    auto const localActualTime = localtime(&actualTime);
    bool scheduledToday;
    switch(localActualTime->tm_wday) {
        case 0: scheduledToday = schedule.Sunday; break;
        case 1: scheduledToday = schedule.Monday; break;
        case 2: scheduledToday = schedule.Tuesday; break;
        case 3: scheduledToday = schedule.Wednesday; break;
        case 4: scheduledToday = schedule.Thursday; break;
        case 5: scheduledToday = schedule.Friday; break;
        case 6: scheduledToday = schedule.Saturday; break;
        default: scheduledToday = false; break;
    }
    if(!scheduledToday) {
        statusService.update(goIdle, "idle");
    }

    auto localScheduleStartTime = tm(*localActualTime);
    localScheduleStartTime.tm_hour = schedule.StartOffsetFromMidnightSeconds / 3600;
    localScheduleStartTime.tm_min = (schedule.StartOffsetFromMidnightSeconds % 3600) / 60;
    localScheduleStartTime.tm_sec = schedule.StartOffsetFromMidnightSeconds % 60;
    auto const scheduleStartTime = mktime(&localScheduleStartTime);
    if(!updateScheduledStatus(schedule.Stations, scheduleStartTime, actualTime, false)) {
        statusService.update(goIdle, "idle");
    };
}

void loop() {
    // run the framework's loop function
    esp8266React.loop();

    scheduleService.read([](Schedule const & schedule) {
        // TODO_JU npm audit reckons there are issues.
        // TODO_JU Check that time fns actually return time configured in the frontend
        updateStatus(schedule);
    });
}
