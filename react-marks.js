(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('react'));
  } else {
    root.ReactMarks = factory(root.React);
  }
})(this, function (React) {
  'use strict';
  var Match = function(regExpResult) {
    if (!regExpResult || regExpResult[0].length==0) return null;
    if (!(this instanceof Match)) return new Match(regExpResult);

    this.text = regExpResult[0];
    this.index = regExpResult["index"];
    this.key = this.index+"-"+this.text.length;
    return this;
  };

  var sortMatchesByIndex = function(first,second) {
    return first.index - second.index;
  };

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  var escapeRegExp = function (string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  var defaultProps = {
    component:"span",
    markComponent:"mark",
    text:"",
    marks:[]
  };

  return React.createClass({
    getDefaultProps: function() { return defaultProps },
    getTransferProps: function() {
      var defaultKeys = Object.keys(defaultProps);
      var transferKeys = Object.keys(this.props).filter(function(key){
        return defaultKeys.indexOf(key) < 0;
      });
      return transferKeys.reduce(function(props,key){
        props[key] = this.props[key];
        return props;
      }.bind(this),{});
    },
    getMatches: function() {
      return this.props.marks.reduce(function(results,test){
        // if the test is not supplied as a regular expression;
        // default it to case-insensitive/global
        if (!(test instanceof RegExp)) {
          test = new RegExp(escapeRegExp(test),'gi');
        }

        //if global regex; loop
        var match;
        if(test.global) {
          while((match = Match(test.exec(this.props.text))) !== null) {
            results.push(match);
          }
        } else {
          if((match = Match(test.exec(this.props.text))) !== null) {
            results.push(match);
          }
        }

        return results;
      }.bind(this),[]);
    },
    renderChildren: function(matches) {
      var beginSlice = 0;
      var children = matches.reduce(function(results,match){
        // text node
        var endSlice = match.index;
        var subtext = this.props.text.slice(beginSlice,endSlice);
        if (subtext.length) { results.push(subtext); }
        beginSlice = endSlice+match.text.length;

        // mark node
        results.push(React.createElement(this.props.markComponent,{key:match.key},match.text));

        return results;
      }.bind(this),[]);

      var subtext = this.props.text.slice(beginSlice);
      if (subtext.length) { children.push(subtext); }

      return children;
    },
    render: function() {
      var props = this.getTransferProps();
      var matches = this.getMatches().sort(sortMatchesByIndex);
      var children = this.renderChildren(matches);
      return ( React.createElement(this.props.component,props,children) )
    }
  });

});