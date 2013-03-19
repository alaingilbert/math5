.PHONY: watch


FILES = math5/lexer/lexer.coffee \
				math5/parser/parser.coffee \
				math5/parser/Node.coffee \
				math5/parser/BinaryNode.coffee \
				math5/parser/AssignmentNode.coffee \
				math5/parser/IdentifierNode.coffee \
				math5/parser/NumberNode.coffee \
				math5/parser/UnaryNode.coffee \
				math5/parser/ExpressionNode.coffee \
				math5/Drawer.coffee \
				math5/math5.coffee \
				math5/bootstrap.coffee

OUTPUT = ./math5.js

all:
	coffee -cj $(OUTPUT) $(FILES)

watch:
	coffee -cwj $(OUTPUT) $(FILES)
