(function (root,React) {
  'use strict';
  var Match = function(regExpResult) {
    this.text = regExpResult[0];
    this.index = regExpResult["index"];

    this.key = this.index+"-"+this.text.length;
    return this;
  }

  var getMatches = function(text,tests) {
    return tests.reduce(function(results,test){
      // if the test is not supplied as a regular expression;
      // default it to case-insensitive/global
      if (!(test instanceof RegExp)) {
        test = new RegExp(test,'gi'); 
      }

      //if global regex; loop
      var result;
      if(test.global) {
        while((result = test.exec(text)) !== null) {
          results.push(new Match(result));
        }
      } else {
        if((result = test.exec(text)) !== null) {
          results.push(new Match(result));
        }
      }

      return results;
    },[]);
  };

  var sortMatches = function(results) {
    return results.sort(function(first,second){
      return first.index - second.index;
    })
  }

  var getChildNodes = function(text,matches,nodeClass) {
    var beginSlice = 0;
    var children = matches.reduce(function(results,match){
      // text node
      var endSlice = match.index;
      var subtext = text.slice(beginSlice,endSlice);
      if (subtext.length) { results.push(subtext); }
      beginSlice = endSlice+match.text.length;

      // mark node
      console.log(match.text);
      results.push(React.createElement(nodeClass,{key:match.key},match.text));

      return results;
    },[]);

    var subtext = text.slice(beginSlice);
    if (subtext.length) { children.push(subtext); }

    return children;
  }

  var MarkedComponent = React.createClass({
    getDefaultProps: function() { return {
      component:"span",
      markComponent:"mark",
      text:"",
      marks:[]
    }},
    render: function() {
      var matches;
      matches = getMatches( this.props.text, this.props.marks );
      matches = sortMatches( matches );

      var children = getChildNodes.call(this,this.props.text,matches,this.props.markComponent);
      
      return ( React.DOM.span({},children) )
    }
  });

  root.MarkedComponent = MarkedComponent;
})(this,this.React);