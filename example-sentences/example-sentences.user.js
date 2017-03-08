// ==UserScript==
// @name WaniKani Example Sentences
// @version 2.1
// @description  Displays additional examples sentences for the given vocabulary.
// @match https://www.wanikani.com/vocabulary/*
// @copyright 2014 jeshuam
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

// https://github.com/yanatan16/nanoajax
!function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}());

window.onload = function() {
  // Find the vocab for this page, based on the URL.
  let vocab = null;
  if (window.location.href.indexOf('vocabulary') > 0) {
      let parts = window.location.href.split('/');
      vocab = parts[parts.length - 1];
  }

  if (vocab === null) {
      console.log('example-sentences: could not determine vocabulary item.');
      return;
  }

  console.log('example-sentences: found vocab!');

  // Add context sentences to the Context Sentences div.
  let contextDiv = document.querySelector('.context-sentence');
  let sentencesDiv = document.createElement('section');
  contextDiv.parentNode.insertBefore(sentencesDiv, contextDiv.nextSibling);

  let header = document.createElement('h2');
  header.textContent = '(More) Context Sentences';
  sentencesDiv.appendChild(header);

  // Query the remote server for a list of sentences.
  nanoajax.ajax({url: 'https://jeshuam.pythonanywhere.com/wanikani-sentences/' + vocab, method: 'GET'}, function(code, responseText, request) {
    let response = JSON.parse(responseText);
    for (let sentence of response) {
      let jap = sentence.jpn.join('');
      let eng = sentence.eng;
      let contextSentenceDiv = document.createElement('div');
      contextSentenceDiv.innerHTML = `<p class="ja">${jap}</p><p>${eng}</p>`;
      contextSentenceDiv.className = 'context-sentence-group';
      sentencesDiv.appendChild(contextSentenceDiv);
    }
  });
};
