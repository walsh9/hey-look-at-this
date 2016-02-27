(function() {
  'use strict';

  var embedTypes = { 
    twitter: {
      class: "tweet",
      pattern: /^https?:\/\/(www.|mobile.|m.)?twitter.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/,
      urlPattern: /^t=[0-9]+$/,
      urlEncode: function(line) { return "t=" + line.split('/').splice(-1)[0]; },
      createEmbed: function(container, line) {
        var tweetId = line.slice(2);
        twttr.widgets.createTweet(tweetId, container, {width: 520});
      }
    },
    youtube: {
      class: "youtube",
      pattern: /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/watch(\.php)?\?.*v=)[a-zA-Z0-9\-_?=]+$/,
      urlPattern: /^y=[a-zA-Z0-9\-_?=]+$/,
      urlEncode: function(line) { return "y="  + line.split('v=').splice(-1)[0].split(".be/").splice(-1)[0]; },
      createEmbed: function(container, line) {
        var videoUrl = "//www.youtube.com/embed/" + line.slice(2);
        var iframe = Viewer.createIframe({
          width: 520,
          height: 293,
          src: videoUrl
        });
        container.appendChild(iframe);
      }
    },
    soundcloud: {
      class: "soundcloud",
      pattern: /^https?:\/\/(www\.)?soundcloud.com\/[a-zA-Z0-9\-_#?/=:]+$/,
      urlPattern: /^s=[a-zA-Z0-9\-_#?/=:]+$/,
      urlEncode: function(line) { return "s="  + line.split("/").slice(3).join("/").split('?')[0]; },
      createEmbed: function(container, line) {
        var scUrl = "//w.soundcloud.com/player/?url=soundcloud.com/" + line.slice(2);
        var iframe = Viewer.createIframe({
          width: 520,
          height: 163,
          src: scUrl
        });
        container.appendChild(iframe);
      }
    },
    instagram: {
      class: "instagram",
      pattern: /^https?:\/\/(instagr.am|(www\.)?instagram.com)\/p\/[a-zA-Z0-9\-_#?/=:]+/,
      urlPattern: /^i=[a-zA-Z0-9]+$/,
      urlEncode: function(line) { return "i="  + line.split('/p/').splice(-1)[0].split('/')[0]; },
      createEmbed: function(container, line) {
        var photoUrl = "//instagram.com/p/" + line.slice(2) + "/embed/";
        var iframe = Viewer.createIframe({
          width: 520,
          height: 600,
          src: photoUrl
        });
        container.appendChild(iframe);
      }
    }
  };

  var Composer = {
    getEmbedType: function(line) {
      for (var key in embedTypes) {
        if ( embedTypes.hasOwnProperty(key) ) {
          if ( embedTypes[key].pattern.test(line) ) {
            return key;
          }
        }
      }
      return null;
    },
    urlEncodeLine: function(line) {
      var embedType = Composer.getEmbedType(line);
      if (embedType !== null) {
        return embedTypes[embedType].urlEncode(line);
      } else if (/^-+$/.test(line)) {
        return '-';
      } else {
        return encodeURIComponent(line.slice(0,140));
      }
    },
    createShareableLink: function() {
      var lines = document.getElementById('stuff-to-share').value.split('\n');
      var shareableLink = window.location.href.split("#")[0] + "#" + lines.map(Composer.urlEncodeLine).join("&");
      document.getElementById('shareable-link').value = shareableLink;
    }
  };

  var Viewer = {
    getEmbedType: function(parameter) {
      for (var key in embedTypes) {
        if ( embedTypes.hasOwnProperty(key) ) {
          if ( embedTypes[key].urlPattern.test(parameter) ) {
            return key;
          }
        }
      }
      return null;
    },
    showContent: function(parameter) {
      var container = document.createElement('div');
      document.getElementById('share-zone').appendChild(container);
      var embedType = Viewer.getEmbedType(parameter);
      if (embedType !== null) {
        container.className = "embed " + embedTypes[embedType].class;
        embedTypes[embedType].createEmbed(container, parameter);
      } else if (parameter === "-") {
        container.className = "divider";
      } else if (parameter === "") {
        container.className = "spacer";
      } else {
        container.className = "comment";
        container.textContent = decodeURIComponent(parameter);
      }
    },
    renderUrlParams: function(link, target) {
      var items = link.split('#').slice(1).join('#').split('&');
      items.forEach(Viewer.showContent);
    },
    createIframe: function(options) {
      var iframe = document.createElement("IFRAME");
        iframe.setAttribute("type", "text/html");
        iframe.setAttribute("width", options.width);
        iframe.setAttribute("height", options.height);
        iframe.setAttribute("scrolling", "no"); 
        iframe.setAttribute("frameborder", "no");
        iframe.setAttribute("src", options.src);
      return iframe;
    }
  };

  document.getElementById('stuff-to-share').addEventListener('keyup', Composer.createShareableLink, true);

  if (window.location.href.split('#').length > 1) {
    document.getElementById('share-form').className = "hidden";
    document.getElementById('share-page').className = "";
    Viewer.renderUrlParams(window.location.href, document.getElementById('share-zone'));
  }
}());
