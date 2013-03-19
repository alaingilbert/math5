class Math5
  @fontSize = 20
  @lineHeight = 20

  constructor: (mathElement) ->
    @mathElement = mathElement
    @text = mathElement.textContent
    @lexer = new Lexer @text
    @parser = new Parser @lexer
    @tree = @parser.getTree()
    console.log @tree
    @canvas = document.createElement 'canvas'
    @canvas.width = @tree.width + 1 + 200
    @canvas.height = @tree.height + 1 + 200
    @ctx = @canvas.getContext '2d'
    @drawer = new Drawer @tree, @ctx
    @mathElement.removeChild @mathElement.firstChild
    @mathElement.appendChild @canvas
