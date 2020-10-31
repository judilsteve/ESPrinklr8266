#include <ScheduleService.h>

ScheduleService::ScheduleService(
    AsyncWebServer * server,
    SecurityManager * securityManager,
    FS * fileSystem) :
    httpEndpoint(
        Schedule::read,
        Schedule::update,
        this,
        server,
        SCHEDULE_SETTINGS_ENDPOINT_PATH,
        securityManager,
        AuthenticationPredicates::IS_AUTHENTICATED),
    fsPersistence(
        Schedule::read,
        Schedule::update,
        this,
        fileSystem,
        "/config/lightState.json")
    {
        addUpdateHandler([&](const String& originId) { onConfigUpdated(); }, false);
    }

void ScheduleService::begin() {
    _state.DisableUntil = 0;
    _state.StartOffsetFromMidnightSeconds = 0;
    _state.Monday = false;
    _state.Tuesday = false;
    _state.Wednesday = false;
    _state.Thursday = false;
    _state.Friday = false;
    _state.Stations = std::vector<Station>(0);
    _state.TestStationPin = -1;
}

void ScheduleService::onConfigUpdated() {
    for(auto & const station : _state.Stations) {
        pinMode(station.Pin, OUTPUT);
    }
}
