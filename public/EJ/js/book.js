// This code assumes a 1px border around the console, repl, output,
// and editor elements.
var _console = null;

var processPage = function(){
  function hideSolutions() {
    forEach(getElementsByTagAndClassName("div", "solution"), function(solution) {
      solution.style.display = "none";
      var toggle = DIV({"class": "toggle"}, "[show solution]");
      connect(toggle, "onclick", function() {
        removeElement(toggle);
        solution.style.display = "block";
      });
      solution.parentNode.insertBefore(toggle, solution);
    });
  }

  function positionFloater(element, pos) {
    var minWidth = 600;
    var winWidth = getViewportDimensions().w;
    pos.x = Math.min(pos.x, winWidth - minWidth);
    setElementDimensions(element, {w: winWidth - pos.x - 35});
    setElementPosition(element, pos);
  }

  function moveFootnotes() {
    var notelist = getFirstElementByTagAndClassName("ol", "footnotes");
    if (!notelist)
      return;

    function moveNote(note, ref) {
      var floater = DIV({"class": "floater footnotefloat"}, note.childNodes);
      floater.style.display = "none";
      document.body.appendChild(floater);
      var newRef = SPAN({"class": "footref"}, ref.firstChild);
      ref.parentNode.replaceChild(newRef, ref);
      connect(newRef, "onmouseover", function(event) {
        positionFloater(floater, addPoint(event.mouse().page, {x: 5, y: 10}));
        floater.style.display = "block";
      });
      connect(newRef, "onmouseout", function() {
        floater.style.display = "none";
      });
    }

    var notes = notelist.childNodes;
    var refs = getElementsByTagAndClassName("a", "footref");
    for (var i = 0; i < notes.length; i++)
      moveNote(notes[i], refs[i]);
    removeElement(notelist);
  }

  function getCode(code){
    function flattenNode(node){
      if (node.nodeType == 3)
        return node.nodeValue;
      else if (node.nodeName == "SPAN")
        return node.firstChild.nodeValue;
      else
        return "";
    }
    return map(flattenNode, code.childNodes).join("");
  }

  function runCodeUpto(code) {
    var fragments = [];
    while (code) {
      removeElementClass(code, "not-run");
      fragments.push(getCode(code));
      code = code.prev;
    }
    for (var i = fragments.length - 1; i >= 0; i--)
      _console.runCode(fragments[i]);
  }

  function addCodeButtons(){
    var prev = null;
    forEach(getElementsByTagAndClassName("pre", "code"), function(code) {
      addElementClass(code, "not-run");
      var expr = hasClass(code, "expression");
      var runUpto = !(expr || hasClass(code, "invalid"));
      if (runUpto) {
        code.prev = prev;
        prev = code;
      }

      if (!expr) {
        var load = insertAtStart(BUTTON({"class": "codebutton load", "type": "button", "title": "Load this code into the console"}), code);
        connect(load, "onclick", function(){
          setOpen(true);
          _console.loadCode("example", getCode(code));
        });
      }

      var run = insertAtStart(BUTTON({"class": "codebutton run", "title": "Run this code", "type": "button"}), code);
      connect(run, "onclick", function(event){
        removeElementClass(code, "not-run");
        setOpen(true);
        if (runUpto && event.modifier().shift)
          runCodeUpto(code);
        else
          _console[expr ? "evalCode" : "runCode"](getCode(code));
      });
    });
  }

  var popup = null;
  function react() {
    if (popup) {
      closeReaction();
      return;
    }

    var name = INPUT({value: getCookie("name", "")}, ""),
        email = INPUT({value: getCookie("email", "")}, ""),
        subject = INPUT({value: ""}), message = TEXTAREA(null, "");
    popup = DIV({"class": "reactpopup"},
                P(null, "Send me a message..."),
                P(null, SPAN(null, "Your name:"), name),
                P(null, SPAN(null, "Your e-mail:"), email),
                P(null, SPAN(null, "Subject:"), subject),
                P(null, message),
                P(null,
                  BUTTON({type: "button"}, "Send", attach("onclick", sendReaction)), " ",
                  BUTTON({type: "button"}, "Cancel", attach("onclick", closeReaction))));
    document.body.appendChild(popup);
    name.focus();

    function sendByXHR() {
      var data = queryString({name: name.value, email: email.value, message: message.value,
			      subject: subject.value, chapter: chapterTag});
      request = doXHR("contact", {method: "POST", sendContent: data,
                                  headers: {"Content-type": "application/x-www-form-urlencoded; charset=utf-8",
                                            "Content-length": data.length,
                                            "Connection": "close"}});
      function fail(xhr) {
        alert("Could not deliver your message. (" + message + ")");
      }
      request.addErrback(function(xhr){
	fail((err.xhr && err.xhr.statusText) || err.message);
      });
      request.addCallback(function(xhr) {
	if (xhr.responseText != "ok")
	  fail(xhr.responseText);
      });
    }
    function sendByIFrame() {
      var frame = createDOM("IFRAME", {style: "border-width: 0; position: absolute; width: 1px; height: 1px; top: 0px;",
                                       src: "js/sendreaction.html"});
      connect(frame, "onload", function() {
        var win = frame.contentWindow;
        var form = win.document.getElementById("form");
        form.elements.name.value = name.value;
        form.elements.email.value = email.value;
        form.elements.chapter.value = chapterTag;
        form.elements.message.value = message.value;
	form.elements.subject.value = subject.value;
        form.submit();
        setTimeout(partial(removeElement, frame), 10000);
      });
      document.body.appendChild(frame);
    }

    function sendReaction() {
      if (message.value == "") {
        alert("You did not enter a message.");
        return;
      }
      if (email.value == "" && !confirm("You do realize that without an e-mail address I can not get back to you, don't you? Send anyway?"))
        return;

      setCookie("name", name.value);
      setCookie("email", email.value);

      if (/eloquentjavascript\.net/.test(document.domain))
        sendByXHR();
      else
        sendByIFrame();
      closeReaction();
    }
    function closeReaction() {
      removeElement(popup);
      popup = null
    }
  }

  function addReactButton() {
    document.body.appendChild(BUTTON({type: "button", "class": "react",
                                      title: "Send the author a message"},
                                     attach("onclick", react)));
  }

  var open = true;
  var contentRatio = Number(getCookie("contentRatio", .75));
  var topBar = 13;
  var sizeCorrection = dimMode() == "standard" ? -2 : 0;
  var minContentWidth = 700;

  function setContentRatio(consoleHeight) {
    var winHeight = getViewportDimensions().h;
    contentRatio = (winHeight - consoleHeight) / winHeight;
    setCookie("contentRatio", String(contentRatio));
  }

  function resizeFrames() {
    var winSize = getViewportDimensions();
    if (open) {
      var contentSize = Math.round(winSize.h * contentRatio);
      setElementDimensions($("content"), {h: contentSize});
      setElementDimensions($("console"), {h: winSize.h - 1 - contentSize + sizeCorrection});
      resizeConsole();
    }
    else {
      setElementDimensions($("content"), {h: winSize.h - topBar + sizeCorrection});
      setElementDimensions($("console"), {h: topBar});
    }
  }

  function addConsole() {
    document.body.appendChild(DIV({"class": "frame", "id": "content"}, document.body.childNodes[1]));
    document.body.appendChild(DIV({"class": "frame console" + (open ? " open" : ""), "id": "console"}));
    document.body.style.overflow = "hidden"; 
    initConsole($("console"));
    setOpen(false);
    resizeFrames();
    connect(window, "onresize", resizeFrames);
    function resetScroll() {
      if (document.body.scrollTop > 0)
        document.body.scrollTop = 0;
    }
    connect(window, "onkeyup", resetScroll);
    connect(window, "onmousemove", resetScroll);
  }

  var minSize = 120;

  function resizeConsole() {
    var margin = 6;
    var leftRatio = .4;
    var width = $("console").clientWidth;
    var height = $("console").clientHeight;

    var bottomHeight = Math.max($("repl").offsetHeight, $("controls").offsetHeight);
    var topHeight = height - topBar - 2 * margin - bottomHeight;

    var innerWidth = width - 3 * margin;
    var leftWidth = Math.round(leftRatio * innerWidth);
    var rightWidth = innerWidth - leftWidth;

    var output = $("output"), editor = $("editor");

    placeElement(output, {x: margin, y: topBar, w: leftWidth + sizeCorrection, h: topHeight + sizeCorrection});
    placeElement($("repl"), {x: margin, y: topBar + margin + topHeight, w: leftWidth + sizeCorrection});
    setElementDimensions($("repl").firstChild, {w: $("repl").clientWidth});

    placeElement(editor, {x: 2 * margin + leftWidth, y: topBar, w: rightWidth + sizeCorrection, h: topHeight + sizeCorrection});
    placeElement($("controls"), {x: 2 * margin + leftWidth, y: topBar + margin + topHeight, w: rightWidth});

    forEach(editor.childNodes, growElement);
    setElementDimensions($("outputinner"), {w: output.clientWidth, h: output.clientHeight - output.firstChild.offsetHeight});
  }

  function setOpen(nowOpen){
    if (open == nowOpen)
      return;
    open = nowOpen;
    $("editor").style.display = $("repl").style.display = $("output").style.display = $("controls").style.display = (open ? "" : "none");
    resizeFrames();
    if (open)
      addElementClass($("console"), "open");
    else
      removeElementClass($("console"), "open");
  }

  function dragResize(event) {
    var size = $("console").offsetHeight;
    var prevY = event.mouse().page.y;
    var wait = false, changed = false;

    // Temporarily hide the editor, because iframes and dragging do
    // not get along very well.
    forEach($("editor").childNodes, function(frame) {
      frame.style.visibility = "hidden";
    });
    document.body.style.cursor = "n-resize";

    var tracker = connect(document.body, "onmousemove", function(event) {
      size += prevY - event.mouse().page.y;
      prevY = event.mouse().page.y;
      if (open && size < minSize)
        setOpen(false);
      if (!open && size >= minSize)
        setOpen(true);
      setContentRatio(Math.max(minSize, size));
      if (!wait) {
        wait = true;
        setTimeout(function(){
          wait = false;
          if (changed)
            resizeFrames();
        }, 300);
        resizeFrames();
      }
      else {
        changed = true;
      }
    });
    var finish = connect(document.body, "onmouseup", function() {
      disconnect(tracker);
      disconnect(finish);
      document.body.style.cursor = "";
      forEach($("editor").childNodes, function(frame) {
        frame.style.visibility = "";
      });
      resizeFrames();
    });
  }

  function initConsole(where) {
    var showHide = BUTTON({"class": "showhide", "type": "button", "title": "Open or close the console"},
      attach("onclick", function(event) {setOpen(!open);}));
    var resize = BUTTON({"class": "resize", "type": "button", "title": "Resize the console"},
      attach("onmousedown", dragResize));

    var output = DIV({"class": "output", "id": "output"}),
        controls = DIV({"id": "controls"}),
        editor = DIV({"class": "editor", "id": "editor"}),
        repl = DIV({"class": "editor", "id": "repl"});

    replaceChildNodes(where,
                      DIV({"class": "header"}, "CONSOLE", resize, showHide),
                      output, controls, editor, repl);

    function initFrame(env) {
      if (window.chapterTag)
        env.load("chapter/" + chapterTag + ".js");
    }
    _console = new Console({output: output, controls: controls, editor: editor, repl: repl,
                            initEnv: initFrame});
  }

  function restoreBookmark(){
    if (/#/.test(location.href))
      location.href = location.href;
  }

  setTimeout(function(){document.body.style.visibility = ""; $("content").focus();}, 0);
  hideSolutions();
  moveFootnotes();
  addCodeButtons();
  addReactButton();
  addConsole();
  restoreBookmark();
};

connect(window, "onload", processPage);
