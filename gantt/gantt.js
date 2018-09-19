build_gantt_chart();

// We expect to have events here, so let's have them
console.log(raw_events)

function transform_events_to_tasks(events) {
    var found_events_start = {}
    var found_events_ends = {}
    var tasks = []
    var statuses = ["KILLED", "SUCCEEDED", "FAILED", "RUNNING"];
    for (var i = 0, l = events.length; i < l; i++) {
        var event = events[l - i - 1]
        console.log('[EVENT]' + JSON.stringify(event))
        var taskName = event.taskName

        if (event.event === "end") {
            found_events_ends[taskName] = event
        } else if (event.event === "start") {

            // Let's stop, it's hardly we're building same target twice
            // If we want to
            if (taskName in found_events_start) {
                break;
            }

            end_event = found_events_ends[taskName];
            if (end_event === undefined) {
                end_event = event
                console.log('[SKIP] ' + taskName + ' - start event before end ¯\\_(ツ)_/¯')
                break
            }

            found_events_start[taskName] = event
            start_event = event

            tasks.unshift({
                "startDate": new Date(start_event.date),
                "endDate": new Date(end_event.date),
                "taskName": taskName,
                "status": statuses[i % statuses.length]
            })
        }
    }

    var names = tasks.map(task => task.taskName);
    return {
        "tasks": tasks,
        "names": names,
        "taskStatus":
            {
                "SUCCEEDED": "bar",
                "FAILED": "bar-failed",
                "RUNNING": "bar-running",
                "KILLED": "bar-killed"
            }
    }
}

function build_gantt_chart() {

    var tasks_result = transform_events_to_tasks(raw_events)
    var tasks = tasks_result.tasks

    tasks.sort(function (a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;

    var midinght = new Date(minDate)
    midinght.setHours(0, 0, 0, 0)

    var diff = minDate.getTime() - midinght.getTime();
    tasks.forEach(function (element, index) {
        tasks[index].startDate = new Date(element.startDate.getTime() - diff)
        tasks[index].endDate = new Date(element.endDate.getTime() - diff)
    });

    minDate = tasks[0].startDate;

    var max_time = 10 * 60 * 1000;

    var gantt = d3.gantt()
        .taskTypes(tasks_result.names)
        .taskStatus(tasks_result.taskStatus)
        .tickFormat("%H:%M:%S")
        .timeDomainMode("fixed")
        .timeDomain([minDate, new Date(minDate.getTime() + max_time)]);

    gantt(tasks);

};

