/**
 * Copyright 2011,2012 Alain Gilbert <alain.gilbert.15@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


var Math5 = {};

/**
 *
 */
Math5.Lexer = function (text) {
   this.text = text;
   this.tokens = this.getTokens(this.text);
   if (true) {
      //console.log('Tokens:');
      for (var i=0; i<this.tokens.length; i++) {
         //console.log(this.tokens[i].type, this.tokens[i].value);
      }
   }
   this.idx = 0;
};


/**
 *
 */
Math5.Lexer.prototype.getTokens = function (text) {
   var rgx = new RegExp(/(sqrt|[a-z]+|[0-9]+\.[0-9]+|[0-9]+|\(|\)|=|<|>|<=|>=|\+-|-|\+|\^|\*\*|\/|\*)/gi);
   var token;
   var tokens = [];
   while (token = rgx.exec(text)) {
      var obj = { value: token[1] };
      if (!isNaN(token[1])) {
         obj.type = 'Number';
      } else if ('+-*/()^%=;,'.indexOf(token[1]) >= 0) {
         obj.type = 'Operator';
      } else {
         obj.type = 'Identifier';
      }
      tokens.push(obj);
   }
   return tokens;
};


/**
 *
 */
Math5.Lexer.prototype.peek = function () { return this.tokens[this.idx] || {}; };


/**
 *
 */
Math5.Lexer.prototype.next = function () { return this.tokens[this.idx++] || {}; };


/**
 *
 */
Math5.init = function () {
   var elms = document.querySelectorAll('.math');
   for (var i=0; i<elms.length; i++) {
      this.parse(elms[i]);
   }
};


/**
 *
 */
Math5.parse = function (el) {
   var text = el.textContent;
   var tree = this.parseExpression(text);
   this.fontSize = 20;
   this.realSize = function (size) { return Math.round(size/1.66666); };
   this.lineHeight = 25;
   this.px = 0;
   this.py = 0;

   // Create the canvas element
   var canvas = document.createElement('canvas');
   // TODO: remove
   this.fontSize = 12;
   canvas.width = tree.width * this.fontSize;
   canvas.height = tree.height * this.lineHeight;
   // TODO: remove
   this.fontSize = 20;

   var c = canvas.getContext('2d');
   this.c = c;
   c.save();
   c.textBaseline = 'middle';
   c.textAlign = 'left';
   c.font = this.fontSize + 'px courier new';

   // TODO: remove
   this.fontSize = 12;

   console.log(c.measureText('t').width, this.fontSize);

   this.drawTree(tree, 0, this.lineHeight/2, 20, 25, 0);

   c.strokeStyle = '#ccc';
   c.strokeRect(0, 0, canvas.width, canvas.height);
   c.restore();

   el.removeChild(el.firstChild);
   el.appendChild(canvas);
};


/**
 *
 */
Math5.drawTree = function (tree, x, y, fontSize, lineHeight, level, p) {
   this.c.font = fontSize + 'px courier new';
   var size = this.realSize(fontSize);
   if (tree.hasOwnProperty('Assignment')) {
      var yy = y;
      if (tree.Assignment.name.height == 1) {
         yy = Math.max(tree.Assignment.name.height, tree.Assignment.value.height) > 1 ? lineHeight : y;
      }
      this.drawTree(tree.Assignment.name, x, yy, fontSize, lineHeight, level);
      x += size * tree.Assignment.name.width;
      var yy = Math.max(tree.Assignment.name.height, tree.Assignment.value.height) > 1 ? lineHeight : y;
      this.c.fillText('=', x + size/2, yy);
      x += size * 2;
      this.drawTree(tree.Assignment.value, x, y, fontSize, lineHeight, level);


   } else if (tree.hasOwnProperty('Binary')) {
      if (tree.Binary.operator == '/') {
         var left  = tree.Binary.left
           , right = tree.Binary.right;

         var xx = x;
         if (right.width > left.width) {
            xx = x + (right.width - left.width) * size / 2;
         }

         // TODO: Fix this.
         if (left.height > 1) {
            this.c.save();
            this.c.translate(0, -lineHeight);
         }


         if (level > 0) {
            var t = 0.85 * fontSize;
         } else {
            var t = fontSize;
            var lh = lineHeight;
         }
         var lh = lineHeight * 0.85;
         // Draw the left part
         this.drawTree(left, xx, y, t, lh, level+1, true);

         // Draw the line
         var tmp = Math.round(y + lineHeight - lineHeight/2 -2 + (left.height-1) * lineHeight) + 0.5;
         this.c.moveTo(x, tmp);
         var w = Math.max(left.width, right.width) * size + x;
         this.c.lineTo(w, tmp);
         this.c.stroke();
         y += lineHeight * left.height;

         var xx = x;
         if (right.width < left.width) {
            xx = x + (left.width - right.width) * size / 2;
         }
         // Draw the right part
         this.drawTree(right, xx, y, t, lh, level+1, true);

         // TODO: Fix this.
         if (left.height > 1) {
            this.c.restore();
         }

      } else if (tree.Binary.operator == '^') {
         this.drawTree(tree.Binary.left, x, y, fontSize, lineHeight, level, true);
         x += size;
         y -= 5;
         this.drawTree(tree.Binary.right, x, y, fontSize, lineHeight, level, true);


      } else {
         var yy = y;
         if (tree.Binary.right.height > tree.Binary.left.height && tree.Binary.left.height <= 1) {
            yy = lineHeight;
            yy = y + yy/2;
         }
         var yyy = y;
         if (tree.Binary.right.height > 1 || tree.Binary.left.height > 1) {
            yyy = Math.max(tree.Binary.left.height, tree.Binary.right.height) > 1 ? lineHeight : 1 * lineHeight/2;
            yyy = y + yyy/2;
         }
         this.drawTree(tree.Binary.left, x, yy, fontSize, lineHeight, level);
         x += size * tree.Binary.left.width;

         var t = fontSize;
         this.c.save();
         this.c.font = t + 'px courier new';
         if (tree.Binary.operator == '+-') {
            this.c.fillText('+', x + size/2, yyy-1);
            this.c.fillText('-', x + size/2, yyy+5);
         } else {
            this.c.fillText(tree.Binary.operator, x + size/2, yyy);
         }
         this.c.restore();
         x += size * 2;
         yy = y;
         if (tree.Binary.right.height < tree.Binary.left.height && tree.Binary.right.height <= 1) {
            yy = lineHeight;
            yy = y + yy/2;
         }
         this.drawTree(tree.Binary.right, x, yy, fontSize, lineHeight, level);
      }


   } else if (tree.hasOwnProperty('Unary')) {
      this.c.fillText(tree.Unary.operator, x, y);
      x += size;
      this.drawTree(tree.Unary.expression, x, y, fontSize, lineHeight, level);


   } else if (tree.hasOwnProperty('Number')) {
      this.c.fillText(tree.Number, x, y);


   } else if (tree.hasOwnProperty('Identifier')) {
      this.c.fillText(tree.Identifier, x, y);


   } else if (tree.hasOwnProperty('Expression')) {
      var yy = y;
      if (tree.Expression.height > 1) {
         yy = y + (1 * lineHeight) / 2
      }
      if (!p) {
         this.c.fillText('(', x, yy);
         x += size;
      }
      this.drawTree(tree.Expression, x, y, fontSize, lineHeight, level);
      x += tree.Expression.width * size;
      if (!p) {
         this.c.fillText(')', x, yy);
      }


   } else if (tree.hasOwnProperty('FunctionCall')) {
      this.c.beginPath();
      this.c.moveTo(x, y + (tree.height - 1) * lineHeight);
      this.c.lineTo(x + Math.ceil(size/2) + 0.5, y + (tree.height - 1) * lineHeight + lineHeight/2 - 5);
      this.c.lineTo(x + Math.ceil(size/2) + 0.5, y - lineHeight/2 +1.5);
      this.c.lineTo(x + size + tree.FunctionCall.args[0].width*size-1.5 + size, y - lineHeight/2 + 1.5);
      this.c.lineTo(x + size + tree.FunctionCall.args[0].width*size-1.5 + size, y - lineHeight/2 + 5.5);
      this.c.stroke();

      x += (1) * size;
      this.drawTree(tree.FunctionCall.args[0], x, y, fontSize, lineHeight, level);


   } else {
      console.log('ERR', tree);
   }
};


/**
 *
 */
Math5.parseExpression = function (text) {
   this.lexer = new this.Lexer(text);
   var expr = this.parseAssignment();
   console.log('res', expr, expr.width);
   return expr;
};


/**
 *
 */
Math5.parseAssignment = function () {
   var token, expr, right, width, height;
   expr = this.parseAdditive();
   if (expr) {
      token = this.lexer.peek();
      if (token.value == '=') {
         this.lexer.next();
         right = this.parseAssignment();
         width = expr.width + right.width + 2;
         height = Math.max(expr.height, right.height);
         return { Assignment: { name: expr, value: right }, width: width, height: height };
      }
   }
   return expr;
};


/**
 *
 */
Math5.parseAdditive = function () {
   var token, left, right, width, height;
   left = this.parseMultiplicative();
   token = this.lexer.peek();
   if (token.value == '+' || token.value == '-' || token.value == '+-') {
      token = this.lexer.next();
      right = this.parseAdditive();
      width = left.width + right.width + 2;
      height = Math.max(left.height, right.height);
      return { Binary: { operator: token.value, left: left, right: right }, width: width, height: height };
   }
   return left;
};


/**
 *
 */
Math5.parseMultiplicative = function (p) {
   var token, left, right;
   left = this.parseExponent(p);
   token = this.lexer.peek();
   if (token.value == '*' || token.value == '/') {
      if (token.value != '/' && left.hasOwnProperty('Expression') && p) {
         left.useless = false;
         left.width += 2;
      }
      token = this.lexer.next();
      if (token.value == '/') {
         if (left.hasOwnProperty('Expression') && !left.useless) {
            left.useless = true;
            left.width -= 2;
         }
         right = this.parseMultiplicative(true);
      } else {
         right = this.parseMultiplicative();
      }
      var width, height;
      if (token.value == '*') {
         width = left.width + right.width + 2;
         height = Math.max(left.height, right.height);
      } else if (token.value == '/') {
         width = Math.max(left.width, right.width);
         height = Math.max(left.height, right.height) + 1;
      }
      return { Binary: { operator: token.value, left: left, right: right }, width: width, height: height };
   }
   return left;
};


/**
 *
 */
Math5.parseExponent = function (p) {
   var token, left, right, width, height;
   left = this.parseUnary(p);
   token = this.lexer.peek();
   if (token.value == '^') {
      if (left.hasOwnProperty('Expression')) {
         left.useless = true;
         left.width -= 2;
      }
      token = this.lexer.next();
      right = this.parseExponent();
      width = left.width + right.width;
      height = Math.max(left.height, right.height);
      return { Binary: { operator: token.value, left: left, right: right }, width: width, height: height };
   }
   return left;
};


/**
 *
 */
Math5.parseUnary = function (p) {
   var token, expr;
   token = this.lexer.peek();
   if (token.value == '-' || token.value == '+') {
      token = this.lexer.next();
      expr = this.parseUnary();
      return { Unary: { operator: token.value, expression: expr }, width: expr.width + 1, height: expr.height };
   }
   return this.parsePrimary(p);
};


/**
 *
 */
Math5.parsePrimary = function (p) {
   var token, expr;
   token = this.lexer.peek();

   if (token.type == 'Identifier') {
      token = this.lexer.next();
      if (this.lexer.peek().value == '(') {
         return this.parseFunctionCall(token.value);
      } else {
         return { Identifier: token.value, width: token.value.length, height: 1 };
      }
   }

   if (token.type == 'Number') {
      this.lexer.next();
      return { Number: token.value, width: token.value.length, height: 1 };
   }

   if (token.value == '(') {
      this.lexer.next();
      expr = this.parseAssignment();
      token = this.lexer.next();
      if (token.value != ')') { console.log('ERROR'); }
      return { Expression: expr, width: expr.width + (p ? 0 : 2), height: expr.height, useless: (p ? true : false) };
   }
   return { Weird: token };
};


/**
 *
 */
Math5.parseArgumentList = function () {
   var token, expr, args = [];

   while (true) {
      expr = this.parseAssignment();
      if (typeof expr === 'undefined') { break; }
      args.push(expr);
      token = this.lexer.peek();
      if (token.value != ',') { break; }
      this.lexer.next();
   }
   return args;
};


/**
 *
 */
Math5.parseFunctionCall = function (name) {
   var token, args = [], width, height;

   token = this.lexer.next();
   if (token.value != '(') { console.log('ERROR1'); }

   token = this.lexer.peek();
   if (token.value != ')') {
      args = this.parseArgumentList();
   }
   token = this.lexer.next();
   if (token.value != ')') { console.log('ERROR2'); }

   width = name.length + args[0].width + 2;

   if (name == 'sqrt') {
      width = 1 + args[0].width + 1;
   }

   height = 0;
   for (var i=0; i<args.length; i++) {
      if (args[i].height > height) {
         height = args[i].height;
      }
   }

   return { FunctionCall: { name: name, args: args }, width: width, height: height };
};


/**
 *
 */
Math5.verify = function (tokens) {
   var stack = [];
   for (var i=0; i<tokens.length; i++) {
      var token = tokens[i];
      if (token == '(') { stack.push(token); }
      if (token == ')') {
         if (stack.length <= 0) { return false; }
         stack.pop();
      }
   }
   return stack.length == 0;
};


/**
 * On DOM ready, parse each expressions.
 */
document.addEventListener('DOMContentLoaded', function () { Math5.init(); }, false);
