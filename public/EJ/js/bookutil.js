function stripPath(url){
  var slash = url.lastIndexOf("/");
  return (slash == -1) ? url : url.slice(slash + 1);
}

var decentEval = function () {
  window.eval("var __TEST = true;");
  var found = window.__TEST === true;
  if (found)
    delete window.__TEST;
  return found;
}();

function addPoint(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function placeElement(e, p) {
  setElementPosition(e, p);
  setElementDimensions(e, p);
}

var dimMode = function(){
  var mode = undefined;
  return function(){
    if (mode == undefined) {
      var test = DIV(null, "q");
      test.style.width = "100px";
      test.style.borderWidth = "5px";
      test.style.borderStyle = "solid";
      test.style.visibility = "hidden";
      document.body.appendChild(test);
      mode = test.offsetWidth == 100 ? "precise" : "standard";
      removeElement(test);
    }
    return mode;
  }
}();

function growElement(node) {
  setElementDimensions(node, {w: node.parentNode.clientWidth, h: node.parentNode.clientHeight});
}

function centerElement(node, pos) {
  setElementPosition(node, {x: pos.x - node.offsetWidth / 2, y: pos.y - node.offsetHeight / 2});
}

function attach(event, func) {
  return function(element){connect(element, event, func);};
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

function forEachIn(object, action) {
  try {
    for (var property in object) {
      if (Object.prototype.hasOwnProperty.call(object, property))
        action(property, object[property]);
    }
  }
  catch(e) {
    if (e != StopIteration)
      throw e;
  }
}

function disconnectTree(root) {
  disconnectAll(root);
  if (root.childNodes)
    forEach(root.childNodes, disconnectTree);
}

var browserIsIE = document.all && window.ActiveXObject;
var preNewline = browserIsIE ? "\r" : "\n";

function probablyAnArray(value) {
  try {
    return value && typeof value == "object" &&
      typeof value.length == "number" && typeof value.splice == "function";
  } catch (e) {return false;}
}

function probablyARegexp(value) {
  try {
    return value && typeof value == "object" &&
      typeof value.ignoreCase == "boolean" && typeof value.compile == "function";
  } catch (e) {return false;}
}

function probablyADOMNode(value) {
  try {
    return value && typeof value == "object" &&
      value.previousSibling !== undefined &&
      (value.nodeType == 3 || value.nodeType == 1);
  } catch (e) {return false;}
}

function isAccessibleWindow(win) {
  try {
    return win && typeof win == "object" && win.document && win.document.nodeType == 9;
  } catch (e) {return false;}
}

function trim(string) {
  return string.match(/^\s*(.*)\s*$/)[1];
}

function getCookie(name, def) {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var parts = cookies[i].split("=");
    if (trim(parts[0]) == name)
      return parts[1];
  }
  return def;
}

function setCookie(name, value) {
  document.cookie = name + "=" + value + "; expires=" + (new Date(2030, 0, 1)).toGMTString();
}
