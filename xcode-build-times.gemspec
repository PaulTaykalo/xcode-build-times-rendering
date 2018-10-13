Gem::Specification.new do |s|
  s.name        = 'xcode-build-times'
  s.version     = '0.1.0'
  s.date        = '2018-10-13'
  s.summary     = 'Xcode build times visualizer'
  s.description = <<-THEEND
Tool that allows to generate graphical visualization of xcode build process (targets)
For usages examples run:
xcode-build-times
THEEND
  s.authors     = ['Paul Taykalo']
  s.email       = 'tt.kilew@gmail.com'
  s.files       = Dir['lib/**/*.*']
  s.homepage    =
      'https://github.com/PaulTaykalo/xcode-build-times-rendering'
  s.license       = 'MIT'
  s.executables << 'xcode-build-times'
  s.add_runtime_dependency 'xcodeproj', '~> 1.5', '>= 1.5.3'
end