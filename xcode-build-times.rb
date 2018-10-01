#!/usr/bin/ruby
#encoding: utf-8
require 'xcodeproj'
require_relative 'stringcolors'

class XcodeBuildTimer
  def add_timings(xcodeproj_path)
    begin
      project = Xcodeproj::Project.open(xcodeproj_path)
    rescue Exception => e
      puts '[???]'.yellow + " There were some problems in opening #{xcodeproj_path} : #{e.to_s}"
      return
    end

    project.native_targets.each do |target|
      unless target.shell_script_build_phases.find {|phase| phase.name == 'Timing START'
      }
        timing_start = target.new_shell_script_build_phase('Timing START')
        timing_start.shell_script = <<-eos
      DATE=`date "+%Y-%m-%dT%H:%M:%S.%s"`
      echo "{\\"date\\":\\"$DATE\\", \\"taskName\\":\\"$TARGETNAME\\", \\"event\\":\\"start\\"}," >> ~/.timings.xcode
        eos

        index = target.build_phases.index {|phase| (defined? phase.name) && phase.name == 'Timing START'
        }
        target.build_phases.move_from(index, 0)

      end

      unless target.shell_script_build_phases.find {|phase| phase.name == 'Timing END'
      }

        timing_end = target.new_shell_script_build_phase('Timing END')
        timing_end.shell_script = <<-eos
      DATE=`date "+%Y-%m-%dT%H:%M:%S.%s"`
      echo "{\\"date\\":\\"$DATE\\", \\"taskName\\":\\"$TARGETNAME\\", \\"event\\":\\"end\\"}," >> ~/.timings.xcode
        eos
      end

    end

    project.save

  end

  def remove_timings(xcodeproj_path)
    begin
      project = Xcodeproj::Project.open(xcodeproj_path)
    rescue Exception => e
      puts '[???]'.yellow + " There were some problems in opening #{xcodeproj_path} : #{e.to_s}"
      return
    end

    project.native_targets.each do |target|
      start_target = target.shell_script_build_phases.find {|phase| phase.name == 'Timing START' }
      start_target.remove_from_project if start_target

      end_target = target.shell_script_build_phases.find {|phase| phase.name == 'Timing END' }
      end_target.remove_from_project if end_target
    end

    project.save

  end

  def inject_timings_to_all_projects(inject_path)

    Dir.chdir(inject_path) {
      all_xcode_projects = Dir.glob('**/*.xcodeproj').reject {|path| !File.directory?(path)}
      all_xcode_projects.each {|xcodeproj|
        puts "Adding timings phases to #{xcodeproj.green}"
        add_timings(xcodeproj)
      }
    }
  end

  def remove_timings_from_all_projects(inject_path)

    Dir.chdir(inject_path) {
      all_xcode_projects = Dir.glob('**/*.xcodeproj').reject {|path| !File.directory?(path)}
      all_xcode_projects.each {|xcodeproj|
        puts "Removing timings phases from #{xcodeproj.green}"
        remove_timings(xcodeproj)
      }
    }
  end


  def generate_events_js
    begin
      raw_events = File.read(File.expand_path('~/.timings.xcode'))
    rescue
      puts '[???]'.yellow + " There were some problems in opening ~/.timings.xcode (It doesn't seem that build was created)"
      return
    end

    js_valid_file = "var raw_events = [\n" + raw_events + "\n]"
    open('gantt/events.js', 'w') do |f|
      f << js_valid_file
      puts '[EVENTS]'.green + " Updated events.js at #{f.path}\n" +
           '[EVENTS]'.green + " It's time to open gantt.html"
    end
  end

end

path = nil
command = 'unknown'

arguments = ARGV.clone
until arguments.empty?
  item = arguments.shift
  if item == 'install'
    command = item
    path = arguments.shift
  end

  if item == 'uninstall'
    command = item
    path = arguments.shift
  end

  if item == 'generate'
    command = item
  end
end

if command == 'generate'
  XcodeBuildTimer.new.generate_events_js
elsif command == 'install'
  puts '[?PATH?]'.yellow + 'Please provide path' unless path
  XcodeBuildTimer.new.inject_timings_to_all_projects(path)
elsif command == 'uninstall'
  puts '[?PATH?]'.yellow + 'Please provide path' unless path
  XcodeBuildTimer.new.remove_timings_from_all_projects(path)
elsif
  puts '[HELP] '.yellow + 'Run ' + 'xcode-build-time.rb install   <path>'.magenta + ' to install build script phases in all .xcodeproj files in specified dir' + "\n" +
       '[HELP] '.yellow + 'Run ' + 'xcode-build-time.rb uninstall <path>'.magenta + ' to uninstall build script phases from all .xcodeproj files in specified dir' + "\n" +
       '[HELP] '.yellow + 'Run ' + 'xcode-build-time.rb generate        '.magenta + ' to generate events for visualization after build'
end
