// পুরনো সামঞ্জস্যের জন্য: এখন লোগো, মেনু ও ফুটার সব chrome.js-এ আছে।
(function () {
  if (window.__chromeLoaded) return;
  var cs = document.currentScript;
  var s = document.createElement('script');
  s.src = (cs && cs.src ? cs.src.replace(/site-logo\.js.*$/, '') : '/') + 'chrome.js';
  document.head.appendChild(s);
})();
