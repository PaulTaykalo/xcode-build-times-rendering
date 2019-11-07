build_gantt_chart();

// We expect to have events here, so let's have them
console.log(raw_events);

function funhash(s) {
    for (var i = 0, h = 1; i < s.length; i++)
        h = Math.imul(h + s.charCodeAt(i) | 0, 2654435761);
    return (h ^ h >>> 17) >>> 0;
};

function transform_events_to_tasks(events) {
    var found_events_start = {};
    var found_events_ends = {};
    var tasks = [];
    var colors = ['#CC0000', '#669900', '#ffbb33', '#33b5e5'];
    for (var i = 0, l = events.length; i < l; i++) {
        var event = events[l - i - 1];
        console.log('[EVENT]' + JSON.stringify(event));
        var taskName = event.taskName;

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
                end_event = event;
                console.log('[SKIP] ' + taskName + ' - start event before end ¯\\_(ツ)_/¯');
                break
            }

            found_events_start[taskName] = event;
            start_event = event;

            tasks.unshift({
                "startDate": new Date(start_event.date),
                "endDate": new Date(end_event.date),
                "taskName": taskName,
                "color": colors[funhash(taskName) % colors.length]
            })
        }
    }

    var names = tasks.map(task => task.taskName);
    return {
        "tasks": tasks,
        "names": names
    }
}

function build_gantt_chart() {

    var tasks_result = transform_events_to_tasks(raw_events);
    var tasks = tasks_result.tasks;

    tasks.sort(function (a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;
    var maxDate = tasks[tasks.length - 1].endDate;

    var midinght = new Date(minDate);
    midinght.setHours(0, 0, 0, 0);

    var diff = minDate.getTime() - midinght.getTime();
    tasks.forEach(function (element, index) {
        tasks[index].startDate = new Date(element.startDate.getTime() - diff);
        tasks[index].endDate = new Date(element.endDate.getTime() - diff)
    });

    var totalTime = 0;
    tasks.forEach(function (element, index) {
        totalTime += tasks[index].endDate - tasks[index].startDate
    });

    const build_time = (maxDate - minDate)  / 1000;
    const compudataion_time = totalTime / 1000;
    const theoretical_minimum = compudataion_time / navigator.hardwareConcurrency;
    const theoretical_speedup = build_time / theoretical_minimum;
    const legend = [
        ['Build time', build_time],
        ['Total computation time', compudataion_time],
        ['Theoretical minimum', theoretical_minimum.toFixed(2)],
        ['Theoretical speedup x', theoretical_speedup.toFixed(2)]
    ].map(function (t) {
        const title = t[0];
        const value = t[1] + '';
        return title.padEnd(22) + ' : ' + value.padStart(10)
    }).map(function (row) {
        return row.replace(/\s/g, '\u00A0');
    });


    console.log(legend);

    minDate = tasks[0].startDate;
    task_name_lengths = tasks_result.names.map( n => n.length )
    max_name_length = Math.max(...task_name_lengths)

    var gantt = d3.gantt()
        .margin({ top : 20, right : 40, bottom : 20, left : 6 * max_name_length })
        .taskTypes(tasks_result.names)
        .tickFormat("%M:%S")
        .timeDomainMode("fit")
    updateWindow()

    gantt(tasks, legend);

    function updateWindow(){
        x = window.innerWidth || e.clientWidth || g.clientWidth;
        y = window.innerHeight|| e.clientHeight|| g.clientHeight;

        var margin = gantt.margin();
        gantt
            .width(x - margin.left - margin.right - 5)
            .height(y - margin.top - margin.bottom - 5)
            .redraw(tasks);
    }
    d3.select(window).on('resize.updatesvg', updateWindow);
};
