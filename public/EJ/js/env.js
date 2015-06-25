function makeFrame(place, init) {
  var frame = createDOM("IFRAME", {"style": "border-width: 0; display: none;"});
  (place || document.body).appendChild(frame);

  var fdoc = frame.contentWindow.document;
  fdoc.open();
  fdoc.write("<html><head><title>Default</title><body style=\"border-width: 0\"></body></html>");
  fdoc.close();

  if (init) {
    if (fdoc.body)
      init(frame);
    else
      connect(frame, "onload", function(){disconnectAll(frame, "onload"); init(frame);});
  }
  return frame;
}

var useJSEditor = !/Opera/.test(navigator.userAgent); // Safari?

function Buffer(name, content, where){
  if (useJSEditor){
    var self = this;
    this.editor = new JSEditor(function(node){
      self.node = node;
      where.appendChild(node);
    }, 10, 10, content);
  }
  else {
    this.node = TEXTAREA({spellcheck: false}, content);
    where.appendChild(this.node);
  }
  growElement(this.node);
  this.name = name;
}

Buffer.prototype = {
  show: function() {
    showElement(this.node);
  },
  hide: function() {
    hideElement(this.node);
  },
  remove: function() {
    removeElement(this.node);
  },
  getCode: function() {
    if (useJSEditor)
      return this.editor.getCode();
    else
      return this.node.value;
  }
};

function History(){
  this.history = [];
  this.pos = 0;
  this.current = "";
}

History.prototype = {
  push: function(line) {
    this.history.push(line);
    if (this.history.length > 150)
      this.history = this.history.slice(0, 100);
    this.pos = this.history.length;
  },
  move: function(dir, from) {
    if (this.pos == this.history.length)
      this.current = from;
    else
      this.history[this.pos] = from;

    this.pos = (this.pos + dir) % (this.history.length + 1);
    if (this.pos < 0) // JS' modulo is a bit impractical when dealing with negative numbers
      this.pos += (this.history.length + 1);

    if (this.pos == this.history.length)
      return this.current;
    else
      return this.history[this.pos];
  }
};

var dotdotdot = "\u2026";

function summarize(element, depth) {
  depth = depth || 0;
  var maxLength = depth == 0 ? 50 : 10;
  var self = this;

  function nodeLength(node) {
    if (node.nodeType == 3)
      return node.nodeValue.length;
    else
      return sum(map(nodeLength, node.childNodes));
  }
  function span(className, content, onclick) {
    var result = SPAN({"class": className}, content);
    if (onclick) {
      connect(result, "onclick", function(event) {
        onclick();
        event.stop();
      });
    }
    return result;
  }
  function objectHasProperties(object) {
    for (var x in object)
      return true;
    return false;
  }
  // Some mystery objects in IE throw an exception when you try to
  // enumerate them.
  function objectIsEnumerable(object) {
    try {
      for (var x in object)
        return true;
      return true;
    }
    catch (e) {
      return false;
    }
  }

  function formatFunc(value) {
    var regexp = /^\s*function ?([^\(]*)?\(([^\(]*)\)/;
    var match = String(value).match(regexp);
    return span("functionvalue", match ? "<function " + (match[1] || "") + "(" + match[2] + ")>" : "<function>");
  }
  function formatArray(value) {
    var content = ["["], length = 2;
    if (depth > 1) {
      if (value.length > 0)
        content.push(dotdotdot);
    }
    else {
      for (var i = 0; i < value.length; i++) {
        var last = i == value.length - 1;
        var summary = self.summarize(value[i], depth + 1);
        var summaryLength = nodeLength(summary);
        if (length + summaryLength + (last ? 0 : 3) <= maxLength) {
          content.push(summary);
          length += summaryLength;
        }
        else {
          content.push(dotdotdot);
          break;
        }
        if (!last)
          content.push(", ");
      }
    }
    content.push("]");
    return span("arrayvalue", content, bind(self.expand, self, value));
  }
  function formatDOMNode(value) {
    if (value.nodeType == 3)
      return value.nodeValue.replace("\n", "\\n");
    var accum = ["<", value.nodeName.toLowerCase()];
    if (value.attributes) {
      forEach(value.attributes, function(attr) {
        if (attr.specified && typeof attr.nodeValue == "string") {
          accum.push(" " + attr.nodeName.toLowerCase() + "=" + serializeJSON(attr.nodeValue));
        }
      });
    }
    accum.push(">");
    return accum.join("");
  }
  function formatObject(value) {
    var asString = (probablyADOMNode(value) ? formatDOMNode(value) : value + "");
    if (/^\[object.*\]$/.test(asString))
      return formatPlainObject(value);
    else
      return span("objectvalue", asString, bind(self.expand, self, value));
  }
  function formatPlainObject(value) {
    var content = ["{"], length = 2, elements = [], first = true;
    if (depth > 1) {
      if (objectIsEnumerable(value) && objectHasProperties(value))
        content.push(dotdotdot);
    }
    else if (objectIsEnumerable(value)) {
      for (var name in value) {
        var skip = true;
        // Firefox has a nasty habit of throwing 'not implemented' or 'security'
        // exceptions when accessing certain properties in window and document.
        try {
          var element = value[name];
          skip = false;
        }
        catch (e) {}
        if (!skip) {
          if (first) {
            first = false;
          }
          else {
            content.push(", ");
            length += 2;
          }
          var summary = self.summarize(element, depth + 1);
          var elementLength = nodeLength(summary) + 2 + name.length;
          if (length + elementLength <= maxLength) {
            content.push(name + ": ");
            content.push(summary);
            length += elementLength;
          }
          else {
            content.push(dotdotdot);
            break;
          }
        }
      }
    }
    content.push("}");
    return span("objectvalue", content, bind(self.expand, self, value));
  }
  function formatString(value){
    return span("stringvalue", serializeJSON(value));
  }
  function formatAtom(value) {
    return span("atomvalue", String(value));
  }

  var type = typeof element;
  // Regexps report their type as function, but that is a lousy way to
  // display them.
  if (probablyARegexp(element))
    type = "object";
  if (type == "function")
    return formatFunc(element);
  else if (type == "object" && element != null) {
    // Some IE built-in functions report their type as "object"
    // Also, the navigator object in IE can not be passed to the String function. Gah.
    if (browserIsIE && ("" + element).match(/function .*/))
      return formatFunc(element);
    else if (probablyAnArray(element))
      return formatArray(element);
    else
      return formatObject(element);
  }
  else if (type == "string")
    return formatString(element);
  else
    return formatAtom(element);
}

function inspect(value) {
  function cutOff(name) {
    if (name.length > 22)
      return name.slice(0, 21) + dotdotdot;
    else
      return name;
  }
  
  var tbody = TBODY();
  if (probablyAnArray(value)) {
    for (var i = 0; i < value.length; i++)
      tbody.appendChild(TR(null, TH(null, i + ":"), TD(null, this.summarize(value[i], 1))));
  }
  else {
    var elements = [];
    for (var name in value) {
      var skip = true;
      try {
        var element = value[name];
        skip = false;
      }
      catch(e) {}
      if (!skip)
        tbody.appendChild(TR(null, TH(null, cutOff(name) + ":"), TD(null, this.summarize(element, 1))));
    }
  }
  return TABLE({"class": "objecttable"}, tbody);
}

function Output(place, parent) {
  this.place = place;
  this.scrollPos = 0;
  this.stack = [];
  this.parent = parent;

  this.outhead = DIV({"class": "outputhead"},
                     DIV({"class": "outputbutton", "title": "Clear output"}, "\u263C",
                         attach("onclick", method(this, "clear"))),
                     "Output:");
  this.out = PRE(), this.show = PRE();
  this.scroll = DIV({"class": "outputinner", "id": "outputinner"}, this.out);
  this.showhead = DIV({"class": "outputhead"},
                      DIV({"class": "outputbutton", "title": "Store this value in $i"}, "$",
                          attach("onclick", method(this, "copy"))),
                      DIV({"class": "outputbutton", "title": "Close inspect view"}, "\u00D7",
                          attach("onclick", method(this, "close"))),
                      DIV({"class": "outputbutton", "title": "Back"}, "\u2190",
                          attach("onclick", method(this, "back"))),
                     "View object");
  replaceChildNodes(this.place, this.outhead, this.scroll);
}

Output.prototype = {
  append: function(node) {
    this.out.appendChild(node);
    if (this.stack.length == 0)
      scrollToBottom(this.scroll);
  },
  clear: function() {
    disconnectTree(this.out);
    replaceChildNodes(this.out);
  },
  expand: function(value) {
    if (this.stack.length == 0) {
      this.scrollPos = this.scroll.scrollTop;
      this.place.replaceChild(this.showhead, this.outhead);
      this.scroll.replaceChild(this.show, this.out);
    }
    this.stack.push(value);
    this.display(value);
  },
  display: function(value) {
    disconnectTree(this.show);
    this.scroll.scrollTop = 0;
    replaceChildNodes(this.show, this.inspect(value));
  },
  close: function() {
    this.place.replaceChild(this.outhead, this.showhead);
    this.scroll.replaceChild(this.out, this.show);
    this.scroll.scrollTop = this.scrollPos;
    this.stack = [];
  },
  back: function() {
    this.stack.pop();
    if (this.stack.length == 0)
      this.close();
    else
      this.display(this.stack[this.stack.length - 1]);
  },
  copy: function() {
    if (this.parent.env)
      this.parent.env.$i = this.stack[this.stack.length - 1];
  },
  summarize: summarize,
  inspect: inspect
};

function Console(param) {
  var active, self = this, frame = null;
  var history = new History();
  var out = new Output(param.output, this);
  var baseEnv, codeStream = [], streaming = false;
  resetEnvironment();

  function showBuffer(buffer) {
    if (active)
      active.hide();
    active = buffer;
    active.show();
    return active;
  }

  function runCode(code, showResult) {
    if (self.env && !self.env.__ENV) {
      self.env = baseEnv;
      self.env.print("Lost attached window, detaching.");
    }

    if (streaming || !self.env) {
      codeStream.push({code: code, show: showResult});
    }
    else {
      streaming = true;
      self.env.__ENV.run(code, showResult);
    }
  }
  // Because the window that code must be sent to can change, code
  // must only be sent when the code before it has finished running.
  // Hence this callback.
  function runCallback() {
    if (codeStream.length > 0 && self.env) {
      var code = codeStream.shift();
      self.env.__ENV.run(code.code, code.show);
    }
    else {
      streaming = false;
    }
  }
  function setEnvironment(win) {
    self.env = win;
    if (win && !streaming && codeStream.length > 0)
      runCallback();
  }

  var buffers = SELECT({"class": "buffers"});
  replaceChildNodes(
    param.controls,
    BUTTON({title: "Run the code in this buffer", "type": "button"},
           "Run", attach("onclick", function(){runCode(active.getCode(), false);})),
    buffers,
    BUTTON({title: "New buffer", "type": "button"}, "New", attach("onclick", createBuffer)),
    BUTTON({title: "Load a file as a new buffer", "type": "button"}, "Load", attach("onclick", loadFile)),
    BUTTON({title: "Close this buffer", "type": "button"}, "Close", attach("onclick", closeBuffer)),
    BUTTON({title: "Reset the console environment", "type": "button"}, "Reset", attach("onclick", resetEnvironment)));
  connect(buffers, "onchange", function(){
    showBuffer(buffers.options[buffers.selectedIndex].buffer);
  });
  var repl = INPUT({"type": "text"});
  replaceChildNodes(param.repl, repl);
  connect(repl, "onkeydown", lineKey);

  function bufferName(name){
    function exists(name) {
      return some(buffers.childNodes, function(option){return option.text == name;});
    }
    if (!exists(name)) return name;
    for (var i = 2; ; i++) {
      var newName = name + "(" + i + ")";
      if (!exists(newName)) return newName;
    }
  }

  function addBuffer(name, content){
    var option = OPTION(null, bufferName(name));
    buffers.appendChild(option);
    option.selected = true;
    option.buffer = new Buffer(name, content || "", param.editor);
    return showBuffer(option.buffer);
  }
  function createBuffer(){
    var name = prompt("Enter a name for the new buffer", "");
    if (name)
      addBuffer(name);
  }
  function closeBuffer(){
    if (buffers.selectedIndex != -1) {
      buffers.removeChild(buffers.childNodes[buffers.selectedIndex]);
      active.remove();
      if (buffers.firstChild){
        active = buffers.firstChild.buffer;
        buffers.firstChild.selected = true;
        active.show();
      }
      else {
        active = null;
      }
    }
  }
  function loadFile(){
    var filename = prompt("Enter a filename or URL", "");
    if (filename) {
      var simplename = stripPath(filename);
      if (!/^http:\/\//.test(filename))
        filename = "js/" + filename;
      var defer = doXHR(filename);
      defer.addCallback(function(xhr){addBuffer(simplename, xhr.responseText);});
      defer.addErrback(function(){alert("File '" + simplename + "' could not be loaded.");});
    }
  }

  function attachEnvironment(win) {
    function detach() {
      if (self.env == win) {
        var title = self.env.document.title;
        setEnvironment(baseEnv);
        self.env.print("Detaching from window '", title || "[unnamed]", "'.");
      }
    }
    function attach() {
      if (!win.__ENV)
        initEnvironment(win, out, runCallback);
      win.detach = detach;
      var unload = connect(win, "onunload", detach);
      connect(window, "onunload", function(){disconnect(unload);});
      setEnvironment(win);
      self.env.print("Attaching to window '", win.document.title || "[unnamed]", "'.");
    }

    if (isAccessibleWindow(win)) {
      connect(win, "onload", attach);
      // When immediately attaching to a newly created window, wait
      // until onload, or strange things happen.
      self.env = null;
      if (win.document.body && (win.document.body.childNodes.length > 0 || win.document.title != ""))
        attach();
    }
    else {
      self.env.print("Not an accessible window.");
    }
  }

  function resetEnvironment(){
    if (frame)
      removeElement(frame);
    frame = makeFrame(param.framePlace, function(frame){
      baseEnv = frame.contentWindow;
      initEnvironment(baseEnv, out, runCallback);
      baseEnv.attach = attachEnvironment;
      if (param.initEnv)
        param.initEnv(baseEnv);
      setEnvironment(baseEnv);
    });
  }

  function evalLine(){
    var line = repl.value;
    repl.value = "";
    history.push(line);
    runCode(line, true);
  }
  function getHistory(dir){
    repl.value = history.move(dir, repl.value);
  }

  // Opera generates events for the '(' and '&' keys that are pretty
  // much the same as those for arrow down and up. So, to
  // disambiguate, we disallow shift when those are pressed.
  function lineKey(event){
    var key = event.key().string;
    var shift = event.modifier().shift;
    if (key == "KEY_ENTER")
      evalLine();
    else if (key == "KEY_ARROW_UP" && !shift)
      getHistory(-1);
    else if (key == "KEY_ARROW_DOWN" && !shift)
      getHistory(1);
    else
      return;
    event.stop();
  }

  addBuffer("*scratch*");

  this.loadCode = addBuffer;
  this.runCode = function(code){runCode(code, false);};
  this.evalCode = function(code){runCode(code, true);};
}

connect(window, "onload", function() {
  if (/^\[object/.test((new Error("...")).toString()))
    Error.prototype.toString = function(){return this.name + ": " + this.message;};
});
