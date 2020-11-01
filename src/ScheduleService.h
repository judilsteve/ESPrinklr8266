#ifndef scheduleService_h
#define scheduleService_h

#include <HttpEndpoint.h>
#include <FSPersistence.h>

#include <vector>

#define SCHEDULE_SETTINGS_ENDPOINT_PATH "/rest/schedule"

class Station {
    public:
    unsigned int Pin;
    String Name;
    unsigned int DurationSeconds;

    static void read(Station & station, JsonObject & root) {
        root["pin"] = station.Pin;
        root["name"] = station.Name;
        root["durationSeconds"] = station.DurationSeconds;
    }

    static StateUpdateResult update(JsonObject & root, Station & station) {
        auto result = StateUpdateResult::UNCHANGED;

        int const pin = root["pin"] | -1;
        if(pin < 0) {
            return StateUpdateResult::ERROR;
        }
        if(station.Pin != (unsigned int)pin) {
            station.Pin = pin;
            result = StateUpdateResult::CHANGED;
        }

        String name = root["name"] | "";
        if(station.Name != name) {
            station.Name = name;
            result = StateUpdateResult::CHANGED;
        }

        int const durationSeconds = root["durationSeconds"] | -1;
        if(durationSeconds < 0) {
            return StateUpdateResult::ERROR;
        }
        if(station.DurationSeconds != (unsigned int)durationSeconds) {
            station.DurationSeconds = durationSeconds;
            result = StateUpdateResult::CHANGED;
        }

        return result;
    }
};

class Schedule {
    public:
    bool Monday;
    bool Tuesday;
    bool Wednesday;
    bool Thursday;
    bool Friday;
    bool Saturday;
    bool Sunday;

    unsigned int StartOffsetFromMidnightSeconds;

    std::vector<Station> Stations;

    long DisableUntil; // UNIX time

    int TestStationPin;

    long ManualStartTime; // UNIX time

    static void read(Schedule & schedule, JsonObject & root) {
        root["monday"] = schedule.Monday;
        root["tuesday"] = schedule.Tuesday;
        root["wednesday"] = schedule.Wednesday;
        root["thursday"] = schedule.Thursday;
        root["friday"] = schedule.Friday;
        root["saturday"] = schedule.Saturday;
        root["sunday"] = schedule.Sunday;

        root["startOffsetFromMidnightSeconds"] = schedule.StartOffsetFromMidnightSeconds;

        JsonArray jsonStations = root.createNestedArray("stations");
        for(auto & station : schedule.Stations) {
            JsonObject jsonStation = jsonStations.createNestedObject();
            Station::read(station, jsonStation);
        }

        root["disableUntil"] = schedule.DisableUntil;

        root["testStationPin"] = schedule.TestStationPin;

        root["manualStartTime"] = schedule.ManualStartTime;
    }

    static StateUpdateResult update(JsonObject & root, Schedule & schedule) {
        auto result = StateUpdateResult::UNCHANGED;

        bool const monday = root["monday"] | false;
        if (schedule.Monday != monday) {
            schedule.Monday = monday;
            result = StateUpdateResult::CHANGED;
        }

        bool const tuesday = root["tuesday"] | false;
        if (schedule.Tuesday != tuesday) {
            schedule.Tuesday = tuesday;
            result = StateUpdateResult::CHANGED;
        }

        bool const wednesday = root["wednesday"] | false;
        if (schedule.Wednesday != wednesday) {
            schedule.Wednesday = wednesday;
            result = StateUpdateResult::CHANGED;
        }

        bool const thursday = root["thursday"] | false;
        if (schedule.Thursday != thursday) {
            schedule.Thursday = thursday;
            result = StateUpdateResult::CHANGED;
        }

        bool const friday = root["friday"] | false;
        if (schedule.Friday != friday) {
            schedule.Friday = friday;
            result = StateUpdateResult::CHANGED;
        }

        bool const saturday = root["saturday"] | false;
        if (schedule.Saturday != saturday) {
            schedule.Saturday = saturday;
            result = StateUpdateResult::CHANGED;
        }

        bool const sunday = root["sunday"] | false;
        if (schedule.Sunday != sunday) {
            schedule.Sunday = sunday;
            result = StateUpdateResult::CHANGED;
        }

        int const startOffsetFromMidnightSeconds = root["startOffsetFromMidnightSeconds"] | -1;
        if(startOffsetFromMidnightSeconds < 0) {
            return StateUpdateResult::ERROR;
        }
        if((unsigned int)startOffsetFromMidnightSeconds != schedule.StartOffsetFromMidnightSeconds) {
            schedule.StartOffsetFromMidnightSeconds = startOffsetFromMidnightSeconds;
            result = StateUpdateResult::CHANGED;
        }

        JsonArray const stations = root["stations"];

        size_t const newStationCount = stations.size();
        if(newStationCount != schedule.Stations.size()) {
            schedule.Stations.resize(newStationCount, Station());
            result = StateUpdateResult::CHANGED;
        }

        for(size_t i = 0; i < newStationCount; i++) {
            JsonObject station = stations[i];
            auto const stationUpdateResult = Station::update(station, schedule.Stations[i]);
            if(stationUpdateResult == StateUpdateResult::CHANGED) {
                result = StateUpdateResult::CHANGED;
            }
        }

        long const disableUntil = root["disableUntil"];
        if(disableUntil != schedule.DisableUntil) {
            schedule.DisableUntil = disableUntil;
            result = StateUpdateResult::CHANGED;
        }

        int const testStationPin = root["testStationPin"] | -1;
        if(testStationPin != schedule.TestStationPin) {
            schedule.TestStationPin = testStationPin;
            result = StateUpdateResult::CHANGED;
        }

        long const manualStartTime = root["manualStartTime"] | -1;
        if(manualStartTime != schedule.ManualStartTime) {
            schedule.ManualStartTime = manualStartTime;
            result = StateUpdateResult::CHANGED;
        }

        return result;
    }
};

class ScheduleService : public StatefulService<Schedule> {
    public:
    ScheduleService(
        AsyncWebServer * server,
        SecurityManager * securityManager,
        FS * fileSystem);
    void begin();

    private:
    HttpEndpoint<Schedule> httpEndpoint;
    FSPersistence<Schedule> fsPersistence;

    void registerConfig();
};

#endif
