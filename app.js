'use strict';

var isTweetUrl = function(string) {
  return /^https?:\/\/(www.|mobile.|m.)?twitter.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(string);
}

var isTweet = function(string) {
  return /^t=[0-9]+$/.test(string);
}

var urlEncodeLine = function(line) {
  if (isTweetUrl(line)) {
    return "t=" + line.split('/').splice(-1)[0];
  } else if (/^-+$/.test(line)) {
    return '-';
  } else {
    return encodeURIComponent(line.slice(0,140));
  }
}

var addContentFromLine = function(line) {
  var container = document.createElement('div');
  document.getElementById('share-zone').appendChild(container);
  if (isTweet(line)) {
    container.className = "tweet";
    var tweetId = line.slice(2);
    twttr.widgets.createTweet(tweetId, container);
  } else if (line === "-") {
    container.className = "divider";
  } else if (line === "") {
    container.className = "spacer";
  } else {
    container.className = "comment";
    container.innerText = decodeURIComponent(line);
  }
};  

var createShareableLink = function() {
  var lines = document.getElementById('stuff-to-share').value.split('\n');
  var shareableLink = window.location.href + "#" + lines.map(urlEncodeLine).join("&");
  document.getElementById('shareable-link').value = shareableLink;
};

var turnLinksIntoContent = function(link, target) {
  while (target.hasChildNodes()) {
      target.removeChild(target .lastChild);
  }
  var items = link.split('#').splice(-1)[0].split('&');
  items.forEach(addContentFromLine);
};

document.getElementById('stuff-to-share').addEventListener('keyup', createShareableLink, true);

if (window.location.href.split('#').length > 1) {
  document.getElementById('share-form').className = "hidden";
  document.getElementById('share-page').className = "";
  turnLinksIntoContent(window.location.href, document.getElementById('share-zone'));
}

