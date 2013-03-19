class BinaryNode extends Node
  constructor: (@operator, @left, @right) ->
    if operator == '/'
      @width = Math.max @left.width, @right.width
      @height = @left.height + @right.height
    else
      @width = @left.width + 20 + @right.width
      @height = Math.max @left.height, @right.height
