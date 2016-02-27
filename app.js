'use strict';

var embedTypes = { 
  twitter: {
    class: "tweet",
    pattern: /^https?:\/\/(www.|mobile.|m.)?twitter.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/,
    urlPattern: /^t=[0-9]+$/,
    urlEncode: function(line) { return "t=" + line.split('/').splice(-1)[0] },
    createEmbed: function(container, line) {
      var tweetId = line.slice(2);
      twttr.widgets.createTweet(tweetId, container, {width: 520});
    }
  },
  youtube: {
    class: "youtube",
    pattern: /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/watch(\.php)?\?.*v=)[a-zA-Z0-9\-_?=]+$/,
    urlPattern: /^y=[a-zA-Z0-9\-_?=]+$/,
    urlEncode: function(line) { return "y="  + line.split('v=').splice(-1)[0].split(".be/").splice(-1)[0] },
    createEmbed: function(container, line) {
      var videoUrl = "//www.youtube.com/embed/" + line.slice(2);
      var iframe = document.createElement("IFRAME");
      iframe.setAttribute("type", "text/html");
      iframe.setAttribute("width", 520);
      iframe.setAttribute("height", 293);
      iframe.setAttribute("scrolling", "no"); 
      iframe.setAttribute("frameborder", "no");
      iframe.setAttribute("src", videoUrl);
      container.appendChild(iframe);
    }
  },
  soundcloud: {
    class: "soundcloud",
    pattern: /^https?:\/\/(www\.)?soundcloud.com\/[a-zA-Z0-9\-_#?/=:]+$/,
    urlPattern: /^s=[a-zA-Z0-9\-_#?/=:]+$/,
    urlEncode: function(line) { return "s="  + line.split("/").slice(3).join("/").split('?')[0] },
    createEmbed: function(container, line) {
      var scUrl = "//w.soundcloud.com/player/?url=soundcloud.com/" + line.slice(2);
      var iframe = document.createElement("IFRAME");
      iframe.setAttribute("type", "text/html");
      iframe.setAttribute("width", 520);
      iframe.setAttribute("height", 165);
      iframe.setAttribute("scrolling", "no"); 
      iframe.setAttribute("frameborder", "no");
      iframe.setAttribute("src", scUrl);
      container.appendChild(iframe);
    }
  }
}

// Determine embedType for urls pasted in textarea
var getPastedEmbedType = function(string) {
  for (var key in embedTypes) {
    if ( embedTypes.hasOwnProperty(key) ) {
      if ( embedTypes[key].pattern.test(string) ) {
        return key;
      }
    }
  }
  return null;
}

// Determine embedType for part of shared url
var getLineEmbedType = function(string) {
  for (var key in embedTypes) {
    if ( embedTypes.hasOwnProperty(key) ) {
      if ( embedTypes[key].urlPattern.test(string) ) {
        return key;
      }
    }
  }
  return null;
}

var urlEncodeLine = function(line) {
  var embedType = getPastedEmbedType(line);
  if (embedType !== null) {
    return embedTypes[embedType].urlEncode(line);
  } else if (/^-+$/.test(line)) {
    return '-';
  } else {
    return encodeURIComponent(line.slice(0,140));
  }
}

var addContentFromLine = function(line) {
  var container = document.createElement('div');
  document.getElementById('share-zone').appendChild(container);
  var embedType = getLineEmbedType(line);
  if (embedType !== null) {
    container.className = "embed " + embedTypes[embedType].class;
    embedTypes[embedType].createEmbed(container, line);
  } else if (line === "-") {
    container.className = "divider";
  } else if (line === "") {
    container.className = "spacer";
  } else {
    container.className = "comment";
    container.textContent = decodeURIComponent(line);
  }
};  

var createShareableLink = function() {
  var lines = document.getElementById('stuff-to-share').value.split('\n');
  var shareableLink = window.location.href.split("#")[0] + "#" + lines.map(urlEncodeLine).join("&");
  document.getElementById('shareable-link').value = shareableLink;
};

var turnLinksIntoContent = function(link, target) {
  while (target.hasChildNodes()) {
      target.removeChild(target .lastChild);
  }
  var items = link.split('#').slice(1).join('#').split('&');
  items.forEach(addContentFromLine);
};

document.getElementById('stuff-to-share').addEventListener('keyup', createShareableLink, true);

if (window.location.href.split('#').length > 1) {
  document.getElementById('share-form').className = "hidden";
  document.getElementById('share-page').className = "";
  turnLinksIntoContent(window.location.href, document.getElementById('share-zone'));
}

