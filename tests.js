var test = require('tape');
var test = require('tape');
var tokenizer = require('./index');

var setup = function(writes, callback){
  var tokens = [];

  var token_stream = tokenizer();

  token_stream.addRule(/^[\s]+$/, 'whitespace');
  token_stream.addRule(/^"([^"\n]|\\")*"$/, 'string');
  token_stream.addRule(/^[^"0-9\s][^\s]*$/, 'symbol');
  token_stream.addRule(/^[-+]?[0-9]+\.?[0-9]*$/, 'number');

  token_stream.on('data', function(token){
    tokens.push([token.type, token.src, token.line, token.col]);
  });
  token_stream.on('end', function(){
    callback(undefined, tokens);
  });

  var nextWrite = function(){
    var write = writes.shift();
    if(!write){
      process.nextTick(function(){
        token_stream.end();
      });
      return;
    }
    process.nextTick(function(){
      token_stream.write(write);
      nextWrite();
    });
  };
  nextWrite();
};

test("the basics", function(t){
  setup([
    'hello world\n',
    ' "a string" ',
    ' 100.25\n'
  ], function(err, tokens){
    if(err) return t.end(err);

    t.deepEquals(tokens[ 0], ['symbol'    , 'hello'     , 1,1]);
    t.deepEquals(tokens[ 1], ['whitespace', ' '         , 1,6]);
    t.deepEquals(tokens[ 2], ['symbol'    , 'world'     , 1,7]);
    t.deepEquals(tokens[ 3], ['whitespace', '\n '       , 1,12]);
    t.deepEquals(tokens[ 4], ['string'    , '"a string"', 2,2]);
    t.deepEquals(tokens[ 5], ['whitespace', '  '        , 2,12]);
    t.deepEquals(tokens[ 6], ['number'    , '100.25'    , 2,14]);
    t.deepEquals(tokens[ 7], ['whitespace', '\n'        , 2,20]);

    t.equals(tokens.length, 8);
    t.end();
  });
});

test("buffering", function(t){
  setup('hello world\n "a string"  100.25\none2three'.split(''), function(err, tokens){
    if(err) return t.end(err);

    t.deepEquals(tokens[ 0], ['symbol'    , 'hello'     , 1,1]);
    t.deepEquals(tokens[ 1], ['whitespace', ' '         , 1,6]);
    t.deepEquals(tokens[ 2], ['symbol'    , 'world'     , 1,7]);
    t.deepEquals(tokens[ 3], ['whitespace', '\n '       , 1,12]);
    t.deepEquals(tokens[ 4], ['string'    , '"a string"', 2,2]);
    t.deepEquals(tokens[ 5], ['whitespace', '  '        , 2,12]);
    t.deepEquals(tokens[ 6], ['number'    , '100.25'    , 2,14]);
    t.deepEquals(tokens[ 7], ['whitespace', '\n'        , 2,20]);
    t.deepEquals(tokens[ 8], ['symbol'    , 'one2three' , 3,1]);

    t.equals(tokens.length, 9);
    t.end();
  });
});

test("error on no match", function(t){
  var token_stream = tokenizer();
  token_stream.addRule(/^[\s]+$/, 'whitespace');
  token_stream.on('data', function(token){
    t.deepEquals(token, {type: 'whitespace', src: ' ', line: 1, col: 1});
  });
  token_stream.on('error', function(err){
    t.equals(String(err), 'Error: unable to tokenize: 10 01');
    t.end();
  });
  token_stream.on('end', function(){
    t.fail('should\'ve failed instead of ending');
  });

  process.nextTick(function(){
    token_stream.write(' 10 01');
    process.nextTick(function(){
      token_stream.end();
    });
  });
});
