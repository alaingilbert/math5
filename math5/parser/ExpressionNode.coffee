class ExpressionNode extends Node
  constructor: (@expr) ->
    @width = @expr.width
    @height = @expr.height
