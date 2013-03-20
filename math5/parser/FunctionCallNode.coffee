class FunctionCallNode
  constructor: (@name, @args) ->
      @width = @args[0].width + Math5.fontSize
      @height = @args[0].height
