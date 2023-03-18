(function () {
    var template = '<div style="position:absolute;top:55px;right:8px;"><input type="number" maxlength="2" style="max-width:36px;" /><input type="button" /><a href="javascript:void(0)" title="Close">x</a></div>';
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
            closeAnchor: null
        },
        timeoutHandler: null,
        intervalHandler: null
    };

    function init() {
        var container = createContainer();
        window.document.body.appendChild(container);

        // Save refs to DOM elements
        _appResources.domElements.containerDiv = container;
        _appResources.domElements.timeInput = container.childNodes[0];
        _appResources.domElements.startStopButton = container.childNodes[1];
        _appResources.domElements.closeAnchor = container.childNodes[2];

        // Wire events
        _appResources.domElements.timeInput.addEventListener("change", onChangeTime);
        _appResources.domElements.startStopButton.addEventListener("click", onStartStopClick);
        _appResources.domElements.closeAnchor.addEventListener("click", onCloseClick);

        setState(defaultAppState);
    }

    function setState(newState) {
        _appState = Object.assign(_appState, newState);
        render();
    }

    function render() {
        switch (_appState.state) {
            case state.setTime:
                _appResources.domElements.timeInput.value = _appState.minutes.toString();
                _appResources.domElements.timeInput.removeAttribute("disabled");
                _appResources.domElements.startStopButton.setAttribute("value", "Start");
                break;
            case state.running:
                var minutesLeft = _appState.minutes
                    - convertMillisecondsToMinutes(Date.now() - _appState.setAt);
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
        _appResources.domElements.closeAnchor.removeEventListener("click", onCloseClick);
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
                _appResources.intervalHandler = setInterval(onInterval, 5 * 1000);

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

    function convertMinutesToMilliseconds(minutes) {
        return minutes * 60 * 1000;
    }

    function convertMillisecondsToMinutes(milliseconds) {
        return Math.floor(milliseconds / (60 * 1000));
    }

    init();
})();