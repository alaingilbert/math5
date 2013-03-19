class Lexer
  constructor: (text) ->
    @text = text
    @tokens = @getTokens text
    @idx = 0


  getTokens: (text) ->
    rgx = new RegExp(/(sqrt|[a-z]+|[0-9]+\.[0-9]+|[0-9]+|\(|\)|=|<|>|<=|>=|\+-|-|\+|\^|\*\*|\/|\*)/gi)
    tokens = []

    while token = rgx.exec text
      tokenValue = token[1]
      obj = value: tokenValue
      if not isNaN tokenValue
        obj.type = 'Number'
      else if '+-*/()^%=;,'.indexOf(tokenValue) >= 0
        obj.type = 'Operator'
      else
        obj.type = 'Identifier'
      tokens.push obj

    return tokens


  peek: -> @tokens[@idx] ? {}


  next: -> @tokens[@idx++] ? {}


class Token
  constructor: ->


class NumberToken extends Token
  constructor: ->


class OperatorToken extends Token
  constructor: ->


class IdentifierToken extends Token
  constructor: ->
