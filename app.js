(function () {
    var template = '<div style="all:initial;position:fixed;z-index:2147483647;top:25px;right:8px;background:#fff;display:flex;align-items:center"><div id="_pomSetTime"><input id="_pomTimeInput" type="number" maxlength="2" style="all:initial;max-width:36px;padding:1px 2px;border:1px inset #767676"> <input id="_pomStartButton" type="button" value="Start" style="all:initial;cursor:pointer;padding:3px 8px;border:none;border-radius:8px;margin:0 3px;color:#fff;background-color:#04aa6d"></div><div id="_pomRunning" style="all:initial;display:none"><div id="_pomRunningIndicator" style="all:initial;display:none;width:20px;height:20px;border:3px solid #04aa6d;border-radius:100%;background-color:#04aa6d"></div><div id="_pomRunningDetailed" style="all:initial;display:none"><span id="_pomTime" style="all:initial"></span> <input id="_pomStoptButton" type="button" value="Stop" style="all:initial;cursor:pointer;padding:3px 8px;border:none;border-radius:8px;margin:0 3px;color:#fff;background-color:red"></div></div><div id="_pomCloseButton" title="Close Pomodoro" style="all:initial;cursor:pointer;width:10px;height:10px;border:3px solid red;border-radius:100%;background:linear-gradient(-45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%),linear-gradient(45deg,transparent 45%,#fff 45Q,#fff 55%,transparent 55%),linear-gradient(45deg,transparent 46%,#fff 46%,#fff 56%,transparent 56%);background-color:red"></div></div>';
    var state = Object.freeze({
        setTime: 1,
        running: 2,
        runningHover: 3
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
            setTimeDiv: null,
            timeInput: null,
            startButton: null,
            runningIndicatorDiv: null,
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
        _appResources.domElements.setTimeDiv = container.querySelector("#_pomSetTime");
        _appResources.domElements.timeInput = container.querySelector("#_pomTimeInput");
        _appResources.domElements.startButton = container.querySelector("#_pomStartButton");
        _appResources.domElements.runningDiv = container.querySelector("#_pomRunning");
        _appResources.domElements.runningIndicatorDiv = container.querySelector("#_pomRunningIndicator");
        _appResources.domElements.runningDetailedDiv = container.querySelector("#_pomRunningDetailed");
        _appResources.domElements.timeSpan = container.querySelector("#_pomTime");
        _appResources.domElements.stopButton = container.querySelector("#_pomStoptButton");
        _appResources.domElements.closeButton = container.querySelector("#_pomCloseButton");

        // Wire events
        _appResources.domElements.timeInput.addEventListener("change", onChangeTime);
        _appResources.domElements.startButton.addEventListener("click", onStartClick);
        _appResources.domElements.runningDiv.addEventListener("mouseenter", onRunningMouseenter);
        _appResources.domElements.runningDiv.addEventListener("mouseleave", onRunningMouseleave);
        _appResources.domElements.stopButton.addEventListener("click", onStopClick);
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
                _appResources.domElements.timeInput.value = _appState.minutes.toString();
                _appResources.domElements.setTimeDiv.style.display = "block";
                _appResources.domElements.runningDiv.style.display = "none";
                _appResources.domElements.runningIndicatorDiv.style.display = "none";
                _appResources.domElements.runningDetailedDiv.style.display = "none";
                _appResources.domElements.closeButton.style.display = "block";
                break;
            case state.running:
                _appResources.domElements.setTimeDiv.style.display = "none";
                _appResources.domElements.runningDiv.style.display = "block";
                _appResources.domElements.runningIndicatorDiv.style.display = "block";
                _appResources.domElements.runningDetailedDiv.style.display = "none";
                _appResources.domElements.closeButton.style.display = "none";
                break;
            case state.runningHover:
                var timePassed = Date.now() - _appState.setAt;
                var secondsLeft = _appState.minutes * 60 - convertMillisecondsToSeconds(timePassed);

                _appResources.domElements.setTimeDiv.style.display = "none";
                _appResources.domElements.timeSpan.innerHTML = formatTimeMinSec(secondsLeft) + " left";
                _appResources.domElements.runningDiv.style.display = "block";
                _appResources.domElements.runningIndicatorDiv.style.display = "none";
                _appResources.domElements.runningDetailedDiv.style.display = "block";
                _appResources.domElements.closeButton.style.display = "none";
                break;
        }
    }

    function destroy() {
        clearTimeout(_appResources.timeoutHandler);
        clearInterval(_appResources.intervalHandler);
        _appResources.domElements.timeInput.removeEventListener("change", onChangeTime);
        _appResources.domElements.startButton.removeEventListener("click", onStartClick);
        _appResources.domElements.runningDiv.removeEventListener("mouseenter", onRunningMouseenter);
        _appResources.domElements.runningDiv.removeEventListener("mouseleave", onRunningMouseleave);
        _appResources.domElements.stopButton.removeEventListener("click", onStopClick);
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

    function onStartClick() {
        _appResources.timeoutHandler = setTimeout(onTimeout, convertMinutesToMilliseconds(_appState.minutes));

        var newState = {
            state: state.running,
            setAt: Date.now()
        };
        setState(newState);
    }

    function onRunningMouseenter() {
        if (_appState.state === state.running) {
            _appResources.intervalHandler = setInterval(onInterval, 500);

            var newState = {
                state: state.runningHover
            };
            setState(newState);
        }
    }

    function onRunningMouseleave() {
        if (_appState.state === state.runningHover) {
            clearInterval(_appResources.intervalHandler);

            var newState = {
                state: state.running
            };
            setState(newState);
        }
    }

    function onStopClick() {
        switch (_appState.state) {
            case state.runningHover:
                clearTimeout(_appResources.timeoutHandler);
                clearInterval(_appResources.intervalHandler);

                setState(defaultAppState);
                break;
        }
    }

    function onTimeout() {
        switch (_appState.state) {
            case state.running:
            case state.runningHover:
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

    init();
})()
