#include <ESP8266React.h>
#include <ScheduleService.h>
#include <time.h>

#define SERIAL_BAUD_RATE 115200

AsyncWebServer server(80);
ESP8266React esp8266React(&server);
ScheduleService scheduleService = ScheduleService(&server, esp8266React.getSecurityManager(), esp8266React.getFS());

void setup() {
    // start serial and filesystem
    Serial.begin(SERIAL_BAUD_RATE);

    // start the framework and demo project
    esp8266React.begin();

    // load the initial schedule settings
    scheduleService.begin();

    // start the server
    server.begin();
}

#define SECONDS_BETWEEN_STATIONS 10;

int getScheduledActiveStationPin(std::vector<Station> const & stations, time_t scheduleStartTime, time_t currentTime) {
    auto const actualSecondsIntoRun = currentTime - scheduleStartTime;
    if (actualSecondsIntoRun < 0) {
        return -1;
    }

    auto testSecondsIntoRun = 0;
    auto const stationCount = stations.size();
    for (auto i = 0; i < stationCount; i++) {
        auto const & testStation = stations[i];
        testSecondsIntoRun += testStation.DurationSeconds;
        if(actualSecondsIntoRun < testSecondsIntoRun) {
            return testStation.Pin;
        }
        if (i != stationCount - 1) {
            testSecondsIntoRun += SECONDS_BETWEEN_STATIONS;
            if(actualSecondsIntoRun < testSecondsIntoRun) {
                return -1;
            }
        }
    }

    return -1;
}

int getActiveStationPin(Schedule const & schedule) {
    // Test mode
    auto const testStationPin = schedule.TestStationPin;
    if(testStationPin != -1) {
        return testStationPin;
    }

    // Manual run mode
    auto const actualTime = time(nullptr);
    auto const manualStartTime = schedule.ManualStartTime;
    if(manualStartTime < actualTime) {
        auto const manualRunActiveStationPin = getScheduledActiveStationPin(schedule.Stations, manualStartTime, actualTime);
        if(manualRunActiveStationPin != -1) {
            return manualRunActiveStationPin;
        }
    }

    // Temporary disable (rain mode)
    if(schedule.DisableUntil > actualTime) {
        return -1;
    }

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
        return -1;
    }

    auto localScheduleStartTime = tm(*localActualTime);
    localScheduleStartTime.tm_hour = schedule.StartOffsetFromMidnightSeconds / 3600;
    localScheduleStartTime.tm_min = (schedule.StartOffsetFromMidnightSeconds % 3600) / 60;
    localScheduleStartTime.tm_sec = schedule.StartOffsetFromMidnightSeconds % 60;
    auto const scheduleStartTime = mktime(&localScheduleStartTime);
    return getScheduledActiveStationPin(schedule.Stations, scheduleStartTime, actualTime);
}

int lastActiveStationPin = -1;

void loop() {
    // run the framework's loop function
    esp8266React.loop();

    scheduleService.read([](Schedule const & schedule) {
        // TODO_JU npm audit reckons there are issues. Maybe also run an update and see if flash usage goes up or down (after committing)
        auto const activeStationPin = getActiveStationPin(schedule);
        if(activeStationPin != lastActiveStationPin) {
            digitalWrite(lastActiveStationPin, LOW);
            pinMode(activeStationPin, OUTPUT);
            digitalWrite(activeStationPin, HIGH);
            Serial.printf("Running station %i\n", activeStationPin);
            lastActiveStationPin = activeStationPin;
        }
    });
}
