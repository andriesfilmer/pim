# Ensure dartsass builds before assets precompile
if Rake::Task.task_defined?("assets:precompile")
  Rake::Task["assets:precompile"].enhance(["dartsass:build"])
end
