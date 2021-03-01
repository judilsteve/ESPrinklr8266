#include <StatusService.h>

StatusService::StatusService(
    SecurityManager * securityManager,
    AsyncWebServer * server) :
    webSocket(
        Status::read,
        Status::update,
        this,
        server,
        STATUS_WS_PATH,
        securityManager,
        AuthenticationPredicates::IS_AUTHENTICATED)
    { }

void StatusService::begin() {
    _state.ActivePin = -1;
    _state.ActiveStation = "";
    _state.EnteredStateTime = -1;
    _state.LeavingStateTime = -1;
    _state.State = INVALID;
}
