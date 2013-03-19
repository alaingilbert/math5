class IdentifierNode extends Node
  constructor: (@value) ->
    @width = @value.length * Math5.fontSize
    @height = Math5.lineHeight
