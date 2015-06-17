var through2 = require('through2');

var findMatchingRule = function(rules, text){
  var i;
  for(i=0; i<rules.length; i++)
    if(rules[i].regex.test(text))
      return rules[i];
  return undefined;
};

var findMaxIndexAndRule = function(rules, text){
  var i, rule, last_matching_rule;
  for(i=0; i<text.length; i++){
    rule = findMatchingRule(rules, text.substring(0, i + 1));
    if(rule)
      last_matching_rule = rule;
    else if(last_matching_rule)
      return {max_index: i, rule: last_matching_rule};
  }
  return last_matching_rule ? {max_index: text.length, rule: last_matching_rule} : {max_index: 0, rule: undefined};
};

module.exports = function(){
  var buffer = '';
  var rules = [];
  var line = 1;
  var col = 1;

  var onToken = function(src, type){
    token_stream.push({
      type: type,
      src: src,
      line: line,
      col: col
    });
    var lines = src.split("\n");
    line += lines.length - 1;
    col = (lines.length > 1 ? 1 : col) + lines[lines.length - 1].length;
  };

  var token_stream = through2.obj(function(chunk, enc, done){
    var str = buffer + chunk.toString();
    var m = findMaxIndexAndRule(rules, str);
    while(m.rule && m.max_index !== str.length){
      onToken(str.substring(0, m.max_index), m.rule.type);

      //now find the next token
      str = str.substring(m.max_index);
      m = findMaxIndexAndRule(rules, str);
    }
    buffer = str;
    done();
  }, function(done){
    if(buffer.length === 0)
      return done();

    var rule = findMatchingRule(rules, buffer);
    if(!rule)
      return done(new Error('unable to tokenize: ' + buffer));

    onToken(buffer, rule.type);
    done();
  });
  token_stream.addRule = function(regex, type){
    rules.push({regex: regex, type: type});
  };
  return token_stream;
};
