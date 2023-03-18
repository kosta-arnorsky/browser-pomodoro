(function () {
    var template = '<div style="all:initial;position:fixed;z-index:2147483647;top:55px;right:8px;background:#fff;display:flex;align-items:center"><input id="_pomTimeInput" type="number" maxlength="2" style="all:initial;max-width:36px;padding:1px 2px;border:1px inset #767676"> <input id="_pomStartStopButton" type="button" style="all:initial;padding:3px 8px;border:none;border-radius:8px;margin:0 3px;color:#fff;background-color:#04aa6d"><div id="_pomCloseButton" title="Close Pomodoro" style="width:10px;height:10px;border:3px solid red;border-radius:100%;background:linear-gradient(-45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%),linear-gradient(45deg,transparent 45%,#fff 45Q,#fff 55%,transparent 55%),linear-gradient(45deg,transparent 46%,#fff 46%,#fff 56%,transparent 56%);background-color:red;cursor:pointer"></div></div>';
    var state = Object.freeze({
        setTime: 1,
        running: 2
    });
    var defaultAppState = {
        state: state.setTime,
        minutes: 25,
        setAt: null
    };

    var _appState = {
    };
    var _appResources = {
        domElements: {
            containerDiv: null,
            timeInput: null,
            startStopButton: null,
            closeButton: null
        },
        timeoutHandler: null,
        intervalHandler: null
    };

    function init() {
        var container = createContainer();
        window.document.body.appendChild(container);

        // Save refs to DOM elements
        _appResources.domElements.containerDiv = container;
        _appResources.domElements.timeInput = container.querySelector("#_pomTimeInput");
        _appResources.domElements.startStopButton = container.querySelector("#_pomStartStopButton");
        _appResources.domElements.closeButton = container.querySelector("#_pomCloseButton");

        // Wire events
        _appResources.domElements.timeInput.addEventListener("change", onChangeTime);
        _appResources.domElements.startStopButton.addEventListener("click", onStartStopClick);
        _appResources.domElements.closeButton.addEventListener("click", onCloseClick);

        setState(defaultAppState);
    }

    function setState(newState) {
        _appState = Object.assign(_appState, newState);
        render();
    }

    function render() {
        switch (_appState.state) {
            case state.setTime:
                _appResources.domElements.containerDiv.removeAttribute("title");
                _appResources.domElements.timeInput.value = _appState.minutes.toString();
                _appResources.domElements.timeInput.removeAttribute("disabled");
                _appResources.domElements.startStopButton.setAttribute("value", "Start");
                break;
            case state.running:
                var timePassed = Date.now() - _appState.setAt;

                var secondsLeft = _appState.minutes * 60 - convertMillisecondsToSeconds(timePassed);
                _appResources.domElements.containerDiv.setAttribute("title", formatTimeMinSec(secondsLeft) + " left");

                var minutesLeft = _appState.minutes - convertMillisecondsToMinutes(timePassed);
                _appResources.domElements.timeInput.value = minutesLeft.toString();
                _appResources.domElements.timeInput.setAttribute("disabled", "disabled");
                _appResources.domElements.startStopButton.setAttribute("value", "Stop");
                break;
        }
    }

    function destroy() {
        clearTimeout(_appResources.timeoutHandler);
        clearInterval(_appResources.intervalHandler);
        _appResources.domElements.timeInput.removeEventListener("change", onChangeTime);
        _appResources.domElements.startStopButton.removeEventListener("click", onStartStopClick);
        _appResources.domElements.closeButton.removeEventListener("click", onCloseClick);
        _appResources.domElements.containerDiv.remove();

        _appResources = null;
    }

    // Event handlers

    function onChangeTime() {
        switch (_appState.state) {
            case state.setTime:
                var newState = {
                    minutes: convertToMinutes(_appResources.domElements.timeInput.value)
                };
                setState(newState);
                break;
        }
    }

    function onStartStopClick() {
        switch (_appState.state) {
            case state.setTime:
                _appResources.timeoutHandler = setTimeout(onTimeout, convertMinutesToMilliseconds(_appState.minutes));
                _appResources.intervalHandler = setInterval(onInterval, 1000);

                var newState = {
                    state: state.running,
                    setAt: Date.now()
                };
                setState(newState);
                break;
            case state.running:
                clearTimeout(_appResources.timeoutHandler);
                clearInterval(_appResources.intervalHandler);

                setState(defaultAppState);
                break;
        }
    }

    function onTimeout() {
        switch (_appState.state) {
            case state.running:
                clearInterval(_appResources.intervalHandler);

                setState(defaultAppState);
                break;
        }
    }

    function onInterval() {
        render();
    }

    function onCloseClick() {
        destroy();
    }

    // Util pure functions

    function createContainer() {
        var tempElement = window.document.createElement("div");
        tempElement.innerHTML = template;
        return tempElement.childNodes[0];
    }

    function convertToMinutes(input) {
        var minutes = parseInt(input);
        if (!Number.isInteger(minutes)) {
            minutes = defaultTime;
        }
        else if (minutes <= 0) {
            minutes = 1;
        }
        else if (minutes > 99) {
            minutes = 99;
        }

        return minutes;
    }

    function formatTimeMinSec(fullSeconds) {
        var time = [];

        var mins = Math.floor(fullSeconds / 60);
        if (mins > 0) {
            time.push(mins);
            time.push("minutes");
        }

        var secs = fullSeconds % 60;
        if (secs > 0) {
            time.push(secs);
            time.push("seconds");
        }

        return time.join(" ");
    }

    function convertMinutesToMilliseconds(minutes) {
        return minutes * 60 * 1000;
    }

    function convertMillisecondsToSeconds(milliseconds) {
        return Math.floor(milliseconds / 1000);
    }

    function convertMillisecondsToMinutes(milliseconds) {
        return Math.floor(milliseconds / (60 * 1000));
    }

    init();
})();
