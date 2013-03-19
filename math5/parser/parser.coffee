class Parser
  constructor: (lexer) ->
    @lexer = lexer


  getTree: ->
    do @parseAssignment


  parseAssignment: ->
    expr = do @parseAdditive
    if expr
      token = do @lexer.peek
      if token.value == '='
        do @lexer.next
        right = do @parseAssignment
        return new AssignmentNode expr, right
    return expr


  parseAdditive: ->
    left = do @parseMultiplicative
    token = do @lexer.peek
    switch token.value
      when '+', '-', '+-'
        do @lexer.next
        right = do @parseAdditive
        return new BinaryNode token.value, left, right
    return left


  parseMultiplicative: ->
    left = do @parseExponent
    token = do @lexer.peek
    switch token.value
      when '*', '/'
        do @lexer.next
        right = do @parseMultiplicative
        return new BinaryNode token.value, left, right
    return left


  parseExponent: ->
    left = do @parseUnary
    token = do @lexer.peek
    switch token.value
      when '^', '**'
        right = do @parseExponent
        return new BinaryNode token.value, left, right
    return left


  parseUnary: ->
    token = do @lexer.peek
    switch token.value
      when '-', '+'
        expr = do @lexer.next
        return new UnaryNode token.value, expr
    return do @parsePrimary


  parsePrimary: ->
    token = do @lexer.peek
    switch token.type
      when 'Identifier'
        do @lexer.next
        if @lexer.peek().value == '('
          return @parseFunctionCall token.value
        return new IdentifierNode token.value
      when 'Number'
        do @lexer.next
        return new NumberNode token.value

    if token.value == '('
      do @lexer.next
      expr = do @parseAssignment
      token = do @lexer.next
      if token.value != ')' then console.log 'ERROR'
      return new ExpressionNode expr


  parseFunctionCall: (name) ->
    token = do @lexer.next
    if token.value != '(' then console.log 'ERROR1'

    token = do @lexer.peek
    if token.value != ')'
      args = do @parseArgumentList

    token = do @lexer.next
    if token.value != ')' then console.log 'ERROR2'

    return new FunctionCallNode name, args


  parseArgumentList: ->
    args = []
    while true
      expr = do @parseAssignment
      if typeof expr is undefined then break
      args.push expr
      token = do @lexer.peek
      if token.value != ',' then break
      do @lexer.next
    return args


  verify: ->
    stack = 0
    for token in @lexer.tokens
      if token == '('
        stack++
      else if token == ')'
        if --stack < 0
          false
    stack == 0
