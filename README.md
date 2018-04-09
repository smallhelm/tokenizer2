# tokenizer2

[![build status](https://secure.travis-ci.org/smallhelm/tokenizer2.png)](https://travis-ci.org/smallhelm/tokenizer2)

tokenize any text stream given some basic regex rules to match tokens

**NOTE** This library works well, but I don't use it anymore. I just use `while` loops in a state machine pattern to tokenize. No library needed (or wanted). Here are some examples: [one](https://github.com/farskipper/ecmaless/blob/5503521ccb5c28b03fcb7bbeb3d6dd81e34e1e7a/packages/ecmaless-parser2/src/tokenizer.js#L58), [two](https://github.com/Picolab/node-krl-parser/blob/478df6033ad55f239d89be95c40936cbfaf07058/src/tokenizer.js) Yes it's stateful and verbose, but in my experience this is easier to write and maintain (using TDD of course). Just setup a test-runner and start small then grow it to tokenize everything you want. Once you get the hang of it, it's really easy to figure out how to tokenize something since you have full control of the state machine.


## Example
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
token: {type: 'symbol'    , src: 'print',  line: 1, col:  1 }
token: {type: 'whitespace', src: ' ',      line: 1, col:  6 }
token: {type: 'string'    , src: '"some multi-\nlined string"', line: 1, col: 7 }
token: {type: 'whitespace', src: '\n\n',   line: 2, col: 14 }
token: {type: 'number'    , src: '123.25', line: 4, col:  1 }
token: {type: 'whitespace', src: ' ',      line: 4, col:  7 }
token: {type: 'symbol'    , src: 'times',  line: 4, col:  8 }
token: {type: 'whitespace', src: ' ',      line: 4, col: 13 }
token: {type: 'number'    , src: '-10',    line: 4, col: 14 }
token: {type: 'whitespace', src: '\n',     line: 4, col: 17 }
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

## Non-streaming, synchronous API

If, for whatever reason, you don't want to use the streaming api. There is a lighter weight, synchronous api.

```js
var core = require('tokenizer2/core');

var t = core(function(token){
  //called synchronously on every token found
});


//add rules just like the streaming api
t.addRule(/^[\s]+$/, 'whitespace');

//Give it strings to tokenize
t.onText("some text to tokenize");
t.onText("some more text");

//Call this when it's done
t.end();//this may throw an error
```

## License
MIT
