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
   console.log('Tokens', this.tokens);
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
      tokens.push(token[1]);
   }
   return tokens;
};


/**
 *
 */
Math5.Lexer.prototype.peek = function () { return this.tokens[this.idx]; };


/**
 *
 */
Math5.Lexer.prototype.next = function () { return this.tokens[this.idx++]; };


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
   var text = el.innerText;
   console.log(text);
   var tree = this.parseExpression(text);
   this.fontSize = 15;
   this.lineHeight = 20;
   this.px = 0;
   this.py = 0;

   // Create the canvas element
   var canvas = document.createElement('canvas');
   canvas.width = tree.width * this.fontSize;
   canvas.height = tree.height * this.lineHeight;

   var c = canvas.getContext('2d');
   this.c = c;
   c.save();
   c.textBaseline = 'middle';
   c.textAlign = 'left';
   c.font = this.fontSize + 'px courier new';

   this.drawTree(tree, 0, this.lineHeight/2);

   c.strokeStyle = '#ccc';
   c.strokeRect(0, 0, canvas.width, canvas.height);
   c.restore();

   el.removeChild(el.firstChild);
   el.appendChild(canvas);
};


/**
 *
 */
Math5.drawTree = function (tree, x, y) {
   if (tree.hasOwnProperty('Assignment')) {
      var yy = y;
      if (tree.Assignment.name.height == 1) {
         yy = Math.max(tree.Assignment.name.height, tree.Assignment.value.height) > 1 ? this.lineHeight : y;
      }
      this.drawTree(tree.Assignment.name, x, yy);
      x += this.fontSize * tree.Assignment.name.width;
      var yy = Math.max(tree.Assignment.name.height, tree.Assignment.value.height) > 1 ? this.lineHeight : y;
      this.c.fillText('=', x, yy);
      x += this.fontSize;
      this.drawTree(tree.Assignment.value, x, y);


   } else if (tree.hasOwnProperty('Binary')) {
      if (tree.Binary.operator == '/') {
         var left  = tree.Binary.left
           , right = tree.Binary.right;

         var xx = x;
         if (right.width > left.width) {
            xx = x + (right.width - left.width) * this.fontSize / 2;
         }

         // Draw the left part
         this.drawTree(left, xx, y);

         // Draw the line
         this.c.moveTo(x, y + this.lineHeight - this.lineHeight/2 -2 + 0.5);
         var w = Math.max(left.width, right.width) * this.fontSize + x;
         this.c.lineTo(w, y + this.lineHeight - this.lineHeight/2 -2 + 0.5);
         this.c.stroke();
         y += this.lineHeight;

         var xx = x;
         if (right.width < left.width) {
            xx = x + (left.width - right.width) * this.fontSize / 2;
         }
         // Draw the right part
         this.drawTree(right, xx, y);


      } else {
         var yy = y;
         if (tree.Binary.right.height > tree.Binary.left.height && tree.Binary.left.height <= 1) {
            yy = this.lineHeight;
            yy = y + yy/2;
         }
         var yyy = y;
         if (tree.Binary.right.height > 1 || tree.Binary.left.height > 1) {
            yyy = Math.max(tree.Binary.left.height, tree.Binary.right.height) > 1 ? this.lineHeight : 1 * this.lineHeight/2;
            yyy = y + yyy/2;
         }
         this.drawTree(tree.Binary.left, x, yy);
         x += this.fontSize * tree.Binary.left.width;
         this.c.fillText(tree.Binary.operator, x, yyy);
         x += this.fontSize;
         yy = y;
         if (tree.Binary.right.height < tree.Binary.left.height && tree.Binary.right.height <= 1) {
            yy = this.lineHeight;
            yy = y + yy/2;
         }
         this.drawTree(tree.Binary.right, x, yy);
      }


   } else if (tree.hasOwnProperty('Unary')) {
      this.c.fillText(tree.Unary.operator, x, y);
      x += this.fontSize;
      this.drawTree(tree.Unary.expression, x, y);


   } else if (tree.hasOwnProperty('Number')) {
      this.c.fillText(tree.Number, x, y);


   } else if (tree.hasOwnProperty('Identifier')) {
      this.c.fillText(tree.Identifier, x, y);


   } else if (tree.hasOwnProperty('Expression')) {
      var yy = y;
      if (tree.Expression.height > 1) {
         yy = y + (1 * this.lineHeight) / 2
      }
      this.c.fillText('(', x, yy);
      x += this.fontSize;
      this.drawTree(tree.Expression, x, y);
      x += tree.Expression.width * this.fontSize;
      this.c.fillText(')', x, yy);


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
   var token, expr, right;
   expr = this.parseAdditive();
   if (expr) {
      token = this.lexer.peek();
      if (token == '=') {
         this.lexer.next();
         right = this.parseAssignment();
         return { Assignment: { name: expr, value: right }, width: expr.width + right.width + 1, height: Math.max(expr.height, right.height) };
      }
   }
   return expr;
};


/**
 *
 */
Math5.parseAdditive = function () {
   var token, left, right;
   left = this.parseMultiplicative();
   token = this.lexer.peek();
   if (token == '+' || token == '-') {
      token = this.lexer.next();
      right = this.parseAdditive();
      return { Binary: { operator: token, left: left, right: right }, width: left.width + right.width + 1, height: Math.max(left.height, right.height) };
   }
   return left;
};


/**
 *
 */
Math5.parseMultiplicative = function () {
   var token, left, right;
   left = this.parseUnary();
   token = this.lexer.peek();
   if (token == '*' || token == '/') {
      token = this.lexer.next();
      right = this.parseMultiplicative();
      var width, height;
      if (token == '*') {
         width = left.width + right.width + 1;
         height = Math.max(left.height, right.height);
      } else {
         width = Math.max(left.width, right.width);
         height = Math.max(left.height, right.height) + 1;
      }
      return { Binary: { operator: token, left: left, right: right }, width: width, height: height };
   }
   return left;
};


/**
 *
 */
Math5.parseUnary = function () {
   var token, expr;
   token = this.lexer.peek();
   if (token == '-' || token == '+') {
      token = this.lexer.next();
      expr = this.parseUnary();
      return { Unary: { operator: token, expression: expr }, width: expr.width + 1, height: expr.height };
   }
   return this.parsePrimary();
};


/**
 *
 */
Math5.parsePrimary = function () {
   var token, expr;
   token = this.lexer.peek();
   if (!isNaN(parseInt(token))) {
      this.lexer.next();
      return { Number: token, width: token.length, height: 1 };
   } else if (typeof token == 'string') {
      this.lexer.next();
      if (token == '(') {
         expr = this.parseAssignment();
         token = this.lexer.next();
         if (token != ')') { console.log('ERROR'); }
         return { Expression: expr, width: expr.width + 2, height: expr.height };
      }
      return { Identifier: token, width: token.length, height: 1 };
   }
   return { Weird: token };
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
