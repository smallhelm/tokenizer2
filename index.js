var core = require("./core");
var through2 = require("through2");

module.exports = function(){
  var t = core(function(token){
    token_stream.push(token);
  });

  var token_stream = through2.obj(function(chunk, enc, done){
    t.onText(chunk.toString());
    done();
  }, function(done){
    try{
      t.end();
      done();
    }catch(err){
      done(err);
    }
  });
  token_stream.addRule = t.addRule;
  return token_stream;
};
