# xcode-build-times-rendering

Xcode build times visualization per target
![image](https://user-images.githubusercontent.com/119268/45782819-abd2aa00-bc6c-11e8-9ee0-114c020f238a.png)

## Installation

```sh
[sudo] gem install xcode-build-times
```

## Injection in your project

In order to gather target build times, run the following command. This will add script build phases named "Timing START" and "Timing END" for **EACH** target in **EACH** project at specified path.

```sh
xcode-build-times install ~/Projects/<My_slowly_building_project>/
```

![image](https://user-images.githubusercontent.com/119268/45782420-898c5c80-bc6b-11e8-9200-d54dbc5ea56f.png)

## Events file

Once you've run the `install` command above, all build events will be saved to `~/.timings.xcode` file every time you build your project.  
**NOTE**: You can override this default setting by passing `--events-file` parameter on installation script

```json
...
{"date":"2018-09-19T22:52:04.1537386724", "taskName":"A", "event":"start"},
{"date":"2018-09-19T22:53:01.1537386781", "taskName":"A", "event":"end"},
{"date":"2018-09-19T22:53:04.1537386784", "taskName":"B", "event":"start"},
{"date":"2018-09-19T22:55:53.1537386953", "taskName":"V", "event":"end"},
...
```

## Generating Visualization Events

Once desired build is done, it's time to dump raw events in place we need in order to render them.
This can be done by running:

```sh
xcode-build-times generate [--events-file <path>]
```

**NOTE**: You can use a different timings file by passing `--events-file` parameter

## Open gantt.html

It's time to see results. Just open **xcode-build-times-chart/gantt.html**.

## Uninstallation

Once you are done benchmarking your project and want to remove the "Timing START' / "Timing END" build phases from your projects, just run:

```sh
xcode-build-times uninstall ~/Projects/<My_slowly_building_project>/
```

(You can also delete your events file and the `xcode-build-times-chart/` containing your reports)

---

# Libraries and Kudos

[d3js](https://d3js.org/) - JavaScript library for manipulating documents based on data  
[xcodeproj](https://github.com/CocoaPods/Xcodeproj) - Create and modify Xcode projects from Ruby.  
[d3js-gantt](https://github.com/dk8996/Gantt-Chart) - Gantt chart for d3js by [@dk8996](https://github.com/dk8996)

# P.S.

If something doesn't work - please [fix it](https://github.com/PaulTaykalo/xcode-build-times-rendering/pulls)
