var Lexer = function (text) {
   this.text = text;
   this.tokens = this.getTokens(this.text);
   console.log('Tokens', this.tokens);
   this.idx = 0;
};


Lexer.prototype.getTokens = function (text) {
   var rgx = new RegExp(/(sqrt|[a-z]+|[0-9]+\.[0-9]+|[0-9]+|\(|\)|=|<|>|<=|>=|\+-|-|\+|\^|\*\*|\/|\*)/gi);
   var token;
   var tokens = [];
   while (token = rgx.exec(text)) {
      tokens.push(token[1]);
   }
   return tokens;
};


Lexer.prototype.peek = function () {
   return this.tokens[this.idx];
};


Lexer.prototype.next = function () {
   return this.tokens[this.idx++];
};



var Math5 = {
   init: function () {
      var elms = document.querySelectorAll('.math');
      for (var i=0; i<elms.length; i++) {
         this.parse(elms[i]);
      }
   },


   parse: function (el) {
      var text = el.innerText;
      console.log(text);
      var tree = this.parseText(text);
      this.fontSize = 15;
      this.lineHeight = 20;
      this.px = 0;
      this.py = 0;

      var canvas = document.createElement('canvas');
      canvas.width = tree.length * this.fontSize;
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
   },


   drawTree: function (tree, x, y) {
      var tmp = tree;
      if (tmp.hasOwnProperty('Assignment')) {
         var yy = y;
         if (tmp.Assignment.name.height == 1) {
            yy = Math.max(tmp.Assignment.name.height, tmp.Assignment.value.height) > 1 ? 2 * this.lineHeight/2 : y;
         }
         this.drawTree(tmp.Assignment.name, x, yy);
         x += this.fontSize * tmp.Assignment.name.length;
         var yy = Math.max(tmp.Assignment.name.height, tmp.Assignment.value.height) > 1 ? 2 * this.lineHeight/2 : y;
         this.c.fillText('=', x, yy);
         x += this.fontSize;
         this.drawTree(tmp.Assignment.value, x, y);
      } else if (tmp.hasOwnProperty('Binary')) {
         var t = x;
         if (tmp.Binary.operator == '/') {
            this.drawTree(tmp.Binary.left, x, y);
            this.c.moveTo(t, y + this.lineHeight - this.lineHeight/2 -2 + 0.5);
            var w = Math.max(tmp.Binary.left.length*this.fontSize, tmp.Binary.right.length*this.fontSize) + t;
            this.c.lineTo(w, y + this.lineHeight - this.lineHeight/2 -2 + 0.5);
            this.c.stroke();
            x = t;
            y += this.lineHeight;
            this.drawTree(tmp.Binary.right, x, y);
         } else {
            var yy = y;
            if (tmp.Binary.right.height > tmp.Binary.left.height && tmp.Binary.left.height <= 1) {
               yy = this.lineHeight;
               yy = y + yy/2;
            }
            var yyy = y;
            if (tmp.Binary.right.height > 1 || tmp.Binary.left.height > 1) {
               yyy = Math.max(tmp.Binary.left.height, tmp.Binary.right.height) > 1 ? 2 * this.lineHeight / 2 : 1 * this.lineHeight/2;
               yyy = y + yyy/2;
            }
            this.drawTree(tmp.Binary.left, x, yy);
            x += this.fontSize * tmp.Binary.left.length;
            this.c.fillText(tmp.Binary.operator, x, yyy);
            x += this.fontSize;
            yy = y;
            if (tmp.Binary.right.height < tmp.Binary.left.height && tmp.Binary.right.height <= 1) {
               yy = this.lineHeight;
               yy = y + yy/2;
            }
            this.drawTree(tmp.Binary.right, x, yy);
         }
      } else if (tmp.hasOwnProperty('Unary')) {
         this.c.fillText(tmp.Unary.operator, x, y);
         x += this.fontSize;
         this.drawTree(tmp.Unary.expression, x, y);
      } else if (tmp.hasOwnProperty('Number')) {
         this.c.fillText(tmp.Number, x, y);
         x += this.fontSize;
      } else if (tmp.hasOwnProperty('Identifier')) {
         this.c.fillText(tmp.Identifier, x, y);
         x += this.fontSize;
      } else if (tmp.hasOwnProperty('Expression')) {
         var yy = y;
         if (tmp.Expression.height > 1) {
            yy = y + (1 * this.lineHeight) / 2
         }
         this.c.fillText('(', x, yy);
         x += this.fontSize;
         this.drawTree(tmp.Expression, x, y);
         x += tmp.Expression.length * this.fontSize;
         this.c.fillText(')', x, yy);
         x += this.fontSize;
      } else {
         console.log('ERR', tmp);
      }
   },


   /**
    *
    */
   parseText: function (text) {
      this.lexer = new Lexer(text);
      var expr = this.parseAssignment();
      console.log('res', expr, expr.length);
      return expr;
   },


   /**
    *
    */
   parseAssignment: function () {
      var token, expr, right;
      expr = this.parseAdditive();
      if (expr) {
         token = this.lexer.peek();
         if (token == '=') {
            this.lexer.next();
            right = this.parseAssignment();
            return { Assignment: { name: expr, value: right }, length: expr.length + right.length + 1, height: Math.max(expr.height, right.height) };
         }
      }
      return expr;
   },

   parseAdditive: function () {
      var token, left, right;
      left = this.parseMultiplicative();
      token = this.lexer.peek();
      if (token == '+' || token == '-') {
         token = this.lexer.next();
         right = this.parseAdditive();
         return { Binary: { operator: token, left: left, right: right }, length: left.length + right.length + 1, height: Math.max(left.height, right.height) };
      }
      return left;
   },


   parseMultiplicative: function () {
      var token, left, right;
      left = this.parseUnary();
      token = this.lexer.peek();
      if (token == '*' || token == '/') {
         token = this.lexer.next();
         right = this.parseMultiplicative();
         var length, height;
         if (token == '*') {
            length = left.length + right.length + 1;
            height = Math.max(left.height, right.height);
         } else {
            length = Math.max(left.length, right.length);
            height = Math.max(left.height, right.height) + 1;
         }
         return { Binary: { operator: token, left: left, right: right }, length: length, height: height };
      }
      return left;
   },


   parseUnary: function () {
      var token, expr;
      token = this.lexer.peek();
      if (token == '-' || token == '+') {
         token = this.lexer.next();
         expr = this.parseUnary();
         return { Unary: { operator: token, expression: expr }, length: expr.length + 1, height: expr.height };
      }
      return this.parsePrimary();
   },


   parsePrimary: function () {
      var token, expr;
      token = this.lexer.peek();
      if (!isNaN(parseInt(token))) {
         this.lexer.next();
         return { Number: token, length: token.length, height: 1 };
      } else if (typeof token == 'string') {
         this.lexer.next();
         if (token == '(') {
            expr = this.parseAssignment();
            token = this.lexer.next();
            if (token != ')') { console.log('ERROR'); }
            return { Expression: expr, length: expr.length + 2, height: expr.height };
         }
         return { Identifier: token, length: token.length, height: 1 };
      }
      return { Weird: token };
   },


   /**
    *
    */
   verify: function (tokens) {
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
   }
};


document.addEventListener('DOMContentLoaded', function () { Math5.init(); }, false);
