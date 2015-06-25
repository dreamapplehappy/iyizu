var htmlTable = [];

function initEnvironment(win, output, callback) {
  var feed = (win.execScript ? function(code) {win.execScript(code);} : function(code) {win.__setTimeout(code, 0);});

  function wrapCode(before, after, code) {
    env.code = code;
    return "__setTimeout(__ENV.callback, 0); try{" + before + "__ENV.code" + after +"}catch(e){__ENV.error(e);}";
  }

  function run(code, showResult) {
    if (showResult) 
      feed(wrapCode("$r = eval(", "); if ($r !== undefined) show($r);", code));
    else
      feed(wrapCode("eval(", ");", code));
  }

  function error(err) {
    env.output(DIV(null, "Exception: ", env.format(err)));
    if (err.stack) {
      var stack = err.stack.split("\n");
      for (var i = 0; i < env.maxStackTrace && i < stack.length; i++) {
        var part = stack[i], at = part.indexOf("@");
        if (at > 1 && part.slice(0, 5) != "eval(")
          win.print("  in function " + part.slice(0, at));
      };
      if (stack.length > env.maxStackTrace)
        win.print("  [...]")
    }
  };

  var env = {
    output: method(output, "append"),
    format: method(output, "summarize"),
    parent: window,
    maxStackTrace: 10,
    error: error,
    run: run,
    callback: callback,
    code: null
  };
  win.__ENV = env;

  win.load = function(file) {
    win.document.body.appendChild(withDocument(win.document, function(){
      return createDOM("SCRIPT", {type: "text/javascript", src: /$http:\/\//.test(file) ? file : "js/" + file});
    }));
  };

  win.print = function() {
    var accum = [];
    for (var i = 0; i != arguments.length; i++)
      accum.push(String(arguments[i]));
    var joined = accum.join("");
    env.output(DIV(null, preNewline != "\n" ? joined.replace(/\n/g, preNewline) : joined));
  };

  win.show = function(x) {
    env.output(DIV(null, env.format(x)));
  };

  win.viewHTML = function(html) {
    htmlTable.push(String(html));
    return window.open("view.html?id=" + (htmlTable.length - 1));
  };

  function wrapAction(action) {
    if (typeof action == "string")
      return "try{" + action + "}catch(e){__ENV.error(e);}";
    else
      return function(){try{action();}catch(e){env.error(e);}};
  }

  // Apparantly, the .call and .apply methods of setTimeout and
  // setInterval don't quite work on IE, so we rename them and call
  // them directly.
  win.__setTimeout = win.setTimeout;
  win.__setInterval = win.setInterval;

  win.setTimeout = function(action, interval) {
    return win.__setTimeout(wrapAction(action), interval);
  };

  win.setInterval = function(action, interval) {
    return win.__setInterval(wrapAction(action), interval);
  };

  // For some strange reason, this *has* to be executed from the
  // window itself, or creating the Error object fails (in IE).
  win.__setTimeout("if (/^\\[object/.test((new Error(\"...\")).toString())) " +
                   "Error.prototype.toString = function(){return this.name + \": \" + this.message;};", 0);
}
