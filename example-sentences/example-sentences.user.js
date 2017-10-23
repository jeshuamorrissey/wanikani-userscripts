// ==UserScript==
// @name WaniKani Example Sentences
// @version 2.1
// @description  Displays additional examples sentences for the given vocabulary.
// @match *://www.wanikani.com/*vocabulary/*
// @match *://www.wanikani.com/review/session*
// @match *://www.wanikani.com/lesson/session*
// @copyright 2014 jeshuam
// @require       //ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// ==/UserScript==
 
/**
 * WaniKani API utilities, for use within userscripts.
 * Just place this script in the @require section of the userscript header.
 */
(function() {
  // Common key to use for the API key.
  var API_RETREIVAL_KEY = 'jeshuam-wanikani-apikey';
 
  var WaniKaniAPI = window.WaniKaniAPI = {
    /**
     * Get the API key from storage and return it. If it doesn't exist, return null.
     */
    getAPIKey: function() {
      return GM_getValue(API_RETREIVAL_KEY);
    },
 
    /**
     * Insert the API key into storage. If you are deleting, rather use deleteAPIKey().
     */
    setAPIKey: function(apiKey) {
      GM_setValue(API_RETREIVAL_KEY, apiKey);
    },
 
    /**
     * Remove the API key from storage.
     */
    deleteAPIKey: function() {
      GM_deleteValue(API_RETREIVAL_KEY);
    },
 
    /**
     * Get the API key from the DOM. Will only do something if the user is on the
     * /account page.
     */
    setAPIKeyFromDOM: function() {
      if (window.location.href.indexOf('account') >= 0) {
        // Make sure the API key isn't already there.
        if (WaniKaniAPI.getAPIKey()) {
          return;
        }
 
        // Required function because the API key has no ID on it. :(
        function getAPIKeyFromDom() {
          // Look through all .span6's for the API key. We can identify the API key by the
          // placeholder text.
          var elementsToSearch = document.querySelectorAll('.span6');
          for (var i in elementsToSearch) {
            var element = elementsToSearch[i];
            if (element.placeholder === 'Key has not been generated') {
              return element.value.trim();
            }
          }
 
          // Couldn't find it :(
          return null;
        }
 
        // Find the API key.
        WaniKaniAPI.setAPIKey(getAPIKeyFromDom());
        alert('JeshuaM Scripts: API Key Saved! ' + WaniKaniAPI.getAPIKey());
      }
    },
 
    /**
     * Get the API base URL.
     */
    apiURL: function(action) {
      return 'https://www.wanikani.com/api/v1.2/user/' + WaniKaniAPI.getAPIKey() + '/' + action;
    },
 
    /**
     * Make an AJAX request to the given API url, and call `callback` when finished.
     */
    load: function(url, callback) {
      var xhr;
 
      // Get the XHR element first.
      if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();
      } else {
        var versions = ["MSXML2.XmlHttp.5.0",
                        "MSXML2.XmlHttp.4.0",
                        "MSXML2.XmlHttp.3.0",
                        "MSXML2.XmlHttp.2.0",
                        "Microsoft.XmlHttp"]
 
        for(var i = 0, len = versions.length; i < len; i++) {
          try {
            xhr = new ActiveXObject(versions[i]);
            break;  
          } catch(e) {
 
          }
        }
      }
 
      // Function to execute when the state of the XHR request changes.
      xhr.onreadystatechange = function() {
        if(xhr.readyState < 4) {
          return;
        }
 
        if(xhr.status !== 200) {
          return;
        }
 
        if(xhr.readyState === 4) {
          callback(xhr);
        }
      };
 
      // Start the request.
      xhr.open('GET', url, true);
      xhr.send('');
    }
  };
 
  // Register some GreaseMonkey commands.
  GM_registerMenuCommand('JeshuaM Scripts: Change API Key', function() {
    var apiKey = prompt('Please enter your API key.', WaniKaniAPI.getAPIKey() || '');
    if (apiKey != null) {
      WaniKaniAPI.setAPIKey(apiKey);
      alert('JeshuaM Scripts: API Key Saved! ' + apiKey);
    }
  });
 
  GM_registerMenuCommand('JeshuaM Scripts: Reset API Key', function() {
    WaniKaniAPI.deleteAPIKey();
    alert('JeshuaM Scripts: API Key Deleted!');
  });
})();
 
 
/**
* simplePagination.js v1.6
* A simple jQuery pagination plugin.
* http://flaviusmatis.github.com/simplePagination.js/
*
* Copyright 2012, Flavius Matis
* Released under the MIT license.
* http://flaviusmatis.github.com/license.html
*/
 
(function($){
 
  var methods = {
    init: function(options) {
      var o = $.extend({
        items: 1,
        itemsOnPage: 1,
        pages: 0,
        displayedPages: 5,
        edges: 2,
        currentPage: 0,
        hrefTextPrefix: '#page-',
        hrefTextSuffix: '',
        prevText: 'Prev',
        nextText: 'Next',
        ellipseText: '&hellip;',
        cssStyle: 'light-theme',
        labelMap: [],
        selectOnClick: true,
        nextAtFront: false,
        invertPageOrder: false,
        onPageClick: function(pageNumber, event) {
          // Callback triggered when a page is clicked
          // Page number is given as an optional parameter
        },
        onInit: function() {
          // Callback triggered immediately after initialization
        }
      }, options || {});
 
      var self = this;
 
      o.pages = o.pages ? o.pages : Math.ceil(o.items / o.itemsOnPage) ? Math.ceil(o.items / o.itemsOnPage) : 1;
      if (o.currentPage)
        o.currentPage = o.currentPage - 1;
      else
        o.currentPage = !o.invertPageOrder ? 0 : o.pages - 1;
      o.halfDisplayed = o.displayedPages / 2;
 
      this.each(function() {
        self.addClass(o.cssStyle + ' simple-pagination').data('pagination', o);
        methods._draw.call(self);
      });
 
      o.onInit();
 
      return this;
    },
 
    selectPage: function(page) {
      methods._selectPage.call(this, page - 1);
      return this;
    },
 
    prevPage: function() {
      var o = this.data('pagination');
      if (!o.invertPageOrder) {
        if (o.currentPage > 0) {
          methods._selectPage.call(this, o.currentPage - 1);
        }
      } else {
        if (o.currentPage < o.pages - 1) {
          methods._selectPage.call(this, o.currentPage + 1);
        }
      }
      return this;
    },
 
    nextPage: function() {
      var o = this.data('pagination');
      if (!o.invertPageOrder) {
        if (o.currentPage < o.pages - 1) {
          methods._selectPage.call(this, o.currentPage + 1);
        }
      } else {
        if (o.currentPage > 0) {
          methods._selectPage.call(this, o.currentPage - 1);
        }
      }
      return this;
    },
 
    getPagesCount: function() {
      return this.data('pagination').pages;
    },
 
    getCurrentPage: function () {
      return this.data('pagination').currentPage + 1;
    },
 
    destroy: function(){
      this.empty();
      return this;
    },
 
    drawPage: function (page) {
      var o = this.data('pagination');
      o.currentPage = page - 1;
      this.data('pagination', o);
      methods._draw.call(this);
      return this;
    },
 
    redraw: function(){
      methods._draw.call(this);
      return this;
    },
 
    disable: function(){
      var o = this.data('pagination');
      o.disabled = true;
      this.data('pagination', o);
      methods._draw.call(this);
      return this;
    },
 
    enable: function(){
      var o = this.data('pagination');
      o.disabled = false;
      this.data('pagination', o);
      methods._draw.call(this);
      return this;
    },
 
    updateItems: function (newItems) {
      var o = this.data('pagination');
      o.items = newItems;
      o.pages = methods._getPages(o);
      this.data('pagination', o);
      methods._draw.call(this);
    },
 
    updateItemsOnPage: function (itemsOnPage) {
      var o = this.data('pagination');
      o.itemsOnPage = itemsOnPage;
      o.pages = methods._getPages(o);
      this.data('pagination', o);
      methods._selectPage.call(this, 0);
      return this;
    },
 
    _draw: function() {
      var o = this.data('pagination'),
        interval = methods._getInterval(o),
        i,
        tagName;
 
      methods.destroy.call(this);
      
      tagName = (typeof this.prop === 'function') ? this.prop('tagName') : this.attr('tagName');
 
      var $panel = tagName === 'UL' ? this : $('<ul></ul>').appendTo(this);
 
      // Generate Prev link
      if (o.prevText) {
        methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage - 1 : o.currentPage + 1, {text: o.prevText, classes: 'prev'});
      }
 
      // Generate Next link (if option set for at front)
      if (o.nextText && o.nextAtFront) {
        methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {text: o.nextText, classes: 'next'});
      }
 
      // Generate start edges
      if (!o.invertPageOrder) {
        if (interval.start > 0 && o.edges > 0) {
          var end = Math.min(o.edges, interval.start);
          for (i = 0; i < end; i++) {
            methods._appendItem.call(this, i);
          }
          if (o.edges < interval.start && (interval.start - o.edges != 1)) {
            $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
          } else if (interval.start - o.edges == 1) {
            methods._appendItem.call(this, o.edges);
          }
        }
      } else {
        if (interval.end < o.pages && o.edges > 0) {
          var begin = Math.max(o.pages - o.edges, interval.end);
          for (i = o.pages - 1; i >= begin; i--) {
            methods._appendItem.call(this, i);
          }
          if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
            $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
          } else if (o.pages - o.edges - interval.end == 1) {
            methods._appendItem.call(this, interval.end);
          }
        }
      }
 
      // Generate interval links
      if (!o.invertPageOrder) {
        for (i = interval.start; i < interval.end; i++) {
          methods._appendItem.call(this, i);
        }
      } else {
        for (i = interval.end - 1; i >= interval.start; i--) {
          methods._appendItem.call(this, i);
        }
      }
 
      // Generate end edges
      if (!o.invertPageOrder) {
        if (interval.end < o.pages && o.edges > 0) {
          if (o.pages - o.edges > interval.end && (o.pages - o.edges - interval.end != 1)) {
            $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
          } else if (o.pages - o.edges - interval.end == 1) {
            methods._appendItem.call(this, interval.end);
          }
          var begin = Math.max(o.pages - o.edges, interval.end);
          for (i = begin; i < o.pages; i++) {
            methods._appendItem.call(this, i);
          }
        }
      } else {
        if (interval.start > 0 && o.edges > 0) {
          if (o.edges < interval.start && (interval.start - o.edges != 1)) {
            $panel.append('<li class="disabled"><span class="ellipse">' + o.ellipseText + '</span></li>');
          } else if (interval.start - o.edges == 1) {
            methods._appendItem.call(this, o.edges);
          }
          var end = Math.min(o.edges, interval.start);
          for (i = end - 1; i >= 0; i--) {
            methods._appendItem.call(this, i);
          }
        }
      }
 
      // Generate Next link (unless option is set for at front)
      if (o.nextText && !o.nextAtFront) {
        methods._appendItem.call(this, !o.invertPageOrder ? o.currentPage + 1 : o.currentPage - 1, {text: o.nextText, classes: 'next'});
      }
    },
 
    _getPages: function(o) {
      var pages = Math.ceil(o.items / o.itemsOnPage);
      return pages || 1;
    },
 
    _getInterval: function(o) {
      return {
        start: Math.ceil(o.currentPage > o.halfDisplayed ? Math.max(Math.min(o.currentPage - o.halfDisplayed, (o.pages - o.displayedPages)), 0) : 0),
        end: Math.ceil(o.currentPage > o.halfDisplayed ? Math.min(o.currentPage + o.halfDisplayed, o.pages) : Math.min(o.displayedPages, o.pages))
      };
    },
 
    _appendItem: function(pageIndex, opts) {
      var self = this, options, $link, o = self.data('pagination'), $linkWrapper = $('<li></li>'), $ul = self.find('ul');
 
      pageIndex = pageIndex < 0 ? 0 : (pageIndex < o.pages ? pageIndex : o.pages - 1);
 
      options = {
        text: pageIndex + 1,
        classes: ''
      };
 
      if (o.labelMap.length && o.labelMap[pageIndex]) {
        options.text = o.labelMap[pageIndex];
      }
 
      options = $.extend(options, opts || {});
 
      if (pageIndex == o.currentPage || o.disabled) {
        if (o.disabled) {
          $linkWrapper.addClass('disabled');
        } else {
          $linkWrapper.addClass('active');
        }
        $link = $('<span class="current">' + (options.text) + '</span>');
      } else {
        $link = $('<a href="' + o.hrefTextPrefix + (pageIndex + 1) + o.hrefTextSuffix + '" class="page-link">' + (options.text) + '</a>');
        $link.click(function(event){
          return methods._selectPage.call(self, pageIndex, event);
        });
      }
 
      if (options.classes) {
        $link.addClass(options.classes);
      }
 
      $linkWrapper.append($link);
 
      if ($ul.length) {
        $ul.append($linkWrapper);
      } else {
        self.append($linkWrapper);
      }
    },
 
    _selectPage: function(pageIndex, event) {
      var o = this.data('pagination');
      o.currentPage = pageIndex;
      if (o.selectOnClick) {
        methods._draw.call(this);
      }
      return o.onPageClick(pageIndex + 1, event);
    }
 
  };
 
  $.fn.pagination = function(method) {
 
    // Method calling logic
    if (methods[method] && method.charAt(0) != '_') {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.pagination');
    }
 
  };
 
})(jQuery);
 
 
// Store the CSS in here to make the script Firefox compatable.
var CSS = "/**" + 
"* CSS themes for simplePagination.js" +
"* Author: Flavius Matis - http://flaviusmatis.github.com/" +
"* URL: https://github.com/flaviusmatis/simplePagination.js" +
"*/" +
"" +
"ul.simple-pagination {" +
"    list-style: none;" +
"}" +
"" +
".simple-pagination {" +
"    display: block;" +
"    overflow: hidden;" +
"    padding: 0 5px 5px 0;" +
"    margin: 0;" +
"}" +
"" +
".simple-pagination ul {" +
"    list-style: none;" +
"    padding: 0;" +
"    margin: 0;" +
"}" +
"" +
".simple-pagination li {" +
"    list-style: none;" +
"    padding: 0;" +
"    margin: 0;" +
"    float: left;" +
"}" +
"" +
"/*------------------------------------*\\" +
"    Compact Theme Styles" +
"\*------------------------------------*/" +
"" +
".compact-theme a, .compact-theme span {" +
"    float: left;" +
"    color: #333;" +
"    font-size:14px;" +
"    line-height:24px;" +
"    font-weight: normal;" +
"    text-align: center;" +
"    border: 1px solid #AAA;" +
"    border-left: none;" +
"    min-width: 14px;" +
"    padding: 0 7px;" +
"    box-shadow: 2px 2px 2px rgba(0,0,0,0.2);" +
"    background: #efefef; /* Old browsers */" +
"    background: -moz-linear-gradient(top, #ffffff 0%, #efefef 100%); /* FF3.6+ */" +
"    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(100%,#efefef)); /* Chrome,Safari4+ */" +
"    background: -webkit-linear-gradient(top, #ffffff 0%,#efefef 100%); /* Chrome10+,Safari5.1+ */" +
"    background: -o-linear-gradient(top, #ffffff 0%,#efefef 100%); /* Opera11.10+ */" +
"    background: -ms-linear-gradient(top, #ffffff 0%,#efefef 100%); /* IE10+ */" +
"    background: linear-gradient(top, #ffffff 0%,#efefef 100%); /* W3C */" +
"}" +
"" +
".compact-theme a:hover {" +
"    text-decoration: none;" +
"    background: #efefef; /* Old browsers */" +
"    background: -moz-linear-gradient(top, #efefef 0%, #bbbbbb 100%); /* FF3.6+ */" +
"    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#efefef), color-stop(100%,#bbbbbb)); /* Chrome,Safari4+ */" +
"    background: -webkit-linear-gradient(top, #efefef 0%,#bbbbbb 100%); /* Chrome10+,Safari5.1+ */" +
"    background: -o-linear-gradient(top, #efefef 0%,#bbbbbb 100%); /* Opera11.10+ */" +
"    background: -ms-linear-gradient(top, #efefef 0%,#bbbbbb 100%); /* IE10+ */" +
"    background: linear-gradient(top, #efefef 0%,#bbbbbb 100%); /* W3C */" +
"}" +
"" +
".compact-theme li:first-child a, .compact-theme li:first-child span {" +
"    border-left: 1px solid #AAA;" +
"    border-radius: 3px 0 0 3px;" +
"}" +
"" +
".compact-theme li:last-child a, .compact-theme li:last-child span {" +
"    border-radius: 0 3px 3px 0;" +
"}" +
"" +
".compact-theme .current {" +
"    background: #bbbbbb; /* Old browsers */" +
"    background: -moz-linear-gradient(top, #bbbbbb 0%, #efefef 100%); /* FF3.6+ */" +
"    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#bbbbbb), color-stop(100%,#efefef)); /* Chrome,Safari4+ */" +
"    background: -webkit-linear-gradient(top, #bbbbbb 0%,#efefef 100%); /* Chrome10+,Safari5.1+ */" +
"    background: -o-linear-gradient(top, #bbbbbb 0%,#efefef 100%); /* Opera11.10+ */" +
"    background: -ms-linear-gradient(top, #bbbbbb 0%,#efefef 100%); /* IE10+ */" +
"    background: linear-gradient(top, #bbbbbb 0%,#efefef 100%); /* W3C */" +
"    cursor: default;" +
"}" +
"" +
".compact-theme .ellipse {" +
"    background: #EAEAEA;" +
"    padding: 0 10px;" +
"    cursor: default;" +
"}" +
"" +
"/*------------------------------------*\\" +
"    Light Theme Styles" +
"\*------------------------------------*/" +
"" +
".light-theme a, .light-theme span {" +
"    float: left;" +
"    color: #666;" +
"    font-size:14px;" +
"    line-height:24px;" +
"    font-weight: normal;" +
"    text-align: center;" +
"    border: 1px solid #BBB;" +
"    min-width: 14px;" +
"    padding: 0 7px;" +
"    margin: 0 5px 0 0;" +
"    border-radius: 3px;" +
"    box-shadow: 0 1px 2px rgba(0,0,0,0.2);" +
"    background: #efefef; /* Old browsers */" +
"    background: -moz-linear-gradient(top, #ffffff 0%, #efefef 100%); /* FF3.6+ */" +
"    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(100%,#efefef)); /* Chrome,Safari4+ */" +
"    background: -webkit-linear-gradient(top, #ffffff 0%,#efefef 100%); /* Chrome10+,Safari5.1+ */" +
"    background: -o-linear-gradient(top, #ffffff 0%,#efefef 100%); /* Opera11.10+ */" +
"    background: -ms-linear-gradient(top, #ffffff 0%,#efefef 100%); /* IE10+ */" +
"    background: linear-gradient(top, #ffffff 0%,#efefef 100%); /* W3C */" +
"}" +
"" +
".light-theme a:hover {" +
"    text-decoration: none;" +
"    background: #FCFCFC;" +
"}" +
"" +
".light-theme .current {" +
"    background: #666;" +
"    color: #FFF;" +
"    border-color: #444;" +
"    box-shadow: 0 1px 0 rgba(255,255,255,1), 0 0 2px rgba(0, 0, 0, 0.3) inset;" +
"    cursor: default;" +
"}" +
"" +
".light-theme .ellipse {" +
"    background: none;" +
"    border: none;" +
"    border-radius: 0;" +
"    box-shadow: none;" +
"    font-weight: bold;" +
"    cursor: default;" +
"}" +
"" +
"/*------------------------------------*\\" +
"    Dark Theme Styles" +
"\*------------------------------------*/" +
"" +
".dark-theme a, .dark-theme span {" +
"    float: left;" +
"    color: #CCC;" +
"    font-size:14px;" +
"    line-height:24px;" +
"    font-weight: normal;" +
"    text-align: center;" +
"    border: 1px solid #222;" +
"    min-width: 14px;" +
"    padding: 0 7px;" +
"    margin: 0 5px 0 0;" +
"    border-radius: 3px;" +
"    box-shadow: 0 1px 2px rgba(0,0,0,0.2);" +
"    background: #555; /* Old browsers */" +
"    background: -moz-linear-gradient(top, #555 0%, #333 100%); /* FF3.6+ */" +
"    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#555), color-stop(100%,#333)); /* Chrome,Safari4+ */" +
"    background: -webkit-linear-gradient(top, #555 0%,#333 100%); /* Chrome10+,Safari5.1+ */" +
"    background: -o-linear-gradient(top, #555 0%,#333 100%); /* Opera11.10+ */" +
"    background: -ms-linear-gradient(top, #555 0%,#333 100%); /* IE10+ */" +
"    background: linear-gradient(top, #555 0%,#333 100%); /* W3C */" +
"}" +
"" +
".dark-theme a:hover {" +
"    text-decoration: none;" +
"    background: #444;" +
"}" +
"" +
".dark-theme .current {" +
"    background: #222;" +
"    color: #FFF;" +
"    border-color: #000;" +
"    box-shadow: 0 1px 0 rgba(255,255,255,0.2), 0 0 1px 1px rgba(0, 0, 0, 0.1) inset;" +
"    cursor: default;" +
"}" +
"" +
".dark-theme .ellipse {" +
"    background: none;" +
"    border: none;" +
"    border-radius: 0;" +
"    box-shadow: none;" +
"    font-weight: bold;" +
"    cursor: default;" +
"}" +
"" + 
"span.sentence-explode {" +
"    margin-right: 10px;" +
"    margin-left: 10px;" +
"    font-size: 125%;" +
"}" +
"" +
"span.exploder {" +
"    padding-right: 10px;" +
"    font-weight: bold;" +
"    font-size: 125%;" +
"    margin-left: 0px;" +
"}";
 
function main(LEARNED_VOCABULARY) {
    // Add the CSS to the page.
    $('head').append('<style>' + CSS + '</style>');
    
    //
    // Given a jQuery container, activate all tooltips within the container.
    //
    function ActivateTooltips(container) {
        if (container && container.tooltip) {
           container.find('span[rel="tooltip"]').tooltip();
        }
    }
 
    //
    // Extract the Kanji from the current page. This will have a switch for each type of page, and
    // will do something different for each. This will only include vocabulary pages, reviews and
    // lessons.
    //
    function GetVocabularyKanjiFromPage() {
        // Vocabulary information page.
        if (url.indexOf('vocabulary') != -1) {
            return $('header span.vocabulary-icon span').text().trim();
        }
 
        // Review page.
        else if (url.indexOf('review/session') != -1) {
            return $.jStorage.get('currentItem').voc;
        }
 
        // Lesson page.
        else if (url.indexOf('lesson/session') != -1) {
            return $.jStorage.get('l/currentLesson').voc;
        }
 
        // Not on a valid page.
        else {
            return null;
        }
    }
 
    //
    // Extract the kana from the current page. This will have a switch for each type of page, and
    // will do something different for each. This will only include vocabulary pages, reviews and
    // lessons.
    //
    function GetVocabularyKanaFromPage() {
        // Vocabulary information page.
        if (url.indexOf('vocabulary') != -1) {
            return $('section.vocabulary-reading p').text().trim();
        }
 
        // Review page.
        else if (url.indexOf('review/session') != -1) {
            return $.jStorage.get('currentItem').kana[0];
        }
 
        // Lesson page.
        else if (url.indexOf('lesson/session') != -1) {
            return $.jStorage.get('l/currentLesson').kana[0];
        }
 
        // Not on a valid page.
        else {
            return null;
        }
    }
 
    //
    // Get the data from the remote URL for the given vocabulary.
    //
    function GetExampleSentencesForVocabulary(vocabulary, complete) {
        $('section#example-sentences-section').detach();
        $.get('https://jeshuam.pythonanywhere.com/wanikani-sentences/' + vocabulary, complete);
    }
 
    function GetSectionWithExamplesSentences(data) {
        // Build the basic sentence structure.
        var section = $('<section id="example-sentences-section" />')
            .append('<h2>Example Sentences</h2>')
            .append('<div id="example-sentences"><div></div></div>');
 
        return section;
    }
 
    function SetupPaginationOnSectionWithSentenceData(section, data) {
        // Setup pagination on the section.
        var NUMBER_OF_ITEMS_PER_PAGE = 3;
 
        // Filter the data so that only sentences with all known vocab are displayed.
        if (LEARNED_VOCABULARY != null) {
            data = jQuery.grep(data, function(sentence, _) {
                var valid = true;
                $.each(sentence.jpn, function(_, japaneseWord) {
                    if (LEARNED_VOCABULARY[japaneseWord] == undefined && !OnlyContainsKanaOrPunctuation(japaneseWord)) {
                        valid = false;
                        return false;
                    }
                });
 
                return valid;
            });
        }
 
        //
        // Function to check whether a Japanese word only contains kana (hira- or katakana).
        //
        function OnlyContainsKanaOrPunctuation(japaneseWord) {
            return japaneseWord.match(/^[\u3000-\u30FF]+$/) != null;
        }
 
        //
        // Display the given page within the div.
        //
        function DisplaySamplesSentencesPage(pageNumber, div) {
            div.find('ol').detach();
 
            // Extrac the vocab and kana from the page.
            var kanji = GetVocabularyKanjiFromPage();
            var kana = GetVocabularyKanaFromPage();
 
            // Slice out the data items we are interested in. This is assuming
            // that `pageNumber` is indexed from 1.
            var pageData = div.data('sentences').slice(
                (pageNumber - 1) * NUMBER_OF_ITEMS_PER_PAGE,
                (pageNumber * NUMBER_OF_ITEMS_PER_PAGE));
 
            // Replace all sentences with the next page.
            div.find('div').last().before('<ol>');
            $.each(pageData, function(_, sentence) {
                // If we are up to a filler, just add the space.
                if (sentence == null) {
                    div.find('ol').append('<li style="list-style-type: none; margin-left: -20px"><p>&nbsp;</p><div style="margin: -5px 10px">&nbsp;</div></li>');
                    return;
                }
 
                // Pre-process the sentence.
                var japaneseText = '';
                $.each(sentence.jpn, function(_, japaneseWord) {
                    // Highlight the current word.
                    if (japaneseWord == kanji) {
                        japaneseText += '<span class="vocabulary-highlight highlight-vocabulary" rel="tooltip" data-original-title="' + kana + '">' + kanji + '</span>'
                    }
 
                    // Insert a link to the WaniKani page for learned vocabulary.
                    else if (LEARNED_VOCABULARY != null && LEARNED_VOCABULARY[japaneseWord] != undefined) {
                        japaneseText += '<span><a href="https://www.wanikani.com/vocabulary/' + LEARNED_VOCABULARY[japaneseWord] + '">' + japaneseWord + '</a></span>';
                    }
 
                    // Otherwise, just put the word into the text.
                    else {
                        japaneseText += '<span>' + japaneseWord + '</span>';
                    } 
                });
 
                if (!japaneseText) {
                    return;
                }
 
                var listEntry = $('<li style="list-style-type: none; margin-left: -20px"><p><span class="exploder">↨</span>' + japaneseText + '</p>' + '<div style="margin: -5px 10px">↳&nbsp;' + sentence.eng + '</div></li>');
                listEntry.find('span.exploder').click(function() {
                    $(this).parent().find('span').toggleClass('sentence-explode');
                });
                div.find('ol').append(listEntry);
            });
 
            // Activate the tooltips.
            ActivateTooltips(div);
        }
 
        // If the data doesn't contain the correct number of elements, pad it
        // with additional &nbsp;'s. This is apparently the modulo operator.
        // Seriously, fuck JavaScript.
        var n = NUMBER_OF_ITEMS_PER_PAGE;
        var padding = n - (data.length % n);
        if (padding == n) {
            padding = 0;
        }
 
        for (var i = 0; i < padding; i++) {
            data.push(null);
        }
 
        var div = section.find('div#example-sentences');
        div.data('sentences', data);
        div.find('div').pagination({
            // Decide how many pages there are.
            items: data.length,
            itemsOnPage: NUMBER_OF_ITEMS_PER_PAGE,
 
            // Always start on page 1.
            currentPage: 1,
 
            // Change the page manually.
            onPageClick: function(pageNumber, event) {
                DisplaySamplesSentencesPage(pageNumber, div);
            },
 
            // Display page 1 on init.
            onInit: function() {
                DisplaySamplesSentencesPage(1, div);
            }
        });
    }
 
    // Switch based on the content of the URL.
    var url = document.URL;
 
    // Process the vocabulary page.
    if (url.indexOf('vocabulary') != -1) {
        var vocabulary = $('header span.vocabulary-icon span').text();
 
        GetExampleSentencesForVocabulary(vocabulary, function(data) {
            if (data.length == 0) {
                return;
            }
 
            var section = GetSectionWithExamplesSentences(data);
            $('section.vocabulary-reading').after(section);
            SetupPaginationOnSectionWithSentenceData(section, data);
        });
    }
 
    // Process the review page.
    else if (url.indexOf('review/session') != -1) {
        // Display the information when the current item changes. Don't do this if they are
        // supposed to enter the reading.
        $.jStorage.listenKeyChange('currentItem', function(key) {
            var currentVocab = $.jStorage.get(key).voc;
            GetExampleSentencesForVocabulary(currentVocab, function(data) {
                // Make sure the current vocabulary still matches what is on the page (this
                // is to prevent multiple sentence boxes from showing up).
                if ($.jStorage.get(key).voc != currentVocab) {
                    return;
                }
 
                if (data.length == 0) {
                    return;
                }
 
                if ($('#answer-form input').attr('lang') != 'ja') {
                    var section = GetSectionWithExamplesSentences(data);
                    $('div#all-info').before(section.prepend('<br />'));
                    SetupPaginationOnSectionWithSentenceData(section, data);
                }
            });
        });
 
        // If the 'all-info' button is pressed, then display it.
        $('div#all-info').on('click', function() {
            GetExampleSentencesForVocabulary($.jStorage.get('currentItem').voc, function(data) {
                if (data.length == 0) {
                    return;
                }
 
                var section = GetSectionWithExamplesSentences(data);
                $('div#all-info').before(section.prepend('<br />'));
                SetupPaginationOnSectionWithSentenceData(section, data);
            });
        });
    }
 
    // Process the lesson page.
    else if (url.indexOf('lesson/session') != -1) {
        $.jStorage.listenKeyChange('l/currentLesson', function(key) {
            GetExampleSentencesForVocabulary($.jStorage.get(key).voc, function(data) {
                if (data.length == 0) {
                    return;
                }
 
                var section = GetSectionWithExamplesSentences(data);
                $('div#supplement-voc-meaning').append(section.prepend('<br />'));
                SetupPaginationOnSectionWithSentenceData(section, data);
            });
        });
    }
}
 
function EndsInUSound(japaneseWord) {
    return japaneseWord.match(/[るゆむふぬつすくう]/) != null;
}
 
$(function() {
    // If they haven't entered their API key, just show all sentences.
    var API_KEY = WaniKaniAPI.getAPIKey();
    if (API_KEY == undefined) {
        main(null);
        return;
    }
 
    // Default expiration timer to 1 day (24 hours, 60 minutes, 60 seconds, 1000 ms).
    var CACHE_EXPIRATION_TIMER = 1000 * 60 * 60 * 24;
 
    // If necessary, load a map of unlocked vocab.
    var currentTime = (new Date().getTime());
    var unlockedVocabJson = GM_getValue('wanikani-sentences-learned-cache');
    
    var unlockedVocab = {'__cache-time': 0};
    if (unlockedVocabJson != undefined) {
        unlockedVocab = JSON.parse(GM_getValue('wanikani-sentences-learned-cache'));
    }
    
    if (unlockedVocab == undefined || (currentTime - unlockedVocab['__cache-time']) > CACHE_EXPIRATION_TIMER) {
        $.get('https://www.wanikani.com/api/user/' + API_KEY + '/vocabulary', function(data) {
            var unlockedVocab = {};
            $.each(data.requested_information.general, function(_, vocab) {
                if (vocab.user_specific != null) {
                    var kanji = vocab.character.replace(/〜/g, '');
                    unlockedVocab[kanji] = kanji;
 
                    if (EndsInUSound(kanji)) {
                        unlockedVocab[kanji.substr(0, kanji.length - 1)] = kanji;
                    }
                }
            });
 
            // Cache time in milliseconds since the epoch.
            unlockedVocab['__cache-time'] = (new Date().getTime());
 
            GM_setValue('wanikani-sentences-learned-cache', JSON.stringify(unlockedVocab));
            main(unlockedVocab);
        });
    } else {
        main(unlockedVocab);
    }
});