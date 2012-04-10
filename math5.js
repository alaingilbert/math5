var Lexer = function (text) {
   this.text = text;
   this.tokens = this.getTokens(this.text);
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
      c.textBaseline = 'top';
      c.textAlign = 'left';
      c.font = this.fontSize + 'px courier new';

      this.drawTree(tree);

      c.strokeRect(0, 0, canvas.width, canvas.height);
      c.restore();

      el.removeChild(el.firstChild);
      el.appendChild(canvas);
   },


   drawTree: function (tree, y) {
      var tmp = tree;
      if (tmp.hasOwnProperty('Assignment')) {
         this.drawTree(tmp.Assignment.name);
         this.c.fillText('=', this.px, this.py);
         this.px += this.fontSize;
         this.drawTree(tmp.Assignment.value);
      } else if (tmp.hasOwnProperty('Binary')) {
         var t = this.px;
         var ty = this.py;
         this.drawTree(tmp.Binary.left);
         if (tmp.Binary.operator == '/') {
            this.c.moveTo(t, this.py + this.lineHeight);
            this.c.lineTo(Math.max(tmp.Binary.left.length*this.fontSize, tmp.Binary.right.length*this.fontSize) + t, this.py + this.lineHeight);
            this.c.stroke();
            this.px = t;
            this.py += this.lineHeight;
         } else {
            this.c.fillText(tmp.Binary.operator, this.px, this.py);
            this.px += this.fontSize;
         }
         this.drawTree(tmp.Binary.right, t);
      } else if (tmp.hasOwnProperty('Unary')) {
         this.c.fillText(tmp.Unary.operator, this.px, this.py);
         this.px += this.fontSize;
         this.drawTree(tmp.Unary.expression);
      } else if (tmp.hasOwnProperty('Number')) {
         this.c.fillText(tmp.Number, this.px, this.py);
         this.px += this.fontSize;
      } else if (tmp.hasOwnProperty('Identifier')) {
         this.c.fillText(tmp.Identifier, this.px, this.py);
         this.px += this.fontSize;
      } else if (tmp.hasOwnProperty('Expression')) {
         this.c.fillText('(', this.px, this.py);
         this.px += this.fontSize;
         this.drawTree(tmp.Expression);
         this.c.fillText(')', this.px, this.py);
         this.px += this.fontSize;
      } else {
         console.log('ERR', tmp);
      }
   },


   drawExp: function (a, b) {
      var c = this.c;
      c.save();
      c.fillText(a, this.px, 10);
      c.font = (this.fontSize - 3) + 'px courier new';
      c.fillText(b, this.px + 9, 8);
      c.fill();
      c.restore();
   },
   drawMin: function (a, b) {
      var c = this.c;
      c.save();
      c.fillText(a + ' - ' + b, this.px, 25);
      c.fill();
      c.restore();
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
         console.log(left, left.length, right, right.length);
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
            length = Math.max(left.length + 1, right.length + 1);
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