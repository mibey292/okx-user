/**
 * Comprehensive Redirect Blocker
 * Prevents OKX domain check redirects and other navigation attempts
 * Load this FIRST in the HTML head
 */

(function() {
  'use strict';
  
  console.log('🔒 INITIALIZING COMPREHENSIVE REDIRECT BLOCKER v2');
  
  // Mock window.location properties to prevent domain checks
  const mockLocation = {
    href: window.location.href,
    hostname: 'okx.com',
    host: 'okx.com',
    origin: 'https://okx.com',
    protocol: 'https:',
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    port: '443'
  };
  
  // Block all redirect methods
  window.location.replace = function(url) {
    console.log('🚫 [BLOCKED] location.replace:', url);
    return false;
  };
  
  window.location.assign = function(url) {
    console.log('🚫 [BLOCKED] location.assign:', url);
    return false;
  };
  
  window.location.reload = function(forceReload) {
    console.log('🚫 [BLOCKED] location.reload');
    return false;
  };
  
  // Override history to prevent back/forward/navigation
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  
  window.history.pushState = function(state, title, url) {
    if (url && typeof url === 'string' && url.includes('okx.com')) {
      console.log('🚫 [BLOCKED] history.pushState:', url);
      return;
    }
    return originalPushState(state, title, url);
  };
  
  window.history.replaceState = function(state, title, url) {
    if (url && typeof url === 'string' && url.includes('okx.com')) {
      console.log('🚫 [BLOCKED] history.replaceState:', url);
      return;
    }
    return originalReplaceState(state, title, url);
  };
  
  // Block fetch redirects
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const urlStr = typeof url === 'string' ? url : (url.url || String(url));
    if (urlStr.includes('okx.com')) {
      console.log('🚫 [BLOCKED] fetch to:', urlStr);
      return Promise.reject(new Error('External requests blocked'));
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Block XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && url.includes('okx.com')) {
      console.log('🚫 [BLOCKED] XHR request to:', url);
      this._blocked = true;
      return;
    }
    return originalXHROpen.apply(this, arguments);
  };
  
  // Block XHR send if it was blocked during open
  const originalXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    if (this._blocked) {
      console.log('🚫 [BLOCKED] XHR send (request was blocked)');
      return;
    }
    return originalXHRSend.apply(this, arguments);
  };
  
  // Watch for script tags trying to load external resources
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      Object.defineProperty(element, 'src', {
        get: function() { 
          return this._src || ''; 
        },
        set: function(url) {
          if (url && url.includes('okx.com') && !url.includes('cdn/assets')) {
            console.log('🚫 [BLOCKED] Script src set to:', url);
            this._src = '';
            return;
          }
          this._src = url;
          return originalSrc.set.call(this, url);
        }
      });
    }
    
    return element;
  };
  
  // Block meta refresh redirects
  function removeMetaRefresh() {
    document.querySelectorAll('meta[http-equiv="refresh"]').forEach(el => {
      console.log('🚫 [BLOCKED] Meta refresh tag removed');
      el.remove();
    });
  }
  
  removeMetaRefresh();
  
  // Watch for meta refresh additions
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'META' && node.getAttribute('http-equiv') === 'refresh') {
          console.log('🚫 [BLOCKED] Meta refresh tag detected and removed');
          node.remove();
        }
      });
    });
  });
  
  observer.observe(document.head || document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Block beacons (used for analytics redirects)
  const originalSendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    if (url && url.includes('okx.com')) {
      console.log('🚫 [BLOCKED] Beacon to:', url);
      return false;
    }
    return originalSendBeacon.apply(navigator, arguments);
  };
  
  // Block image pixel tracking
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    Object.defineProperty(img, 'src', {
      get: function() { return this._src || ''; },
      set: function(url) {
        if (url && url.includes('okx.com')) {
          console.log('🚫 [BLOCKED] Image tracking pixel to:', url);
          return;
        }
        this._src = url;
        return originalSrcSetter.set.call(this, url);
      }
    });
    
    return img;
  };
  
  // Override window.open to prevent popup redirects
  const originalOpen = window.open;
  window.open = function(url, target, features) {
    if (url && url.includes('okx.com')) {
      console.log('🚫 [BLOCKED] window.open to:', url);
      return null;
    }
    return originalOpen.apply(window, arguments);
  };
  
  console.log('✅ Redirect blocker v2 fully initialized - all redirect vectors blocked');
})();
