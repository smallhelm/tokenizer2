# tokenizer2
tokenize any text stream given some basic regex rules to match tokens

# Example
```js
var tokenizer2 = require('tokenizer2');

//create a readable/writeable stream
var token_stream = tokenizer2();

//make some rules
token_stream.addRule(/^[\s]+$/               , 'whitespace');
token_stream.addRule(/^"([^"]|\\")*"$/       , 'string');
token_stream.addRule(/^[-+]?[0-9]+\.?[0-9]*$/, 'number');
token_stream.addRule(/^[^"0-9\s][^\s]*$/     , 'symbol');

//write some info to the console
token_stream.on('data', function(token){
  console.log('token:', token);
});
token_stream.on('end', function(){
  console.log('DONE');
});

//pipe in some data
fs.createReadStream('./demo.txt').pipe(token_stream);
```
demo.txt
```txt
print "some multi-
lined string"

123.25 times -10
```
The output
```js
token: {type: 'symbol'    , src: 'print', line: 1, col: 1 }
token: {type: 'whitespace', src: ' ', line: 1, col: 6 }
token: {type: 'string'    , src: '"some multi-\nlined string"', line: 1, col: 7 }
token: {type: 'whitespace', src: '\n\n', line: 2, col: 14 }
token: {type: 'number'    , src: '123.25', line: 4, col: 1 }
token: {type: 'whitespace', src: ' ', line: 4, col: 7 }
token: {type: 'symbol'    , src: 'times', line: 4, col: 8 }
token: {type: 'whitespace', src: ' ', line: 4, col: 13 }
token: {type: 'number'    , src: '-10', line: 4, col: 14 }
token: {type: 'whitespace', src: '\n', line: 4, col: 17 }
DONE
```

### What if more than one rule matches a token? 

`token_stream.addRule` adds rules in an order sensitive way. The first matching rule will be used.

### Why tokenizer2

The key difference between this and [tokenizer](https://github.com/Floby/node-tokenizer) is the way it matches rules. `tokenizer` uses [disect](https://github.com/Floby/node-disect) to do bisection on a chunk of text. This is a fast approach, however doesn't work well if your regex rule expects some specific characters at the end of the token. To solve this tokenizer2 simply starts at the beginning of the chunk, and finds the longest matching rule.

Other differences
 * tokenizer2 wraps [through2.obj](https://www.npmjs.com/package/through2) so all the node stream APIs should work nicely
 * tokenizer2 uses the standard `'data'` event to emit the tokens
 * tokenizer2 emits line and col numbers

# License

The MIT License (MIT)

Copyright (c) 2015 Small Helm LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
