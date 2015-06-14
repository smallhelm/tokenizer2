var through2 = require('through2');

module.exports = function(){
  var findMatchingRule = function(text){
    var i;
    for(i=0; i<rules.length; i++){
      if(rules[i][0].test(text)){
        return rules[i];
      }
    }
    return undefined;
  };
  var findMaxIndex = function(text){
    var i;
    var buf;
    var rule;
    var found_one_yet = false;
    for(i=0; i<text.length; i++){
      buf = text.substring(0, i + 1);
      rule = findMatchingRule(buf);
      if(rule){
        found_one_yet = true;
      }else{
        if(found_one_yet){
          return i;
        }
      }
    }
    return found_one_yet ? text.length : 0;
  };

  var buffer = '';
  var rules = [];
  var line = 1;
  var col = 1;

  var token_stream = through2.obj(function(chunck, enc, done){
    var str = buffer + chunck.toString();
    buffer = '';
    var max_index = findMaxIndex(str);
    while(max_index > 0 && max_index !== str.length){
      var src = str.substring(0, max_index);
      this.push({
        type: findMatchingRule(src)[1],
        src: src,
        line: line,
        col: col
      });
      var lines = src.split("\n");
      line += lines.length - 1;
      if(lines.length > 1){
        col = 1;
      }
      col += lines[lines.length - 1].length;

      str = str.substring(max_index);
      max_index = findMaxIndex(str);
    }
    buffer += str;
    done();
  }, function(done){
    if(buffer.length > 0){
      this.push({
        type: findMatchingRule(buffer)[1],
        src: buffer,
        line: line,
        col: col
      });
    }
    done();
  });
  token_stream.addRule = function(regex, type){
    rules.push([regex, type]);
  };
  return token_stream;
};
