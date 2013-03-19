class AssignmentNode extends Node
  constructor: (@name, @value) ->
    @width = @name.width + 20 + @value.width
    @height = Math.max @name.height, @value.height
