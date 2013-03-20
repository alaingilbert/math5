class UnaryNode extends Node
  constructor: (@operator, @expression) ->
    @width = Math5.fontSize + @expression.width
    @height = Math5.fontSize
