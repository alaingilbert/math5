class Drawer
  constructor: (@tree, @ctx) ->
    @x = 0
    @y = Math5.lineHeight / 2
    @ctx.textBaseline = 'middle'
    @ctx.textAlign = 'left'
    @ctx.font = '20px courier new'
    @ctx.fillStyle = '#000'
    @ctx.strokeStyle = '#000'
    do @drawBorder
    @draw @tree, @x, @y


  drawBorder: ->
    borderWidth = @tree.width
    borderHeight = @tree.height
    do @ctx.save
    @ctx.strokeStyle = '#ccc'
    @ctx.strokeRect 0.5, 0.5, borderWidth, borderHeight
    do @ctx.restore


  draw: (node, x, y) ->
    if node instanceof AssignmentNode
      @drawAssignmentNode node, x, y
    else if node instanceof BinaryNode
      @drawBinaryNode node, x, y
    else if node instanceof IdentifierNode
      @drawIdentifierNode node, x, y
    else if node instanceof NumberNode
      @drawNumberNode node, x, y
    else if node instanceof ExpressionNode
      @drawExpressionNode node, x, y
    else if node instanceof FunctionCallNode
      @drawFunctionCallNode node, x, y


  drawExpressionNode: (node, x, y) ->
    @draw node.expr, x, y


  drawAssignmentNode: (node, x, y) ->
    name = node.name
    value = node.value
    initialY = y

    y += @centerVerticalLeft name, value
    @draw name, x, y
    y = initialY

    x += name.width
    y += @centerVertical name, value
    @drawText '=', x, y
    y = initialY

    x += 20
    y += @centerVerticalRight name, value
    @draw value, x, y


  drawBinaryNode: (node, x, y) ->
    left = node.left
    operator = node.operator
    right = node.right
    if operator == '/'
      initialX = x
      initialY = y

      x += @centerTop left, right
      @draw left, x, y
      x = initialX

      y += left.height - Math5.lineHeight/2
      @drawDivisionBar left, right, x, y
      y = initialY

      x += @centerBottom left, right
      y += left.height
      @draw right, x, y
    else
      initialY = y
      y += @centerVerticalLeft left, right
      @draw left, x, y
      y = initialY

      x += left.width
      y += @centerVertical left, right
      @drawText operator, x, y
      y = initialY

      x += 20
      y += @centerVerticalRight left, right
      @draw right, x, y


  drawDivisionBar: (left, right, x, y) ->
    y -= 0.5
    do @ctx.save
    @ctx.moveTo x, y
    @ctx.lineTo x + Math.max(left.width, right.width), y
    do @ctx.stroke
    do @ctx.restore


  centerTop: (left, right) ->
    if left.width < right.width
      return (right.width - left.width) / 2
    return 0


  centerBottom: (left, right) ->
    if left.width > right.width
      return (left.width - right.width) / 2
    return 0


  centerVerticalLeft: (left, right) ->
    if left.height < right.height
      return (right.height - left.height) / 2
    return 0


  centerVerticalRight: (left, right) ->
    if left.height > right.height
      return (left.height - right.height) / 2
    return 0


  centerVertical: (left, right) ->
    (Math.max(left.height, right.height) - Math5.fontSize) / 2


  drawFunctionCallNode: (node, x, y) ->
    switch node.name
      when 'sqrt' then @drawSquareRootNode node, x, y


  drawSquareRootNode: (node, x, y) ->
    do @ctx.save
    do @ctx.beginPath
    @ctx.moveTo x, y + node.height - Math5.fontSize
    @ctx.lineTo x + 10, y + node.height - Math5.fontSize/2
    @ctx.lineTo x + 15, y - Math5.fontSize/2
    @ctx.lineTo x + 20 + node.args[0].width, y - Math5.fontSize/2
    @ctx.lineTo x + 20 + node.args[0].width, y
    do @ctx.stroke
    do @ctx.restore

    x += Math5.fontSize
    @draw node.args[0], x, y


  drawIdentifierNode: (node, x, y) ->
    value = node.value
    @drawText value, x, y


  drawNumberNode: (node, x, y) ->
    value = node.value
    @drawText value, x, y


  drawText: (text, x, y) ->
    do @ctx.save
    @ctx.fillText text, x, y
    do @ctx.restore
