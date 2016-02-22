(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["stream"] = factory();
	else
		root["stream"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * @module stream
	 * @author Thierry Schellenbach
	 * BSD License
	 */
	'use strict';

	var StreamClient = __webpack_require__(2);
	var errors = __webpack_require__(5);
	var request = __webpack_require__(3);

	function connect(apiKey, apiSecret, appId, options) {
	  /**
	   * Create StreamClient
	   * @method connect
	   * @param  {string} apiKey    API key
	   * @param  {string} [apiSecret] API secret (only use this on the server)
	   * @param  {string} [appId]     Application identifier
	   * @param  {object} [options]   Additional options
	   * @param  {string} [options.location] Datacenter location
	   * @return {StreamClient}     StreamClient
	   * @example <caption>Basic usage</caption>
	   * stream.connect(apiKey, apiSecret);
	   * @example <caption>or if you want to be able to subscribe and listen</caption>
	   * stream.connect(apiKey, apiSecret, appId);
	   * @example <caption>or on Heroku</caption>
	   * stream.connect(streamURL);
	   * @example <caption>where streamURL looks like</caption>
	   * "https://thierry:pass@gestream.io/?app=1"
	   */
	  if (typeof process !== 'undefined' && process.env.STREAM_URL && !apiKey) {
	    var parts = /https\:\/\/(\w+)\:(\w+)\@([\w-]*).*\?app_id=(\d+)/.exec(process.env.STREAM_URL);
	    apiKey = parts[1];
	    apiSecret = parts[2];
	    var location = parts[3];
	    appId = parts[4];
	    if (options === undefined) {
	      options = {};
	    }

	    if (location !== 'getstream') {
	      options.location = location;
	    }
	  }

	  return new StreamClient(apiKey, apiSecret, appId, options);
	}

	module.exports.connect = connect;
	module.exports.errors = errors;
	module.exports.request = request;
	module.exports.Client = StreamClient;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var request = __webpack_require__(3);
	var StreamFeed = __webpack_require__(4);
	var signing = __webpack_require__(7);
	var errors = __webpack_require__(5);
	var utils = __webpack_require__(6);
	var BatchOperations = __webpack_require__(9);
	var Promise = __webpack_require__(11);
	var qs = __webpack_require__(9);

	/**
	 * @callback requestCallback
	 * @param {object} [errors]
	 * @param {object} response
	 * @param {object} body
	 */

	var StreamClient = function StreamClient() {
	  /**
	   * Client to connect to Stream api
	   * @class StreamClient
	   */
	  this.initialize.apply(this, arguments);
	};

	StreamClient.prototype = {
	  baseUrl: 'https://api.getstream.io/api/',
	  baseAnalyticsUrl: 'https://analytics.getstream.io/analytics/',

	  initialize: function initialize(apiKey, apiSecret, appId, options) {
	    /**
	     * Initialize a client
	     * @method intialize
	     * @memberof StreamClient.prototype
	     * @param {string} apiKey - the api key
	     * @param {string} [apiSecret] - the api secret
	     * @param {string} [appId] - id of the app
	     * @param {object} [options] - additional options
	     * @param {string} [options.location] - which data center to use
	     * @param {boolean} [options.expireTokens=false] - whether to use a JWT timestamp field (i.e. iat)
	     * @example <caption>initialize is not directly called by via stream.connect, ie:</caption>
	     * stream.connect(apiKey, apiSecret)
	     * @example <caption>secret is optional and only used in server side mode</caption>
	     * stream.connect(apiKey, null, appId);
	     */
	    this.apiKey = apiKey;
	    this.apiSecret = apiSecret;
	    this.appId = appId;
	    this.options = options || {};
	    this.version = this.options.version || 'v1.0';
	    this.fayeUrl = this.options.fayeUrl || 'https://faye.getstream.io/faye';
	    this.fayeClient = null;
	    // track a source name for the api calls, ie get started or databrowser
	    this.group = this.options.group || 'unspecified';
	    // track subscriptions made on feeds created by this client
	    this.subscriptions = {};
	    this.expireTokens = this.options.expireTokens ? this.options.expireTokens : false;
	    // which data center to use
	    this.location = this.options.location;
	    if (this.location) {
	      this.baseUrl = 'https://' + this.location + '-api.getstream.io/api/';
	    }

	    if (typeof process !== 'undefined' && process.env.LOCAL) {
	      this.baseUrl = 'http://localhost:8000/api/';
	    }

	    if (typeof process !== 'undefined' && process.env.LOCAL_FAYE) {
	      this.fayeUrl = 'http://localhost:9999/faye/';
	    }

	    this.handlers = {};
	    this.browser = typeof window !== 'undefined';
	    this.node = !this.browser;

	    if (this.browser && this.apiSecret) {
	      throw new errors.FeedError('You are publicly sharing your private key. Dont use the private key while in the browser.');
	    }
	  },

	  on: function on(event, callback) {
	    /**
	     * Support for global event callbacks
	     * This is useful for generic error and loading handling
	     * @method on
	     * @memberof StreamClient.prototype
	     * @param {string} event - Name of the event
	     * @param {function} callback - Function that is called when the event fires
	     * @example
	     * client.on('request', callback);
	     * client.on('response', callback);
	     */
	    this.handlers[event] = callback;
	  },

	  off: function off(key) {
	    /**
	     * Remove one or more event handlers
	     * @method off
	     * @memberof StreamClient.prototype
	     * @param {string} [key] - Name of the handler
	     * @example
	     * client.off() removes all handlers
	     * client.off(name) removes the specified handler
	     */
	    if (key === undefined) {
	      this.handlers = {};
	    } else {
	      delete this.handlers[key];
	    }
	  },

	  send: function send() {
	    /**
	     * Call the given handler with the arguments
	     * @method send
	     * @memberof StreamClient.prototype
	     * @access private
	     */
	    var args = Array.prototype.slice.call(arguments);
	    var key = args[0];
	    args = args.slice(1);
	    if (this.handlers[key]) {
	      this.handlers[key].apply(this, args);
	    }
	  },

	  wrapPromiseTask: function wrapPromiseTask(cb, fulfill, reject) {
	    /**
	     * Wrap a task to be used as a promise
	     * @method wrapPromiseTask
	     * @memberof StreamClient.prototype
	     * @private
	     * @param {requestCallback} cb
	     * @param {function} fulfill
	     * @param {function} reject
	     * @return {function}
	     */
	    var client = this;

	    var callback = this.wrapCallback(cb);
	    return function task(error, response, body) {
	      if (error) {
	        reject({
	          error: error,
	          response: response
	        });
	      } else if (!/^2/.test('' + response.statusCode)) {
	        reject({
	          error: body,
	          response: response
	        });
	      } else {
	        fulfill(body);
	      }

	      callback.apply(client, arguments);
	    };
	  },

	  wrapCallback: function wrapCallback(cb) {
	    /**
	     * Wrap callback for HTTP request
	     * @method wrapCallBack
	     * @memberof StreamClient.prototype
	     * @access private
	     */
	    var client = this;

	    function callback() {
	      // first hit the global callback, subsequently forward
	      var args = Array.prototype.slice.call(arguments);
	      var sendArgs = ['response'].concat(args);
	      client.send.apply(client, sendArgs);
	      if (cb !== undefined) {
	        cb.apply(client, args);
	      }
	    }

	    return callback;
	  },

	  userAgent: function userAgent() {
	    /**
	     * Get the current user agent
	     * @method userAgent
	     * @memberof StreamClient.prototype
	     * @return {string} current user agent
	     */
	    var description = this.node ? 'node' : 'browser';
	    // TODO: get the version here in a way which works in both and browserify
	    var version = 'unknown';
	    return 'stream-javascript-client-' + description + '-' + version;
	  },

	  getReadOnlyToken: function getReadOnlyToken(feedSlug, userId) {
	    /**
	     * Returns a token that allows only read operations
	     *
	     * @method getReadOnlyToken
	     * @memberof StreamClient.prototype
	     * @param {string} feedSlug - The feed slug to get a read only token for
	     * @param {string} userId - The user identifier
	     * @return {string} token
	     * @example
	     * client.getReadOnlyToken('user', '1');
	     */
	    var feedId = '' + feedSlug + userId;
	    return signing.JWTScopeToken(this.apiSecret, '*', 'read', { feedId: feedId, expireTokens: this.expireTokens });
	  },

	  getReadWriteToken: function getReadWriteToken(feedSlug, userId) {
	    /**
	     * Returns a token that allows read and write operations
	     *
	     * @method getReadWriteToken
	     * @memberof StreamClient.prototype
	     * @param {string} feedSlug - The feed slug to get a read only token for
	     * @param {string} userId - The user identifier
	     * @return {string} token
	     * @example
	     * client.getReadWriteToken('user', '1');
	     */
	    var feedId = '' + feedSlug + userId;
	    return signing.JWTScopeToken(this.apiSecret, '*', '*', { feedId: feedId, expireTokens: this.expireTokens });
	  },

	  feed: function feed(feedSlug, userId, token, siteId, options) {
	    /**
	     * Returns a feed object for the given feed id and token
	     * @method feed
	     * @memberof StreamClient.prototype
	     * @param {string} feedSlug - The feed slug
	     * @param {string} userId - The user identifier
	     * @param {string} [token] - The token
	     * @param {string} [siteId] - The site identifier
	     * @param {object} [options] - Additional function options
	     * @param {boolean} [options.readOnly] - A boolean indicating whether to generate a read only token for this feed
	     * @return {StreamFeed}
	     * @example
	     * client.feed('user', '1', 'token2');
	     */

	    options = options || {};

	    if (!feedSlug || !userId) {
	      throw new errors.FeedError('Please provide a feed slug and user id, ie client.feed("user", "1")');
	    }

	    if (feedSlug.indexOf(':') !== -1) {
	      throw new errors.FeedError('Please initialize the feed using client.feed("user", "1") not client.feed("user:1")');
	    }

	    utils.validateFeedSlug(feedSlug);
	    utils.validateUserId(userId);

	    // raise an error if there is no token
	    if (!this.apiSecret && !token) {
	      throw new errors.FeedError('Missing token, in client side mode please provide a feed secret');
	    }

	    // create the token in server side mode
	    if (this.apiSecret && !token) {
	      var feedId = '' + feedSlug + userId;
	      // use scoped token if read-only access is necessary
	      token = options.readOnly ? this.getReadOnlyToken(feedSlug, userId) : signing.sign(this.apiSecret, feedId);
	    }

	    var feed = new StreamFeed(this, feedSlug, userId, token, siteId);
	    return feed;
	  },

	  enrichUrl: function enrichUrl(relativeUrl) {
	    /**
	     * Combines the base url with version and the relative url
	     * @method enrichUrl
	     * @memberof StreamClient.prototype
	     * @private
	     * @param {string} relativeUrl
	     */
	    var url = this.baseUrl + this.version + '/' + relativeUrl;
	    return url;
	  },

	  enrichKwargs: function enrichKwargs(kwargs) {
	    /**
	     * Adds the API key and the signature
	     * @method enrichKwargs
	     * @memberof StreamClient.prototype
	     * @param {object} kwargs
	     * @private
	     */
	    kwargs.url = this.enrichUrl(kwargs.url);
	    if (kwargs.qs === undefined) {
	      kwargs.qs = {};
	    }

	    kwargs.qs['api_key'] = this.apiKey;
	    kwargs.qs.location = this.group;
	    kwargs.json = true;
	    var signature = kwargs.signature || this.signature;
	    kwargs.headers = {};

	    // auto-detect authentication type and set HTTP headers accordingly
	    if (signing.isJWTSignature(signature)) {
	      kwargs.headers['stream-auth-type'] = 'jwt';
	      signature = signature.split(' ').reverse()[0];
	    } else {
	      kwargs.headers['stream-auth-type'] = 'simple';
	    }

	    kwargs.headers.Authorization = signature;
	    kwargs.headers['X-Stream-Client'] = this.userAgent();
	    return kwargs;
	  },

	  signActivity: function signActivity(activity) {
	    /**
	     * We automatically sign the to parameter when in server side mode
	     * @method signActivities
	     * @memberof StreamClient.prototype
	     * @private
	     * @param  {object}       [activity] Activity to sign
	     */
	    return this.signActivities([activity])[0];
	  },

	  signActivities: function signActivities(activities) {
	    /**
	     * We automatically sign the to parameter when in server side mode
	     * @method signActivities
	     * @memberof StreamClient.prototype
	     * @private
	     * @param {array} Activities
	     */
	    if (!this.apiSecret) {
	      return activities;
	    }

	    for (var i = 0; i < activities.length; i++) {
	      var activity = activities[i];
	      var to = activity.to || [];
	      var signedTo = [];
	      for (var j = 0; j < to.length; j++) {
	        var feedId = to[j];
	        var feedSlug = feedId.split(':')[0];
	        var userId = feedId.split(':')[1];
	        var token = this.feed(feedSlug, userId).token;
	        var signedFeed = feedId + ' ' + token;
	        signedTo.push(signedFeed);
	      }

	      activity.to = signedTo;
	    }

	    return activities;
	  },

	  getFayeAuthorization: function getFayeAuthorization() {
	    /**
	     * Get the authorization middleware to use Faye with getstream.io
	     * @method getFayeAuthorization
	     * @memberof StreamClient.prototype
	     * @private
	     * @return {object} Faye authorization middleware
	     */
	    var apiKey = this.apiKey,
	        self = this;

	    return {
	      incoming: function incoming(message, callback) {
	        callback(message);
	      },

	      outgoing: function outgoing(message, callback) {
	        if (message.subscription && self.subscriptions[message.subscription]) {
	          var subscription = self.subscriptions[message.subscription];

	          message.ext = {
	            'user_id': subscription.userId,
	            'api_key': apiKey,
	            'signature': subscription.token
	          };
	        }

	        callback(message);
	      }
	    };
	  },

	  getFayeClient: function getFayeClient() {
	    /**
	     * Returns this client's current Faye client
	     * @method getFayeClient
	     * @memberof StreamClient.prototype
	     * @private
	     * @return {object} Faye client
	     */
	    var Faye = __webpack_require__(12);
	    if (this.fayeClient === null) {
	      this.fayeClient = new Faye.Client(this.fayeUrl);
	      var authExtension = this.getFayeAuthorization();
	      this.fayeClient.addExtension(authExtension);
	    }

	    return this.fayeClient;
	  },

	  get: function get(kwargs, cb) {
	    /**
	     * Shorthand function for get request
	     * @method get
	     * @memberof StreamClient.prototype
	     * @private
	     * @param  {object}   kwargs
	     * @param  {requestCallback} cb     Callback to call on completion
	     * @return {Promise}                Promise object
	     */
	    return new Promise((function (fulfill, reject) {
	      this.send('request', 'get', kwargs, cb);
	      kwargs = this.enrichKwargs(kwargs);
	      kwargs.method = 'GET';
	      var callback = this.wrapPromiseTask(cb, fulfill, reject);
	      request(kwargs, callback);
	    }).bind(this));
	  },

	  post: function post(kwargs, cb) {
	    /**
	     * Shorthand function for post request
	     * @method post
	     * @memberof StreamClient.prototype
	     * @private
	     * @param  {object}   kwargs
	     * @param  {requestCallback} cb     Callback to call on completion
	     * @return {Promise}                Promise object
	     */
	    return new Promise((function (fulfill, reject) {
	      this.send('request', 'post', kwargs, cb);
	      kwargs = this.enrichKwargs(kwargs);
	      kwargs.method = 'POST';
	      var callback = this.wrapPromiseTask(cb, fulfill, reject);
	      request(kwargs, callback);
	    }).bind(this));
	  },

	  'delete': function _delete(kwargs, cb) {
	    /**
	     * Shorthand function for delete request
	     * @method delete
	     * @memberof StreamClient.prototype
	     * @private
	     * @param  {object}   kwargs
	     * @param  {requestCallback} cb     Callback to call on completion
	     * @return {Promise}                Promise object
	     */
	    return new Promise((function (fulfill, reject) {
	      this.send('request', 'delete', kwargs, cb);
	      kwargs = this.enrichKwargs(kwargs);
	      kwargs.method = 'DELETE';
	      var callback = this.wrapPromiseTask(cb, fulfill, reject);
	      request(kwargs, callback);
	    }).bind(this));
	  },

	  updateActivities: function updateActivities(activities, callback) {
	    /**
	     * Updates all supplied activities on the getstream-io api
	     * @since  3.1.0
	     * @param  {array} activities list of activities to update
	     * @return {Promise}
	     */
	    if (!(activities instanceof Array)) {
	      throw new TypeError('The activities argument should be an Array');
	    }

	    var authToken = signing.JWTScopeToken(this.apiSecret, 'activities', '*', { feedId: '*', expireTokens: this.expireTokens });

	    var data = {
	      activities: activities
	    };

	    return this.post({
	      url: 'activities/',
	      body: data,
	      signature: authToken
	    }, callback);
	  },

	  updateActivity: function updateActivity(activity) {
	    /**
	     * Updates one activity on the getstream-io api
	     * @since  3.1.0
	     * @param  {object} activity The activity to update
	     * @return {Promise}          
	     */
	    return this.updateActivities([activity]);
	  }

	};

	if (qs) {
	  StreamClient.prototype.createRedirectUrl = function (targetUrl, userId, events) {
	    /**
	     * Creates a redirect url for tracking the given events in the context of
	     * an email using Stream's analytics platform. Learn more at
	     * getstream.io/personalization
	     * @method createRedirectUrl
	     * @memberof StreamClient.prototype
	     * @param  {string} targetUrl Target url
	     * @param  {string} userId    User id to track
	     * @param  {array} events     List of events to track
	     * @return {string}           The redirect url
	     */
	    var url = __webpack_require__(15);
	    var uri = url.parse(targetUrl);

	    if (!(uri.host || uri.hostname && uri.port) && !uri.isUnix) {
	      throw new errors.MissingSchemaError('Invalid URI: "' + url.format(uri) + '"');
	    }

	    var authToken = signing.JWTScopeToken(this.apiSecret, 'redirect_and_track', '*', { userId: userId, expireTokens: this.expireTokens });
	    var analyticsUrl = this.baseAnalyticsUrl + 'redirect/';
	    var kwargs = {
	      'auth_type': 'jwt',
	      'authorization': authToken,
	      'url': targetUrl,
	      'api_key': this.apiKey,
	      'events': JSON.stringify(events)
	    };

	    var qString = utils.rfc3986(qs.stringify(kwargs, null, null, {}));

	    return analyticsUrl + '?' + qString;
	  };
	}

	// If we are in a node environment and batchOperations is available add the methods to the prototype of StreamClient
	if (BatchOperations) {
	  for (var key in BatchOperations) {
	    if (BatchOperations.hasOwnProperty(key)) {
	      StreamClient.prototype[key] = BatchOperations[key];
	    }
	  }
	}

	module.exports = StreamClient;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// Browser Request
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//     http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	var XHR = XMLHttpRequest
	if (!XHR) throw new Error('missing XMLHttpRequest')
	request.log = {
	  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
	}

	var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

	//
	// request
	//

	function request(options, callback) {
	  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
	  if(typeof callback !== 'function')
	    throw new Error('Bad callback given: ' + callback)

	  if(!options)
	    throw new Error('No options given')

	  var options_onResponse = options.onResponse; // Save this for later.

	  if(typeof options === 'string')
	    options = {'uri':options};
	  else
	    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

	  options.onResponse = options_onResponse // And put it back.

	  if (options.verbose) request.log = getLogger();

	  if(options.url) {
	    options.uri = options.url;
	    delete options.url;
	  }

	  if(!options.uri && options.uri !== "")
	    throw new Error("options.uri is a required argument");

	  if(typeof options.uri != "string")
	    throw new Error("options.uri must be a string");

	  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
	  for (var i = 0; i < unsupported_options.length; i++)
	    if(options[ unsupported_options[i] ])
	      throw new Error("options." + unsupported_options[i] + " is not supported")

	  options.callback = callback
	  options.method = options.method || 'GET';
	  options.headers = options.headers || {};
	  options.body    = options.body || null
	  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

	  if(options.headers.host)
	    throw new Error("Options.headers.host is not supported");

	  if(options.json) {
	    options.headers.accept = options.headers.accept || 'application/json'
	    if(options.method !== 'GET')
	      options.headers['content-type'] = 'application/json'

	    if(typeof options.json !== 'boolean')
	      options.body = JSON.stringify(options.json)
	    else if(typeof options.body !== 'string')
	      options.body = JSON.stringify(options.body)
	  }
	  
	  //BEGIN QS Hack
	  var serialize = function(obj) {
	    var str = [];
	    for(var p in obj)
	      if (obj.hasOwnProperty(p)) {
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	      }
	    return str.join("&");
	  }
	  
	  if(options.qs){
	    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
	    if(options.uri.indexOf('?') !== -1){ //no get params
	        options.uri = options.uri+'&'+qs;
	    }else{ //existing get params
	        options.uri = options.uri+'?'+qs;
	    }
	  }
	  //END QS Hack
	  
	  //BEGIN FORM Hack
	  var multipart = function(obj) {
	    //todo: support file type (useful?)
	    var result = {};
	    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
	    var lines = [];
	    for(var p in obj){
	        if (obj.hasOwnProperty(p)) {
	            lines.push(
	                '--'+result.boundry+"\n"+
	                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
	                "\n"+
	                obj[p]+"\n"
	            );
	        }
	    }
	    lines.push( '--'+result.boundry+'--' );
	    result.body = lines.join('');
	    result.length = result.body.length;
	    result.type = 'multipart/form-data; boundary='+result.boundry;
	    return result;
	  }
	  
	  if(options.form){
	    if(typeof options.form == 'string') throw('form name unsupported');
	    if(options.method === 'POST'){
	        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
	        options.headers['content-type'] = encoding;
	        switch(encoding){
	            case 'application/x-www-form-urlencoded':
	                options.body = serialize(options.form).replace(/%20/g, "+");
	                break;
	            case 'multipart/form-data':
	                var multi = multipart(options.form);
	                //options.headers['content-length'] = multi.length;
	                options.body = multi.body;
	                options.headers['content-type'] = multi.type;
	                break;
	            default : throw new Error('unsupported encoding:'+encoding);
	        }
	    }
	  }
	  //END FORM Hack

	  // If onResponse is boolean true, call back immediately when the response is known,
	  // not when the full request is complete.
	  options.onResponse = options.onResponse || noop
	  if(options.onResponse === true) {
	    options.onResponse = callback
	    options.callback = noop
	  }

	  // XXX Browsers do not like this.
	  //if(options.body)
	  //  options.headers['content-length'] = options.body.length;

	  // HTTP basic authentication
	  if(!options.headers.authorization && options.auth)
	    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

	  return run_xhr(options)
	}

	var req_seq = 0
	function run_xhr(options) {
	  var xhr = new XHR
	    , timed_out = false
	    , is_cors = is_crossDomain(options.uri)
	    , supports_cors = ('withCredentials' in xhr)

	  req_seq += 1
	  xhr.seq_id = req_seq
	  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
	  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

	  if(is_cors && !supports_cors) {
	    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
	    cors_err.cors = 'unsupported'
	    return options.callback(cors_err, xhr)
	  }

	  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
	  function too_late() {
	    timed_out = true
	    var er = new Error('ETIMEDOUT')
	    er.code = 'ETIMEDOUT'
	    er.duration = options.timeout

	    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
	    return options.callback(er, xhr)
	  }

	  // Some states can be skipped over, so remember what is still incomplete.
	  var did = {'response':false, 'loading':false, 'end':false}

	  xhr.onreadystatechange = on_state_change
	  xhr.open(options.method, options.uri, true) // asynchronous
	  if(is_cors)
	    xhr.withCredentials = !! options.withCredentials

	  for (var key in options.headers)
	    xhr.setRequestHeader(key, options.headers[key])

	  xhr.send(options.body)
	  return xhr

	  function on_state_change(event) {
	    if(timed_out)
	      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

	    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

	    if(xhr.readyState === XHR.OPENED) {
	      request.log.debug('Request started', {'id':xhr.id})
	    }

	    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
	      on_response()

	    else if(xhr.readyState === XHR.LOADING) {
	      on_response()
	      on_loading()
	    }

	    else if(xhr.readyState === XHR.DONE) {
	      on_response()
	      on_loading()
	      on_end()
	    }
	  }

	  function on_response() {
	    if(did.response)
	      return

	    did.response = true
	    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
	    clearTimeout(xhr.timeoutTimer)
	    xhr.statusCode = xhr.status // Node request compatibility

	    // Detect failed CORS requests.
	    if(is_cors && xhr.statusCode == 0) {
	      var cors_err = new Error('CORS request rejected: ' + options.uri)
	      cors_err.cors = 'rejected'

	      // Do not process this request further.
	      did.loading = true
	      did.end = true

	      return options.callback(cors_err, xhr)
	    }

	    options.onResponse(null, xhr)
	  }

	  function on_loading() {
	    if(did.loading)
	      return

	    did.loading = true
	    request.log.debug('Response body loading', {'id':xhr.id})
	    // TODO: Maybe simulate "data" events by watching xhr.responseText
	  }

	  function on_end() {
	    if(did.end)
	      return

	    did.end = true
	    request.log.debug('Request done', {'id':xhr.id})

	    xhr.body = xhr.responseText
	    if(options.json) {
	      try        { xhr.body = JSON.parse(xhr.responseText) }
	      catch (er) { return options.callback(er, xhr)        }
	    }

	    options.callback(null, xhr, xhr.body)
	  }

	} // request

	request.withCredentials = false;
	request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

	//
	// defaults
	//

	request.defaults = function(options, requester) {
	  var def = function (method) {
	    var d = function (params, callback) {
	      if(typeof params === 'string')
	        params = {'uri': params};
	      else {
	        params = JSON.parse(JSON.stringify(params));
	      }
	      for (var i in options) {
	        if (params[i] === undefined) params[i] = options[i]
	      }
	      return method(params, callback)
	    }
	    return d
	  }
	  var de = def(request)
	  de.get = def(request.get)
	  de.post = def(request.post)
	  de.put = def(request.put)
	  de.head = def(request.head)
	  return de
	}

	//
	// HTTP method shortcuts
	//

	var shortcuts = [ 'get', 'put', 'post', 'head' ];
	shortcuts.forEach(function(shortcut) {
	  var method = shortcut.toUpperCase();
	  var func   = shortcut.toLowerCase();

	  request[func] = function(opts) {
	    if(typeof opts === 'string')
	      opts = {'method':method, 'uri':opts};
	    else {
	      opts = JSON.parse(JSON.stringify(opts));
	      opts.method = method;
	    }

	    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
	    return request.apply(this, args);
	  }
	})

	//
	// CouchDB shortcut
	//

	request.couch = function(options, callback) {
	  if(typeof options === 'string')
	    options = {'uri':options}

	  // Just use the request API to do JSON.
	  options.json = true
	  if(options.body)
	    options.json = options.body
	  delete options.body

	  callback = callback || noop

	  var xhr = request(options, couch_handler)
	  return xhr

	  function couch_handler(er, resp, body) {
	    if(er)
	      return callback(er, resp, body)

	    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
	      // The body is a Couch JSON object indicating the error.
	      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
	      for (var key in body)
	        er[key] = body[key]
	      return callback(er, resp, body);
	    }

	    return callback(er, resp, body);
	  }
	}

	//
	// Utility
	//

	function noop() {}

	function getLogger() {
	  var logger = {}
	    , levels = ['trace', 'debug', 'info', 'warn', 'error']
	    , level, i

	  for(i = 0; i < levels.length; i++) {
	    level = levels[i]

	    logger[level] = noop
	    if(typeof console !== 'undefined' && console && console[level])
	      logger[level] = formatted(console, level)
	  }

	  return logger
	}

	function formatted(obj, method) {
	  return formatted_logger

	  function formatted_logger(str, context) {
	    if(typeof context === 'object')
	      str += ' ' + JSON.stringify(context)

	    return obj[method].call(obj, str)
	  }
	}

	// Return whether a URL is a cross-domain request.
	function is_crossDomain(url) {
	  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

	  // jQuery #8138, IE may throw an exception when accessing
	  // a field from window.location if document.domain has been set
	  var ajaxLocation
	  try { ajaxLocation = location.href }
	  catch (e) {
	    // Use the href attribute of an A element since IE will modify it given document.location
	    ajaxLocation = document.createElement( "a" );
	    ajaxLocation.href = "";
	    ajaxLocation = ajaxLocation.href;
	  }

	  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
	    , parts = rurl.exec(url.toLowerCase() )

	  var result = !!(
	    parts &&
	    (  parts[1] != ajaxLocParts[1]
	    || parts[2] != ajaxLocParts[2]
	    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
	    )
	  )

	  //console.debug('is_crossDomain('+url+') -> ' + result)
	  return result
	}

	// MIT License from http://phpjs.org/functions/base64_encode:358
	function b64_enc (data) {
	    // Encodes string using MIME base64 algorithm
	    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

	    if (!data) {
	        return data;
	    }

	    // assume utf8 data
	    // data = this.utf8_encode(data+'');

	    do { // pack three octets into four hexets
	        o1 = data.charCodeAt(i++);
	        o2 = data.charCodeAt(i++);
	        o3 = data.charCodeAt(i++);

	        bits = o1<<16 | o2<<8 | o3;

	        h1 = bits>>18 & 0x3f;
	        h2 = bits>>12 & 0x3f;
	        h3 = bits>>6 & 0x3f;
	        h4 = bits & 0x3f;

	        // use hexets to index into b64, and append result to encoded string
	        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	    } while (i < data.length);

	    enc = tmp_arr.join('');

	    switch (data.length % 3) {
	        case 1:
	            enc = enc.slice(0, -2) + '==';
	        break;
	        case 2:
	            enc = enc.slice(0, -1) + '=';
	        break;
	    }

	    return enc;
	}
	module.exports = request;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var errors = __webpack_require__(5);
	var utils = __webpack_require__(6);

	var StreamFeed = function StreamFeed() {
	  /**
	   * Manage api calls for specific feeds
	   * The feed object contains convenience functions such add activity, remove activity etc
	   * @class StreamFeed
	   */
	  this.initialize.apply(this, arguments);
	};

	StreamFeed.prototype = {
	  initialize: function initialize(client, feedSlug, userId, token) {
	    /**
	     * Initialize a feed object
	     * @method intialize
	     * @memberof StreamFeed.prototype
	     * @param {StreamClient} client - The stream client this feed is constructed from
	     * @param {string} feedSlug - The feed slug
	     * @param {string} userId - The user id
	     * @param {string} [token] - The authentication token
	     */
	    this.client = client;
	    this.slug = feedSlug;
	    this.userId = userId;
	    this.id = this.slug + ':' + this.userId;
	    this.token = token;

	    this.feedUrl = this.id.replace(':', '/');
	    this.feedTogether = this.id.replace(':', '');
	    this.signature = this.feedTogether + ' ' + this.token;

	    // faye setup
	    this.notificationChannel = 'site-' + this.client.appId + '-feed-' + this.feedTogether;
	  },

	  addActivity: function addActivity(activity, callback) {
	    /**
	     * Adds the given activity to the feed and
	     * calls the specified callback
	     * @method addActivity
	     * @memberof StreamFeed.prototype
	     * @param {object} activity - The activity to add
	     * @param {requestCallback} callback - Callback to call on completion
	     * @return {Promise} Promise object
	     */
	    activity = this.client.signActivity(activity);

	    return this.client.post({
	      url: 'feed/' + this.feedUrl + '/',
	      body: activity,
	      signature: this.signature
	    }, callback);
	  },

	  removeActivity: function removeActivity(activityId, callback) {
	    /**
	     * Removes the activity by activityId
	     * @method removeActivity
	     * @memberof StreamFeed.prototype
	     * @param  {string}   activityId Identifier of activity to remove
	     * @param  {requestCallback} callback   Callback to call on completion
	     * @return {Promise} Promise object
	     * @example
	     * feed.removeActivity(activityId);
	     * @example
	     * feed.removeActivity({'foreign_id': foreignId});
	     */
	    var identifier = activityId.foreignId ? activityId.foreignId : activityId;
	    var params = {};
	    if (activityId.foreignId) {
	      params['foreign_id'] = '1';
	    }

	    return this.client['delete']({
	      url: 'feed/' + this.feedUrl + '/' + identifier + '/',
	      qs: params,
	      signature: this.signature
	    }, callback);
	  },

	  addActivities: function addActivities(activities, callback) {
	    /**
	     * Adds the given activities to the feed and calls the specified callback
	     * @method addActivities
	     * @memberof StreamFeed.prototype
	     * @param  {Array}   activities Array of activities to add
	     * @param  {requestCallback} callback   Callback to call on completion
	     * @return {Promise}               XHR request object
	     */
	    activities = this.client.signActivities(activities);
	    var data = {
	      activities: activities
	    };
	    var xhr = this.client.post({
	      url: 'feed/' + this.feedUrl + '/',
	      body: data,
	      signature: this.signature
	    }, callback);
	    return xhr;
	  },

	  follow: function follow(targetSlug, targetUserId, options, callback) {
	    /**
	     * Follows the given target feed
	     * @method follow
	     * @memberof StreamFeed.prototype
	     * @param  {string}   targetSlug   Slug of the target feed
	     * @param  {string}   targetUserId User identifier of the target feed
	     * @param  {object}   options      Additional options
	     * @param  {number}   options.activityCopyLimit Limit the amount of activities copied over on follow
	     * @param  {requestCallback} callback     Callback to call on completion
	     * @return {Promise}  Promise object
	     * @example feed.follow('user', '1');
	     * @example feed.follow('user', '1', callback);
	     * @example feed.follow('user', '1', options, callback);
	     */
	    utils.validateFeedSlug(targetSlug);
	    utils.validateUserId(targetUserId);

	    var activityCopyLimit;
	    var last = arguments[arguments.length - 1];
	    // callback is always the last argument
	    callback = last.call ? last : undefined;
	    var target = targetSlug + ':' + targetUserId;

	    // check for additional options
	    if (options && !options.call) {
	      if (options.limit) {
	        activityCopyLimit = options.limit;
	      }
	    }

	    var body = {
	      target: target
	    };

	    if (activityCopyLimit) {
	      body['activity_copy_limit'] = activityCopyLimit;
	    }

	    return this.client.post({
	      url: 'feed/' + this.feedUrl + '/following/',
	      body: body,
	      signature: this.signature
	    }, callback);
	  },

	  unfollow: function unfollow(targetSlug, targetUserId, callback) {
	    /**
	     * Unfollow the given feed
	     * @method unfollow
	     * @memberof StreamFeed.prototype
	     * @param  {string}   targetSlug   Slug of the target feed
	     * @param  {string}   targetUserId [description]
	     * @param  {requestCallback} callback     Callback to call on completion
	     * @return {object}                XHR request object
	     * @example feed.unfollow('user', '2', callback);
	     */
	    utils.validateFeedSlug(targetSlug);
	    utils.validateUserId(targetUserId);
	    var targetFeedId = targetSlug + ':' + targetUserId;
	    var xhr = this.client['delete']({
	      url: 'feed/' + this.feedUrl + '/following/' + targetFeedId + '/',
	      signature: this.signature
	    }, callback);
	    return xhr;
	  },

	  following: function following(options, callback) {
	    /**
	     * List which feeds this feed is following
	     * @method following
	     * @memberof StreamFeed.prototype
	     * @param  {object}   options  Additional options
	     * @param  {string}   options.filter Filter to apply on search operation
	     * @param  {requestCallback} callback Callback to call on completion
	     * @return {Promise} Promise object
	     * @example feed.following({limit:10, filter: ['user:1', 'user:2']}, callback);
	     */
	    if (options !== undefined && options.filter) {
	      options.filter = options.filter.join(',');
	    }

	    return this.client.get({
	      url: 'feed/' + this.feedUrl + '/following/',
	      qs: options,
	      signature: this.signature
	    }, callback);
	  },

	  followers: function followers(options, callback) {
	    /**
	     * List the followers of this feed
	     * @method followers
	     * @memberof StreamFeed.prototype
	     * @param  {object}   options  Additional options
	     * @param  {string}   options.filter Filter to apply on search operation
	     * @param  {requestCallback} callback Callback to call on completion
	     * @return {Promise} Promise object
	     * @example
	     * feed.followers({limit:10, filter: ['user:1', 'user:2']}, callback);
	     */
	    if (options !== undefined && options.filter) {
	      options.filter = options.filter.join(',');
	    }

	    return this.client.get({
	      url: 'feed/' + this.feedUrl + '/followers/',
	      qs: options,
	      signature: this.signature
	    }, callback);
	  },

	  get: function get(options, callback) {
	    /**
	     * Reads the feed
	     * @method get
	     * @memberof StreamFeed.prototype
	     * @param  {object}   options  Additional options
	     * @param  {requestCallback} callback Callback to call on completion
	     * @return {Promise} Promise object
	     * @example feed.get({limit: 10, id_lte: 'activity-id'})
	     * @example feed.get({limit: 10, mark_seen: true})
	     */
	    if (options && options['mark_read'] && options['mark_read'].join) {
	      options['mark_read'] = options['mark_read'].join(',');
	    }

	    if (options && options['mark_seen'] && options['mark_seen'].join) {
	      options['mark_seen'] = options['mark_seen'].join(',');
	    }

	    return this.client.get({
	      url: 'feed/' + this.feedUrl + '/',
	      qs: options,
	      signature: this.signature
	    }, callback);
	  },

	  getFayeClient: function getFayeClient() {
	    /**
	     * Returns the current faye client object
	     * @method getFayeClient
	     * @memberof StreamFeed.prototype
	     * @access private
	     * @return {object} Faye client
	     */
	    return this.client.getFayeClient();
	  },

	  subscribe: function subscribe(callback) {
	    /**
	     * Subscribes to any changes in the feed, return a promise
	     * @method subscribe
	     * @memberof StreamFeed.prototype
	     * @param  {function} callback Callback to call on completion
	     * @return {Promise}           Promise object
	     * @example
	     * feed.subscribe(callback).then(function(){
	     * 		console.log('we are now listening to changes');
	     * });
	     */
	    if (!this.client.appId) {
	      throw new errors.SiteError('Missing app id, which is needed to subscribe, use var client = stream.connect(key, secret, appId);');
	    }

	    this.client.subscriptions['/' + this.notificationChannel] = {
	      token: this.token,
	      userId: this.notificationChannel
	    };

	    return this.getFayeClient().subscribe('/' + this.notificationChannel, callback);
	  }
	};

	module.exports = StreamFeed;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var errors = module.exports;

	var canCapture = typeof Error.captureStackTrace === 'function';
	var canStack = !!new Error().stack;

	/**
	 * Abstract error object
	 * @class ErrorAbstract
	 * @access private
	 * @param  {string}      [msg]         Error message
	 * @param  {function}    constructor
	 */
	function ErrorAbstract(msg, constructor) {
	  this.message = msg;

	  Error.call(this, this.message);

	  if (canCapture) {
	    Error.captureStackTrace(this, constructor);
	  } else if (canStack) {
	    this.stack = new Error().stack;
	  } else {
	    this.stack = '';
	  }
	}

	errors._Abstract = ErrorAbstract;
	ErrorAbstract.prototype = new Error();

	/**
	 * FeedError
	 * @class FeedError
	 * @access private
	 * @extends ErrorAbstract
	 * @memberof Stream.errors
	 * @param {String} [msg] - An error message that will probably end up in a log.
	 */
	errors.FeedError = function FeedError(msg) {
	  ErrorAbstract.call(this, msg);
	};

	errors.FeedError.prototype = new ErrorAbstract();

	/**
	 * SiteError
	 * @class SiteError
	 * @access private
	 * @extends ErrorAbstract
	 * @memberof Stream.errors
	 * @param  {string}  [msg]  An error message that will probably end up in a log.
	 */
	errors.SiteError = function SiteError(msg) {
	  ErrorAbstract.call(this, msg);
	};

	errors.SiteError.prototype = new ErrorAbstract();

	/**
	 * MissingSchemaError
	 * @method MissingSchema
	 * @access private
	 * @extends ErrorAbstract
	 * @memberof Stream.errors
	 * @param  {string} msg
	 */
	errors.MissingSchemaError = function MissingSchemaError(msg) {
	  ErrorAbstract.call(this, msg);
	};

	errors.MissingSchemaError.prototype = new ErrorAbstract();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var errors = __webpack_require__(5);
	var validRe = /^[\w-]+$/;

	function validateFeedId(feedId) {
	  /*
	  	 * Validate that the feedId matches the spec user:1
	  	 */
	  var parts = feedId.split(':');
	  if (parts.length !== 2) {
	    throw new errors.FeedError('Invalid feedId, expected something like user:1 got ' + feedId);
	  }

	  var feedSlug = parts[0];
	  var userId = parts[1];
	  validateFeedSlug(feedSlug);
	  validateUserId(userId);
	  return feedId;
	}

	exports.validateFeedId = validateFeedId;

	function validateFeedSlug(feedSlug) {
	  /*
	  	 * Validate that the feedSlug matches \w
	  	 */
	  var valid = validRe.test(feedSlug);
	  if (!valid) {
	    throw new errors.FeedError('Invalid feedSlug, please use letters, numbers or _ got: ' + feedSlug);
	  }

	  return feedSlug;
	}

	exports.validateFeedSlug = validateFeedSlug;

	function validateUserId(userId) {
	  /*
	  	 * Validate the userId matches \w
	  	 */
	  var valid = validRe.test(userId);
	  if (!valid) {
	    throw new errors.FeedError('Invalid feedSlug, please use letters, numbers or _ got: ' + userId);
	  }

	  return userId;
	}

	exports.validateUserId = validateUserId;

	function rfc3986(str) {
	  return str.replace(/[!'()*]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	  });
	}

	exports.rfc3986 = rfc3986;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var crypto = __webpack_require__(8);
	var jwt = __webpack_require__(9);
	var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
	var Base64 = __webpack_require__(10);

	function makeUrlSafe(s) {
	  /*
	   * Makes the given base64 encoded string urlsafe
	   */
	  var escaped = s.replace(/\+/g, '-').replace(/\//g, '_');
	  return escaped.replace(/^=+/, '').replace(/=+$/, '');
	}

	function decodeBase64Url(base64UrlString) {
	  try {
	    return Base64.atob(toBase64(base64UrlString));
	  } catch (e) {
	    if (e.name === 'InvalidCharacterError') {
	      return undefined;
	    } else {
	      throw e;
	    }
	  }
	}

	function safeJsonParse(thing) {
	  if (typeof thing === 'object') return thing;
	  try {
	    return JSON.parse(thing);
	  } catch (e) {
	    return undefined;
	  }
	}

	function padString(string) {
	  var segmentLength = 4;
	  var diff = string.length % segmentLength;
	  if (!diff) return string;
	  var padLength = segmentLength - diff;

	  while (padLength--) string += '=';
	  return string;
	}

	function toBase64(base64UrlString) {
	  var b64str = padString(base64UrlString).replace(/\-/g, '+').replace(/_/g, '/');
	  return b64str;
	}

	function headerFromJWS(jwsSig) {
	  var encodedHeader = jwsSig.split('.', 1)[0];
	  return safeJsonParse(decodeBase64Url(encodedHeader));
	}

	exports.headerFromJWS = headerFromJWS;

	exports.sign = function (apiSecret, feedId) {
	  /*
	   * Setup sha1 based on the secret
	   * Get the digest of the value
	   * Base64 encode the result
	   *
	   * Also see
	   * https://github.com/tbarbugli/stream-ruby/blob/master/lib/stream/signer.rb
	   * https://github.com/tschellenbach/stream-python/blob/master/stream/signing.py
	   *
	   * Steps
	   * apiSecret: tfq2sdqpj9g446sbv653x3aqmgn33hsn8uzdc9jpskaw8mj6vsnhzswuwptuj9su
	   * feedId: flat1
	   * digest: Q\xb6\xd5+\x82\xd58\xdeu\x80\xc5\xe3\xb8\xa5bL1\xf1\xa3\xdb
	   * token: UbbVK4LVON51gMXjuKViTDHxo9s
	   */
	  var hashedSecret = new crypto.createHash('sha1').update(apiSecret).digest();
	  var hmac = crypto.createHmac('sha1', hashedSecret);
	  var digest = hmac.update(feedId).digest('base64');
	  var token = makeUrlSafe(digest);
	  return token;
	};

	exports.JWTScopeToken = function (apiSecret, resource, action, opts) {
	  /**
	   * Creates the JWT token for feedId, resource and action using the apiSecret
	   * @method JWTScopeToken
	   * @memberof signing
	   * @private
	   * @param {string} apiSecret - API Secret key
	   * @param {string} resource - JWT payload resource
	   * @param {string} action - JWT payload action
	   * @param {object} [options] - Optional additional options
	   * @param {string} [options.feedId] - JWT payload feed identifier
	   * @param {string} [options.userId] - JWT payload user identifier
	   * @return {string} JWT Token
	   */
	  var options = opts || {},
	      noTimestamp = options.expireTokens ? !options.expireTokens : true;
	  var payload = {
	    resource: resource,
	    action: action
	  };

	  if (options.feedId) {
	    payload['feed_id'] = options.feedId;
	  }

	  if (options.userId) {
	    payload['user_id'] = options.userId;
	  }

	  var token = jwt.sign(payload, apiSecret, { algorithm: 'HS256', noTimestamp: noTimestamp });
	  return token;
	};

	exports.isJWTSignature = function (signature) {
	  /**
	   * check if token is a valid JWT token
	   * @method isJWTSignature
	   * @memberof signing
	   * @private
	   * @param {string} signature - Signature to check
	   * @return {boolean}
	   */
	  var token = signature.split(' ')[1] || signature;
	  return JWS_REGEX.test(token) && !!headerFromJWS(token);
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	;(function () {

	  var object =  true ? exports : this; // #8: web workers
	  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	  function InvalidCharacterError(message) {
	    this.message = message;
	  }
	  InvalidCharacterError.prototype = new Error;
	  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	  // encoder
	  // [https://gist.github.com/999166] by [https://github.com/nignag]
	  object.btoa || (
	  object.btoa = function (input) {
	    var str = String(input);
	    for (
	      // initialize result and counter
	      var block, charCode, idx = 0, map = chars, output = '';
	      // if the next str index does not exist:
	      //   change the mapping table to "="
	      //   check if d has no fractional digits
	      str.charAt(idx | 0) || (map = '=', idx % 1);
	      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	    ) {
	      charCode = str.charCodeAt(idx += 3/4);
	      if (charCode > 0xFF) {
	        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
	      }
	      block = block << 8 | charCode;
	    }
	    return output;
	  });

	  // decoder
	  // [https://gist.github.com/1020396] by [https://github.com/atk]
	  object.atob || (
	  object.atob = function (input) {
	    var str = String(input).replace(/=+$/, '');
	    if (str.length % 4 == 1) {
	      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
	    }
	    for (
	      // initialize result and counters
	      var bc = 0, bs, buffer, idx = 0, output = '';
	      // get next character
	      buffer = str.charAt(idx++);
	      // character found in table? initialize bit storage and add its ascii value;
	      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
	        // and if not first of each 4 characters,
	        // convert the first 8 bits to one ascii character
	        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
	    ) {
	      // try to find character in table (0-63, not found => -1)
	      buffer = chars.indexOf(buffer);
	    }
	    return output;
	  });

	}());


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(12).Promise;

	Promise.prototype['catch'] = function (onRejected) {
	  return this.then(null, onRejected);
	};

	module.exports = Promise;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate, process) {(function() {
	'use strict';

	var Faye = {
	  VERSION:          '1.1.2',

	  BAYEUX_VERSION:   '1.0',
	  ID_LENGTH:        160,
	  JSONP_CALLBACK:   'jsonpcallback',
	  CONNECTION_TYPES: ['long-polling', 'cross-origin-long-polling', 'callback-polling', 'websocket', 'eventsource', 'in-process'],

	  MANDATORY_CONNECTION_TYPES: ['long-polling', 'callback-polling', 'in-process'],

	  ENV: (typeof window !== 'undefined') ? window : global,

	  extend: function(dest, source, overwrite) {
	    if (!source) return dest;
	    for (var key in source) {
	      if (!source.hasOwnProperty(key)) continue;
	      if (dest.hasOwnProperty(key) && overwrite === false) continue;
	      if (dest[key] !== source[key])
	        dest[key] = source[key];
	    }
	    return dest;
	  },

	  random: function(bitlength) {
	    bitlength = bitlength || this.ID_LENGTH;
	    var maxLength = Math.ceil(bitlength * Math.log(2) / Math.log(36));
	    var string = csprng(bitlength, 36);
	    while (string.length < maxLength) string = '0' + string;
	    return string;
	  },

	  validateOptions: function(options, validKeys) {
	    for (var key in options) {
	      if (this.indexOf(validKeys, key) < 0)
	        throw new Error('Unrecognized option: ' + key);
	    }
	  },

	  clientIdFromMessages: function(messages) {
	    var connect = this.filter([].concat(messages), function(message) {
	      return message.channel === '/meta/connect';
	    });
	    return connect[0] && connect[0].clientId;
	  },

	  copyObject: function(object) {
	    var clone, i, key;
	    if (object instanceof Array) {
	      clone = [];
	      i = object.length;
	      while (i--) clone[i] = Faye.copyObject(object[i]);
	      return clone;
	    } else if (typeof object === 'object') {
	      clone = (object === null) ? null : {};
	      for (key in object) clone[key] = Faye.copyObject(object[key]);
	      return clone;
	    } else {
	      return object;
	    }
	  },

	  commonElement: function(lista, listb) {
	    for (var i = 0, n = lista.length; i < n; i++) {
	      if (this.indexOf(listb, lista[i]) !== -1)
	        return lista[i];
	    }
	    return null;
	  },

	  indexOf: function(list, needle) {
	    if (list.indexOf) return list.indexOf(needle);

	    for (var i = 0, n = list.length; i < n; i++) {
	      if (list[i] === needle) return i;
	    }
	    return -1;
	  },

	  map: function(object, callback, context) {
	    if (object.map) return object.map(callback, context);
	    var result = [];

	    if (object instanceof Array) {
	      for (var i = 0, n = object.length; i < n; i++) {
	        result.push(callback.call(context || null, object[i], i));
	      }
	    } else {
	      for (var key in object) {
	        if (!object.hasOwnProperty(key)) continue;
	        result.push(callback.call(context || null, key, object[key]));
	      }
	    }
	    return result;
	  },

	  filter: function(array, callback, context) {
	    if (array.filter) return array.filter(callback, context);
	    var result = [];
	    for (var i = 0, n = array.length; i < n; i++) {
	      if (callback.call(context || null, array[i], i))
	        result.push(array[i]);
	    }
	    return result;
	  },

	  asyncEach: function(list, iterator, callback, context) {
	    var n       = list.length,
	        i       = -1,
	        calls   = 0,
	        looping = false;

	    var iterate = function() {
	      calls -= 1;
	      i += 1;
	      if (i === n) return callback && callback.call(context);
	      iterator(list[i], resume);
	    };

	    var loop = function() {
	      if (looping) return;
	      looping = true;
	      while (calls > 0) iterate();
	      looping = false;
	    };

	    var resume = function() {
	      calls += 1;
	      loop();
	    };
	    resume();
	  },

	  // http://assanka.net/content/tech/2009/09/02/json2-js-vs-prototype/
	  toJSON: function(object) {
	    if (!this.stringify) return JSON.stringify(object);

	    return this.stringify(object, function(key, value) {
	      return (this[key] instanceof Array) ? this[key] : value;
	    });
	  }
	};

	if (true)
	  module.exports = Faye;
	else if (typeof window !== 'undefined')
	  window.Faye = Faye;

	Faye.Class = function(parent, methods) {
	  if (typeof parent !== 'function') {
	    methods = parent;
	    parent  = Object;
	  }

	  var klass = function() {
	    if (!this.initialize) return this;
	    return this.initialize.apply(this, arguments) || this;
	  };

	  var bridge = function() {};
	  bridge.prototype = parent.prototype;

	  klass.prototype = new bridge();
	  Faye.extend(klass.prototype, methods);

	  return klass;
	};

	(function() {
	var EventEmitter = Faye.EventEmitter = function() {};

	/*
	Copyright Joyent, Inc. and other Node contributors. All rights reserved.
	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	*/

	var isArray = typeof Array.isArray === 'function'
	    ? Array.isArray
	    : function (xs) {
	        return Object.prototype.toString.call(xs) === '[object Array]'
	    }
	;
	function indexOf (xs, x) {
	    if (xs.indexOf) return xs.indexOf(x);
	    for (var i = 0; i < xs.length; i++) {
	        if (x === xs[i]) return i;
	    }
	    return -1;
	}


	EventEmitter.prototype.emit = function(type) {
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events || !this._events.error ||
	        (isArray(this._events.error) && !this._events.error.length))
	    {
	      if (arguments[1] instanceof Error) {
	        throw arguments[1]; // Unhandled 'error' event
	      } else {
	        throw new Error("Uncaught, unspecified 'error' event.");
	      }
	      return false;
	    }
	  }

	  if (!this._events) return false;
	  var handler = this._events[type];
	  if (!handler) return false;

	  if (typeof handler == 'function') {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        var args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	    return true;

	  } else if (isArray(handler)) {
	    var args = Array.prototype.slice.call(arguments, 1);

	    var listeners = handler.slice();
	    for (var i = 0, l = listeners.length; i < l; i++) {
	      listeners[i].apply(this, args);
	    }
	    return true;

	  } else {
	    return false;
	  }
	};

	// EventEmitter is defined in src/node_events.cc
	// EventEmitter.prototype.emit() is also defined there.
	EventEmitter.prototype.addListener = function(type, listener) {
	  if ('function' !== typeof listener) {
	    throw new Error('addListener only takes instances of Function');
	  }

	  if (!this._events) this._events = {};

	  // To avoid recursion in the case that type == "newListeners"! Before
	  // adding it to the listeners, first emit "newListeners".
	  this.emit('newListener', type, listener);

	  if (!this._events[type]) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  } else if (isArray(this._events[type])) {
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  } else {
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  var self = this;
	  self.on(type, function g() {
	    self.removeListener(type, g);
	    listener.apply(this, arguments);
	  });

	  return this;
	};

	EventEmitter.prototype.removeListener = function(type, listener) {
	  if ('function' !== typeof listener) {
	    throw new Error('removeListener only takes instances of Function');
	  }

	  // does not use listeners(), so no side effect of creating _events[type]
	  if (!this._events || !this._events[type]) return this;

	  var list = this._events[type];

	  if (isArray(list)) {
	    var i = indexOf(list, listener);
	    if (i < 0) return this;
	    list.splice(i, 1);
	    if (list.length == 0)
	      delete this._events[type];
	  } else if (this._events[type] === listener) {
	    delete this._events[type];
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  if (arguments.length === 0) {
	    this._events = {};
	    return this;
	  }

	  // does not use listeners(), so no side effect of creating _events[type]
	  if (type && this._events && this._events[type]) this._events[type] = null;
	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  if (!this._events) this._events = {};
	  if (!this._events[type]) this._events[type] = [];
	  if (!isArray(this._events[type])) {
	    this._events[type] = [this._events[type]];
	  }
	  return this._events[type];
	};

	})();

	Faye.Namespace = Faye.Class({
	  initialize: function() {
	    this._used = {};
	  },

	  exists: function(id) {
	    return this._used.hasOwnProperty(id);
	  },

	  generate: function() {
	    var name = Faye.random();
	    while (this._used.hasOwnProperty(name))
	      name = Faye.random();
	    return this._used[name] = name;
	  },

	  release: function(id) {
	    delete this._used[id];
	  }
	});

	(function() {
	'use strict';

	var timeout = setTimeout, defer;

	if (typeof setImmediate === 'function')
	  defer = function(fn) { setImmediate(fn) };
	else if (typeof process === 'object' && process.nextTick)
	  defer = function(fn) { process.nextTick(fn) };
	else
	  defer = function(fn) { timeout(fn, 0) };

	var PENDING   = 0,
	    FULFILLED = 1,
	    REJECTED  = 2;

	var RETURN = function(x) { return x },
	    THROW  = function(x) { throw  x };

	var Promise = function(task) {
	  this._state       = PENDING;
	  this._onFulfilled = [];
	  this._onRejected  = [];

	  if (typeof task !== 'function') return;
	  var self = this;

	  task(function(value)  { fulfill(self, value) },
	       function(reason) { reject(self, reason) });
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
	  var next = new Promise();
	  registerOnFulfilled(this, onFulfilled, next);
	  registerOnRejected(this, onRejected, next);
	  return next;
	};

	var registerOnFulfilled = function(promise, onFulfilled, next) {
	  if (typeof onFulfilled !== 'function') onFulfilled = RETURN;
	  var handler = function(value) { invoke(onFulfilled, value, next) };

	  if (promise._state === PENDING) {
	    promise._onFulfilled.push(handler);
	  } else if (promise._state === FULFILLED) {
	    handler(promise._value);
	  }
	};

	var registerOnRejected = function(promise, onRejected, next) {
	  if (typeof onRejected !== 'function') onRejected = THROW;
	  var handler = function(reason) { invoke(onRejected, reason, next) };

	  if (promise._state === PENDING) {
	    promise._onRejected.push(handler);
	  } else if (promise._state === REJECTED) {
	    handler(promise._reason);
	  }
	};

	var invoke = function(fn, value, next) {
	  defer(function() { _invoke(fn, value, next) });
	};

	var _invoke = function(fn, value, next) {
	  var outcome;

	  try {
	    outcome = fn(value);
	  } catch (error) {
	    return reject(next, error);
	  }

	  if (outcome === next) {
	    reject(next, new TypeError('Recursive promise chain detected'));
	  } else {
	    fulfill(next, outcome);
	  }
	};

	var fulfill = Promise.fulfill = Promise.resolve = function(promise, value) {
	  var called = false, type, then;

	  try {
	    type = typeof value;
	    then = value !== null && (type === 'function' || type === 'object') && value.then;

	    if (typeof then !== 'function') return _fulfill(promise, value);

	    then.call(value, function(v) {
	      if (!(called ^ (called = true))) return;
	      fulfill(promise, v);
	    }, function(r) {
	      if (!(called ^ (called = true))) return;
	      reject(promise, r);
	    });
	  } catch (error) {
	    if (!(called ^ (called = true))) return;
	    reject(promise, error);
	  }
	};

	var _fulfill = function(promise, value) {
	  if (promise._state !== PENDING) return;

	  promise._state      = FULFILLED;
	  promise._value      = value;
	  promise._onRejected = [];

	  var onFulfilled = promise._onFulfilled, fn;
	  while (fn = onFulfilled.shift()) fn(value);
	};

	var reject = Promise.reject = function(promise, reason) {
	  if (promise._state !== PENDING) return;

	  promise._state       = REJECTED;
	  promise._reason      = reason;
	  promise._onFulfilled = [];

	  var onRejected = promise._onRejected, fn;
	  while (fn = onRejected.shift()) fn(reason);
	};

	Promise.all = function(promises) {
	  return new Promise(function(fulfill, reject) {
	    var list = [],
	         n   = promises.length,
	         i;

	    if (n === 0) return fulfill(list);

	    for (i = 0; i < n; i++) (function(promise, i) {
	      Promise.fulfilled(promise).then(function(value) {
	        list[i] = value;
	        if (--n === 0) fulfill(list);
	      }, reject);
	    })(promises[i], i);
	  });
	};

	Promise.defer = defer;

	Promise.deferred = Promise.pending = function() {
	  var tuple = {};

	  tuple.promise = new Promise(function(fulfill, reject) {
	    tuple.fulfill = tuple.resolve = fulfill;
	    tuple.reject  = reject;
	  });
	  return tuple;
	};

	Promise.fulfilled = Promise.resolved = function(value) {
	  return new Promise(function(fulfill, reject) { fulfill(value) });
	};

	Promise.rejected = function(reason) {
	  return new Promise(function(fulfill, reject) { reject(reason) });
	};

	if (typeof Faye === 'undefined')
	  module.exports = Promise;
	else
	  Faye.Promise = Promise;

	})();

	Faye.Set = Faye.Class({
	  initialize: function() {
	    this._index = {};
	  },

	  add: function(item) {
	    var key = (item.id !== undefined) ? item.id : item;
	    if (this._index.hasOwnProperty(key)) return false;
	    this._index[key] = item;
	    return true;
	  },

	  forEach: function(block, context) {
	    for (var key in this._index) {
	      if (this._index.hasOwnProperty(key))
	        block.call(context, this._index[key]);
	    }
	  },

	  isEmpty: function() {
	    for (var key in this._index) {
	      if (this._index.hasOwnProperty(key)) return false;
	    }
	    return true;
	  },

	  member: function(item) {
	    for (var key in this._index) {
	      if (this._index[key] === item) return true;
	    }
	    return false;
	  },

	  remove: function(item) {
	    var key = (item.id !== undefined) ? item.id : item;
	    var removed = this._index[key];
	    delete this._index[key];
	    return removed;
	  },

	  toArray: function() {
	    var array = [];
	    this.forEach(function(item) { array.push(item) });
	    return array;
	  }
	});

	Faye.URI = {
	  isURI: function(uri) {
	    return uri && uri.protocol && uri.host && uri.path;
	  },

	  isSameOrigin: function(uri) {
	    var location = Faye.ENV.location;
	    return uri.protocol === location.protocol &&
	           uri.hostname === location.hostname &&
	           uri.port     === location.port;
	  },

	  parse: function(url) {
	    if (typeof url !== 'string') return url;
	    var uri = {}, parts, query, pairs, i, n, data;

	    var consume = function(name, pattern) {
	      url = url.replace(pattern, function(match) {
	        uri[name] = match;
	        return '';
	      });
	      uri[name] = uri[name] || '';
	    };

	    consume('protocol', /^[a-z]+\:/i);
	    consume('host',     /^\/\/[^\/\?#]+/);

	    if (!/^\//.test(url) && !uri.host)
	      url = Faye.ENV.location.pathname.replace(/[^\/]*$/, '') + url;

	    consume('pathname', /^[^\?#]*/);
	    consume('search',   /^\?[^#]*/);
	    consume('hash',     /^#.*/);

	    uri.protocol = uri.protocol || Faye.ENV.location.protocol;

	    if (uri.host) {
	      uri.host     = uri.host.substr(2);
	      parts        = uri.host.split(':');
	      uri.hostname = parts[0];
	      uri.port     = parts[1] || '';
	    } else {
	      uri.host     = Faye.ENV.location.host;
	      uri.hostname = Faye.ENV.location.hostname;
	      uri.port     = Faye.ENV.location.port;
	    }

	    uri.pathname = uri.pathname || '/';
	    uri.path = uri.pathname + uri.search;

	    query = uri.search.replace(/^\?/, '');
	    pairs = query ? query.split('&') : [];
	    data  = {};

	    for (i = 0, n = pairs.length; i < n; i++) {
	      parts = pairs[i].split('=');
	      data[decodeURIComponent(parts[0] || '')] = decodeURIComponent(parts[1] || '');
	    }

	    uri.query = data;

	    uri.href = this.stringify(uri);
	    return uri;
	  },

	  stringify: function(uri) {
	    var string = uri.protocol + '//' + uri.hostname;
	    if (uri.port) string += ':' + uri.port;
	    string += uri.pathname + this.queryString(uri.query) + (uri.hash || '');
	    return string;
	  },

	  queryString: function(query) {
	    var pairs = [];
	    for (var key in query) {
	      if (!query.hasOwnProperty(key)) continue;
	      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
	    }
	    if (pairs.length === 0) return '';
	    return '?' + pairs.join('&');
	  }
	};

	Faye.Error = Faye.Class({
	  initialize: function(code, params, message) {
	    this.code    = code;
	    this.params  = Array.prototype.slice.call(params);
	    this.message = message;
	  },

	  toString: function() {
	    return this.code + ':' +
	           this.params.join(',') + ':' +
	           this.message;
	  }
	});

	Faye.Error.parse = function(message) {
	  message = message || '';
	  if (!Faye.Grammar.ERROR.test(message)) return new this(null, [], message);

	  var parts   = message.split(':'),
	      code    = parseInt(parts[0]),
	      params  = parts[1].split(','),
	      message = parts[2];

	  return new this(code, params, message);
	};




	Faye.Error.versionMismatch = function() {
	  return new this(300, arguments, 'Version mismatch').toString();
	};

	Faye.Error.conntypeMismatch = function() {
	  return new this(301, arguments, 'Connection types not supported').toString();
	};

	Faye.Error.extMismatch = function() {
	  return new this(302, arguments, 'Extension mismatch').toString();
	};

	Faye.Error.badRequest = function() {
	  return new this(400, arguments, 'Bad request').toString();
	};

	Faye.Error.clientUnknown = function() {
	  return new this(401, arguments, 'Unknown client').toString();
	};

	Faye.Error.parameterMissing = function() {
	  return new this(402, arguments, 'Missing required parameter').toString();
	};

	Faye.Error.channelForbidden = function() {
	  return new this(403, arguments, 'Forbidden channel').toString();
	};

	Faye.Error.channelUnknown = function() {
	  return new this(404, arguments, 'Unknown channel').toString();
	};

	Faye.Error.channelInvalid = function() {
	  return new this(405, arguments, 'Invalid channel').toString();
	};

	Faye.Error.extUnknown = function() {
	  return new this(406, arguments, 'Unknown extension').toString();
	};

	Faye.Error.publishFailed = function() {
	  return new this(407, arguments, 'Failed to publish').toString();
	};

	Faye.Error.serverError = function() {
	  return new this(500, arguments, 'Internal server error').toString();
	};


	Faye.Deferrable = {
	  then: function(callback, errback) {
	    var self = this;
	    if (!this._promise)
	      this._promise = new Faye.Promise(function(fulfill, reject) {
	        self._fulfill = fulfill;
	        self._reject  = reject;
	      });

	    if (arguments.length === 0)
	      return this._promise;
	    else
	      return this._promise.then(callback, errback);
	  },

	  callback: function(callback, context) {
	    return this.then(function(value) { callback.call(context, value) });
	  },

	  errback: function(callback, context) {
	    return this.then(null, function(reason) { callback.call(context, reason) });
	  },

	  timeout: function(seconds, message) {
	    this.then();
	    var self = this;
	    this._timer = Faye.ENV.setTimeout(function() {
	      self._reject(message);
	    }, seconds * 1000);
	  },

	  setDeferredStatus: function(status, value) {
	    if (this._timer) Faye.ENV.clearTimeout(this._timer);

	    this.then();

	    if (status === 'succeeded')
	      this._fulfill(value);
	    else if (status === 'failed')
	      this._reject(value);
	    else
	      delete this._promise;
	  }
	};

	Faye.Publisher = {
	  countListeners: function(eventType) {
	    return this.listeners(eventType).length;
	  },

	  bind: function(eventType, listener, context) {
	    var slice   = Array.prototype.slice,
	        handler = function() { listener.apply(context, slice.call(arguments)) };

	    this._listeners = this._listeners || [];
	    this._listeners.push([eventType, listener, context, handler]);
	    return this.on(eventType, handler);
	  },

	  unbind: function(eventType, listener, context) {
	    this._listeners = this._listeners || [];
	    var n = this._listeners.length, tuple;

	    while (n--) {
	      tuple = this._listeners[n];
	      if (tuple[0] !== eventType) continue;
	      if (listener && (tuple[1] !== listener || tuple[2] !== context)) continue;
	      this._listeners.splice(n, 1);
	      this.removeListener(eventType, tuple[3]);
	    }
	  }
	};

	Faye.extend(Faye.Publisher, Faye.EventEmitter.prototype);
	Faye.Publisher.trigger = Faye.Publisher.emit;

	Faye.Timeouts = {
	  addTimeout: function(name, delay, callback, context) {
	    this._timeouts = this._timeouts || {};
	    if (this._timeouts.hasOwnProperty(name)) return;
	    var self = this;
	    this._timeouts[name] = Faye.ENV.setTimeout(function() {
	      delete self._timeouts[name];
	      callback.call(context);
	    }, 1000 * delay);
	  },

	  removeTimeout: function(name) {
	    this._timeouts = this._timeouts || {};
	    var timeout = this._timeouts[name];
	    if (!timeout) return;
	    Faye.ENV.clearTimeout(timeout);
	    delete this._timeouts[name];
	  },

	  removeAllTimeouts: function() {
	    this._timeouts = this._timeouts || {};
	    for (var name in this._timeouts) this.removeTimeout(name);
	  }
	};

	Faye.Logging = {
	  LOG_LEVELS: {
	    fatal:  4,
	    error:  3,
	    warn:   2,
	    info:   1,
	    debug:  0
	  },

	  writeLog: function(messageArgs, level) {
	    if (!Faye.logger) return;

	    var args   = Array.prototype.slice.apply(messageArgs),
	        banner = '[Faye',
	        klass  = this.className,

	        message = args.shift().replace(/\?/g, function() {
	          try {
	            return Faye.toJSON(args.shift());
	          } catch (e) {
	            return '[Object]';
	          }
	        });

	    for (var key in Faye) {
	      if (klass) continue;
	      if (typeof Faye[key] !== 'function') continue;
	      if (this instanceof Faye[key]) klass = key;
	    }
	    if (klass) banner += '.' + klass;
	    banner += '] ';

	    if (typeof Faye.logger[level] === 'function')
	      Faye.logger[level](banner + message);
	    else if (typeof Faye.logger === 'function')
	      Faye.logger(banner + message);
	  }
	};

	(function() {
	  for (var key in Faye.Logging.LOG_LEVELS)
	    (function(level) {
	      Faye.Logging[level] = function() {
	        this.writeLog(arguments, level);
	      };
	    })(key);
	})();

	Faye.Grammar = {
	  CHANNEL_NAME:     /^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,
	  CHANNEL_PATTERN:  /^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/,
	  ERROR:            /^([0-9][0-9][0-9]:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*(,(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)*:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*|[0-9][0-9][0-9]::(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)$/,
	  VERSION:          /^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/
	};

	Faye.Extensible = {
	  addExtension: function(extension) {
	    this._extensions = this._extensions || [];
	    this._extensions.push(extension);
	    if (extension.added) extension.added(this);
	  },

	  removeExtension: function(extension) {
	    if (!this._extensions) return;
	    var i = this._extensions.length;
	    while (i--) {
	      if (this._extensions[i] !== extension) continue;
	      this._extensions.splice(i,1);
	      if (extension.removed) extension.removed(this);
	    }
	  },

	  pipeThroughExtensions: function(stage, message, request, callback, context) {
	    this.debug('Passing through ? extensions: ?', stage, message);

	    if (!this._extensions) return callback.call(context, message);
	    var extensions = this._extensions.slice();

	    var pipe = function(message) {
	      if (!message) return callback.call(context, message);

	      var extension = extensions.shift();
	      if (!extension) return callback.call(context, message);

	      var fn = extension[stage];
	      if (!fn) return pipe(message);

	      if (fn.length >= 3) extension[stage](message, request, pipe);
	      else                extension[stage](message, pipe);
	    };
	    pipe(message);
	  }
	};

	Faye.extend(Faye.Extensible, Faye.Logging);

	Faye.Channel = Faye.Class({
	  initialize: function(name) {
	    this.id = this.name = name;
	  },

	  push: function(message) {
	    this.trigger('message', message);
	  },

	  isUnused: function() {
	    return this.countListeners('message') === 0;
	  }
	});

	Faye.extend(Faye.Channel.prototype, Faye.Publisher);

	Faye.extend(Faye.Channel, {
	  HANDSHAKE:    '/meta/handshake',
	  CONNECT:      '/meta/connect',
	  SUBSCRIBE:    '/meta/subscribe',
	  UNSUBSCRIBE:  '/meta/unsubscribe',
	  DISCONNECT:   '/meta/disconnect',

	  META:         'meta',
	  SERVICE:      'service',

	  expand: function(name) {
	    var segments = this.parse(name),
	        channels = ['/**', name];

	    var copy = segments.slice();
	    copy[copy.length - 1] = '*';
	    channels.push(this.unparse(copy));

	    for (var i = 1, n = segments.length; i < n; i++) {
	      copy = segments.slice(0, i);
	      copy.push('**');
	      channels.push(this.unparse(copy));
	    }

	    return channels;
	  },

	  isValid: function(name) {
	    return Faye.Grammar.CHANNEL_NAME.test(name) ||
	           Faye.Grammar.CHANNEL_PATTERN.test(name);
	  },

	  parse: function(name) {
	    if (!this.isValid(name)) return null;
	    return name.split('/').slice(1);
	  },

	  unparse: function(segments) {
	    return '/' + segments.join('/');
	  },

	  isMeta: function(name) {
	    var segments = this.parse(name);
	    return segments ? (segments[0] === this.META) : null;
	  },

	  isService: function(name) {
	    var segments = this.parse(name);
	    return segments ? (segments[0] === this.SERVICE) : null;
	  },

	  isSubscribable: function(name) {
	    if (!this.isValid(name)) return null;
	    return !this.isMeta(name) && !this.isService(name);
	  },

	  Set: Faye.Class({
	    initialize: function() {
	      this._channels = {};
	    },

	    getKeys: function() {
	      var keys = [];
	      for (var key in this._channels) keys.push(key);
	      return keys;
	    },

	    remove: function(name) {
	      delete this._channels[name];
	    },

	    hasSubscription: function(name) {
	      return this._channels.hasOwnProperty(name);
	    },

	    subscribe: function(names, callback, context) {
	      var name;
	      for (var i = 0, n = names.length; i < n; i++) {
	        name = names[i];
	        var channel = this._channels[name] = this._channels[name] || new Faye.Channel(name);
	        if (callback) channel.bind('message', callback, context);
	      }
	    },

	    unsubscribe: function(name, callback, context) {
	      var channel = this._channels[name];
	      if (!channel) return false;
	      channel.unbind('message', callback, context);

	      if (channel.isUnused()) {
	        this.remove(name);
	        return true;
	      } else {
	        return false;
	      }
	    },

	    distributeMessage: function(message) {
	      var channels = Faye.Channel.expand(message.channel);

	      for (var i = 0, n = channels.length; i < n; i++) {
	        var channel = this._channels[channels[i]];
	        if (channel) channel.trigger('message', message.data);
	      }
	    }
	  })
	});

	Faye.Publication = Faye.Class(Faye.Deferrable);

	Faye.Subscription = Faye.Class({
	  initialize: function(client, channels, callback, context) {
	    this._client    = client;
	    this._channels  = channels;
	    this._callback  = callback;
	    this._context     = context;
	    this._cancelled = false;
	  },

	  cancel: function() {
	    if (this._cancelled) return;
	    this._client.unsubscribe(this._channels, this._callback, this._context);
	    this._cancelled = true;
	  },

	  unsubscribe: function() {
	    this.cancel();
	  }
	});

	Faye.extend(Faye.Subscription.prototype, Faye.Deferrable);

	Faye.Client = Faye.Class({
	  UNCONNECTED:        1,
	  CONNECTING:         2,
	  CONNECTED:          3,
	  DISCONNECTED:       4,

	  HANDSHAKE:          'handshake',
	  RETRY:              'retry',
	  NONE:               'none',

	  CONNECTION_TIMEOUT: 60,

	  DEFAULT_ENDPOINT:   '/bayeux',
	  INTERVAL:           0,

	  initialize: function(endpoint, options) {
	    this.info('New client created for ?', endpoint);
	    options = options || {};

	    Faye.validateOptions(options, ['interval', 'timeout', 'endpoints', 'proxy', 'retry', 'scheduler', 'websocketExtensions', 'tls', 'ca']);

	    this._endpoint   = endpoint || this.DEFAULT_ENDPOINT;
	    this._channels   = new Faye.Channel.Set();
	    this._dispatcher = new Faye.Dispatcher(this, this._endpoint, options);

	    this._messageId = 0;
	    this._state     = this.UNCONNECTED;

	    this._responseCallbacks = {};

	    this._advice = {
	      reconnect: this.RETRY,
	      interval:  1000 * (options.interval || this.INTERVAL),
	      timeout:   1000 * (options.timeout  || this.CONNECTION_TIMEOUT)
	    };
	    this._dispatcher.timeout = this._advice.timeout / 1000;

	    this._dispatcher.bind('message', this._receiveMessage, this);

	    if (Faye.Event && Faye.ENV.onbeforeunload !== undefined)
	      Faye.Event.on(Faye.ENV, 'beforeunload', function() {
	        if (Faye.indexOf(this._dispatcher._disabled, 'autodisconnect') < 0)
	          this.disconnect();
	      }, this);
	  },

	  addWebsocketExtension: function(extension) {
	    return this._dispatcher.addWebsocketExtension(extension);
	  },

	  disable: function(feature) {
	    return this._dispatcher.disable(feature);
	  },

	  setHeader: function(name, value) {
	    return this._dispatcher.setHeader(name, value);
	  },

	  // Request
	  // MUST include:  * channel
	  //                * version
	  //                * supportedConnectionTypes
	  // MAY include:   * minimumVersion
	  //                * ext
	  //                * id
	  //
	  // Success Response                             Failed Response
	  // MUST include:  * channel                     MUST include:  * channel
	  //                * version                                    * successful
	  //                * supportedConnectionTypes                   * error
	  //                * clientId                    MAY include:   * supportedConnectionTypes
	  //                * successful                                 * advice
	  // MAY include:   * minimumVersion                             * version
	  //                * advice                                     * minimumVersion
	  //                * ext                                        * ext
	  //                * id                                         * id
	  //                * authSuccessful
	  handshake: function(callback, context) {
	    if (this._advice.reconnect === this.NONE) return;
	    if (this._state !== this.UNCONNECTED) return;

	    this._state = this.CONNECTING;
	    var self = this;

	    this.info('Initiating handshake with ?', Faye.URI.stringify(this._endpoint));
	    this._dispatcher.selectTransport(Faye.MANDATORY_CONNECTION_TYPES);

	    this._sendMessage({
	      channel:                  Faye.Channel.HANDSHAKE,
	      version:                  Faye.BAYEUX_VERSION,
	      supportedConnectionTypes: this._dispatcher.getConnectionTypes()

	    }, {}, function(response) {

	      if (response.successful) {
	        this._state = this.CONNECTED;
	        this._dispatcher.clientId  = response.clientId;

	        this._dispatcher.selectTransport(response.supportedConnectionTypes);

	        this.info('Handshake successful: ?', this._dispatcher.clientId);

	        this.subscribe(this._channels.getKeys(), true);
	        if (callback) Faye.Promise.defer(function() { callback.call(context) });

	      } else {
	        this.info('Handshake unsuccessful');
	        Faye.ENV.setTimeout(function() { self.handshake(callback, context) }, this._dispatcher.retry * 1000);
	        this._state = this.UNCONNECTED;
	      }
	    }, this);
	  },

	  // Request                              Response
	  // MUST include:  * channel             MUST include:  * channel
	  //                * clientId                           * successful
	  //                * connectionType                     * clientId
	  // MAY include:   * ext                 MAY include:   * error
	  //                * id                                 * advice
	  //                                                     * ext
	  //                                                     * id
	  //                                                     * timestamp
	  connect: function(callback, context) {
	    if (this._advice.reconnect === this.NONE) return;
	    if (this._state === this.DISCONNECTED) return;

	    if (this._state === this.UNCONNECTED)
	      return this.handshake(function() { this.connect(callback, context) }, this);

	    this.callback(callback, context);
	    if (this._state !== this.CONNECTED) return;

	    this.info('Calling deferred actions for ?', this._dispatcher.clientId);
	    this.setDeferredStatus('succeeded');
	    this.setDeferredStatus('unknown');

	    if (this._connectRequest) return;
	    this._connectRequest = true;

	    this.info('Initiating connection for ?', this._dispatcher.clientId);

	    this._sendMessage({
	      channel:        Faye.Channel.CONNECT,
	      clientId:       this._dispatcher.clientId,
	      connectionType: this._dispatcher.connectionType

	    }, {}, this._cycleConnection, this);
	  },

	  // Request                              Response
	  // MUST include:  * channel             MUST include:  * channel
	  //                * clientId                           * successful
	  // MAY include:   * ext                                * clientId
	  //                * id                  MAY include:   * error
	  //                                                     * ext
	  //                                                     * id
	  disconnect: function() {
	    if (this._state !== this.CONNECTED) return;
	    this._state = this.DISCONNECTED;

	    this.info('Disconnecting ?', this._dispatcher.clientId);
	    var promise = new Faye.Publication();

	    this._sendMessage({
	      channel:  Faye.Channel.DISCONNECT,
	      clientId: this._dispatcher.clientId

	    }, {}, function(response) {
	      if (response.successful) {
	        this._dispatcher.close();
	        promise.setDeferredStatus('succeeded');
	      } else {
	        promise.setDeferredStatus('failed', Faye.Error.parse(response.error));
	      }
	    }, this);

	    this.info('Clearing channel listeners for ?', this._dispatcher.clientId);
	    this._channels = new Faye.Channel.Set();

	    return promise;
	  },

	  // Request                              Response
	  // MUST include:  * channel             MUST include:  * channel
	  //                * clientId                           * successful
	  //                * subscription                       * clientId
	  // MAY include:   * ext                                * subscription
	  //                * id                  MAY include:   * error
	  //                                                     * advice
	  //                                                     * ext
	  //                                                     * id
	  //                                                     * timestamp
	  subscribe: function(channel, callback, context) {
	    if (channel instanceof Array)
	      return Faye.map(channel, function(c) {
	        return this.subscribe(c, callback, context);
	      }, this);

	    var subscription = new Faye.Subscription(this, channel, callback, context),
	        force        = (callback === true),
	        hasSubscribe = this._channels.hasSubscription(channel);

	    if (hasSubscribe && !force) {
	      this._channels.subscribe([channel], callback, context);
	      subscription.setDeferredStatus('succeeded');
	      return subscription;
	    }

	    this.connect(function() {
	      this.info('Client ? attempting to subscribe to ?', this._dispatcher.clientId, channel);
	      if (!force) this._channels.subscribe([channel], callback, context);

	      this._sendMessage({
	        channel:      Faye.Channel.SUBSCRIBE,
	        clientId:     this._dispatcher.clientId,
	        subscription: channel

	      }, {}, function(response) {
	        if (!response.successful) {
	          subscription.setDeferredStatus('failed', Faye.Error.parse(response.error));
	          return this._channels.unsubscribe(channel, callback, context);
	        }

	        var channels = [].concat(response.subscription);
	        this.info('Subscription acknowledged for ? to ?', this._dispatcher.clientId, channels);
	        subscription.setDeferredStatus('succeeded');
	      }, this);
	    }, this);

	    return subscription;
	  },

	  // Request                              Response
	  // MUST include:  * channel             MUST include:  * channel
	  //                * clientId                           * successful
	  //                * subscription                       * clientId
	  // MAY include:   * ext                                * subscription
	  //                * id                  MAY include:   * error
	  //                                                     * advice
	  //                                                     * ext
	  //                                                     * id
	  //                                                     * timestamp
	  unsubscribe: function(channel, callback, context) {
	    if (channel instanceof Array)
	      return Faye.map(channel, function(c) {
	        return this.unsubscribe(c, callback, context);
	      }, this);

	    var dead = this._channels.unsubscribe(channel, callback, context);
	    if (!dead) return;

	    this.connect(function() {
	      this.info('Client ? attempting to unsubscribe from ?', this._dispatcher.clientId, channel);

	      this._sendMessage({
	        channel:      Faye.Channel.UNSUBSCRIBE,
	        clientId:     this._dispatcher.clientId,
	        subscription: channel

	      }, {}, function(response) {
	        if (!response.successful) return;

	        var channels = [].concat(response.subscription);
	        this.info('Unsubscription acknowledged for ? from ?', this._dispatcher.clientId, channels);
	      }, this);
	    }, this);
	  },

	  // Request                              Response
	  // MUST include:  * channel             MUST include:  * channel
	  //                * data                               * successful
	  // MAY include:   * clientId            MAY include:   * id
	  //                * id                                 * error
	  //                * ext                                * ext
	  publish: function(channel, data, options) {
	    Faye.validateOptions(options || {}, ['attempts', 'deadline']);
	    var publication = new Faye.Publication();

	    this.connect(function() {
	      this.info('Client ? queueing published message to ?: ?', this._dispatcher.clientId, channel, data);

	      this._sendMessage({
	        channel:  channel,
	        data:     data,
	        clientId: this._dispatcher.clientId

	      }, options, function(response) {
	        if (response.successful)
	          publication.setDeferredStatus('succeeded');
	        else
	          publication.setDeferredStatus('failed', Faye.Error.parse(response.error));
	      }, this);
	    }, this);

	    return publication;
	  },

	  _sendMessage: function(message, options, callback, context) {
	    message.id = this._generateMessageId();

	    var timeout = this._advice.timeout
	                ? 1.2 * this._advice.timeout / 1000
	                : 1.2 * this._dispatcher.retry;

	    this.pipeThroughExtensions('outgoing', message, null, function(message) {
	      if (!message) return;
	      if (callback) this._responseCallbacks[message.id] = [callback, context];
	      this._dispatcher.sendMessage(message, timeout, options || {});
	    }, this);
	  },

	  _generateMessageId: function() {
	    this._messageId += 1;
	    if (this._messageId >= Math.pow(2,32)) this._messageId = 0;
	    return this._messageId.toString(36);
	  },

	  _receiveMessage: function(message) {
	    var id = message.id, callback;

	    if (message.successful !== undefined) {
	      callback = this._responseCallbacks[id];
	      delete this._responseCallbacks[id];
	    }

	    this.pipeThroughExtensions('incoming', message, null, function(message) {
	      if (!message) return;
	      if (message.advice) this._handleAdvice(message.advice);
	      this._deliverMessage(message);
	      if (callback) callback[0].call(callback[1], message);
	    }, this);
	  },

	  _handleAdvice: function(advice) {
	    Faye.extend(this._advice, advice);
	    this._dispatcher.timeout = this._advice.timeout / 1000;

	    if (this._advice.reconnect === this.HANDSHAKE && this._state !== this.DISCONNECTED) {
	      this._state = this.UNCONNECTED;
	      this._dispatcher.clientId = null;
	      this._cycleConnection();
	    }
	  },

	  _deliverMessage: function(message) {
	    if (!message.channel || message.data === undefined) return;
	    this.info('Client ? calling listeners for ? with ?', this._dispatcher.clientId, message.channel, message.data);
	    this._channels.distributeMessage(message);
	  },

	  _cycleConnection: function() {
	    if (this._connectRequest) {
	      this._connectRequest = null;
	      this.info('Closed connection for ?', this._dispatcher.clientId);
	    }
	    var self = this;
	    Faye.ENV.setTimeout(function() { self.connect() }, this._advice.interval);
	  }
	});

	Faye.extend(Faye.Client.prototype, Faye.Deferrable);
	Faye.extend(Faye.Client.prototype, Faye.Publisher);
	Faye.extend(Faye.Client.prototype, Faye.Logging);
	Faye.extend(Faye.Client.prototype, Faye.Extensible);

	Faye.Dispatcher = Faye.Class({
	  MAX_REQUEST_SIZE: 2048,
	  DEFAULT_RETRY:    5,

	  UP:   1,
	  DOWN: 2,

	  initialize: function(client, endpoint, options) {
	    this._client     = client;
	    this.endpoint    = Faye.URI.parse(endpoint);
	    this._alternates = options.endpoints || {};

	    this.cookies      = Faye.Cookies && new Faye.Cookies.CookieJar();
	    this._disabled    = [];
	    this._envelopes   = {};
	    this.headers      = {};
	    this.retry        = options.retry || this.DEFAULT_RETRY;
	    this._scheduler   = options.scheduler || Faye.Scheduler;
	    this._state       = 0;
	    this.transports   = {};
	    this.wsExtensions = [];

	    this.proxy = options.proxy || {};
	    if (typeof this._proxy === 'string') this._proxy = {origin: this._proxy};

	    var exts = options.websocketExtensions;
	    if (exts) {
	      exts = [].concat(exts);
	      for (var i = 0, n = exts.length; i < n; i++)
	        this.addWebsocketExtension(exts[i]);
	    }

	    this.tls = options.tls || {};
	    this.tls.ca = this.tls.ca || options.ca;

	    for (var type in this._alternates)
	      this._alternates[type] = Faye.URI.parse(this._alternates[type]);

	    this.maxRequestSize = this.MAX_REQUEST_SIZE;
	  },

	  endpointFor: function(connectionType) {
	    return this._alternates[connectionType] || this.endpoint;
	  },

	  addWebsocketExtension: function(extension) {
	    this.wsExtensions.push(extension);
	  },

	  disable: function(feature) {
	    this._disabled.push(feature);
	  },

	  setHeader: function(name, value) {
	    this.headers[name] = value;
	  },

	  close: function() {
	    var transport = this._transport;
	    delete this._transport;
	    if (transport) transport.close();
	  },

	  getConnectionTypes: function() {
	    return Faye.Transport.getConnectionTypes();
	  },

	  selectTransport: function(transportTypes) {
	    Faye.Transport.get(this, transportTypes, this._disabled, function(transport) {
	      this.debug('Selected ? transport for ?', transport.connectionType, Faye.URI.stringify(transport.endpoint));

	      if (transport === this._transport) return;
	      if (this._transport) this._transport.close();

	      this._transport = transport;
	      this.connectionType = transport.connectionType;
	    }, this);
	  },

	  sendMessage: function(message, timeout, options) {
	    options = options || {};

	    var id       = message.id,
	        attempts = options.attempts,
	        deadline = options.deadline && new Date().getTime() + (options.deadline * 1000),
	        envelope = this._envelopes[id],
	        scheduler;

	    if (!envelope) {
	      scheduler = new this._scheduler(message, {timeout: timeout, interval: this.retry, attempts: attempts, deadline: deadline});
	      envelope  = this._envelopes[id] = {message: message, scheduler: scheduler};
	    }

	    this._sendEnvelope(envelope);
	  },

	  _sendEnvelope: function(envelope) {
	    if (!this._transport) return;
	    if (envelope.request || envelope.timer) return;

	    var message   = envelope.message,
	        scheduler = envelope.scheduler,
	        self      = this;

	    if (!scheduler.isDeliverable()) {
	      scheduler.abort();
	      delete this._envelopes[message.id];
	      return;
	    }

	    envelope.timer = Faye.ENV.setTimeout(function() {
	      self.handleError(message);
	    }, scheduler.getTimeout() * 1000);

	    scheduler.send();
	    envelope.request = this._transport.sendMessage(message);
	  },

	  handleResponse: function(reply) {
	    var envelope = this._envelopes[reply.id];

	    if (reply.successful !== undefined && envelope) {
	      envelope.scheduler.succeed();
	      delete this._envelopes[reply.id];
	      Faye.ENV.clearTimeout(envelope.timer);
	    }

	    this.trigger('message', reply);

	    if (this._state === this.UP) return;
	    this._state = this.UP;
	    this._client.trigger('transport:up');
	  },

	  handleError: function(message, immediate) {
	    var envelope = this._envelopes[message.id],
	        request  = envelope && envelope.request,
	        self     = this;

	    if (!request) return;

	    request.then(function(req) {
	      if (req && req.abort) req.abort();
	    });

	    var scheduler = envelope.scheduler;
	    scheduler.fail();

	    Faye.ENV.clearTimeout(envelope.timer);
	    envelope.request = envelope.timer = null;

	    if (immediate) {
	      this._sendEnvelope(envelope);
	    } else {
	      envelope.timer = Faye.ENV.setTimeout(function() {
	        envelope.timer = null;
	        self._sendEnvelope(envelope);
	      }, scheduler.getInterval() * 1000);
	    }

	    if (this._state === this.DOWN) return;
	    this._state = this.DOWN;
	    this._client.trigger('transport:down');
	  }
	});

	Faye.extend(Faye.Dispatcher.prototype, Faye.Publisher);
	Faye.extend(Faye.Dispatcher.prototype, Faye.Logging);

	Faye.Scheduler = function(message, options) {
	  this.message  = message;
	  this.options  = options;
	  this.attempts = 0;
	};

	Faye.extend(Faye.Scheduler.prototype, {
	  getTimeout: function() {
	    return this.options.timeout;
	  },

	  getInterval: function() {
	    return this.options.interval;
	  },

	  isDeliverable: function() {
	    var attempts = this.options.attempts,
	        made     = this.attempts,
	        deadline = this.options.deadline,
	        now      = new Date().getTime();

	    if (attempts !== undefined && made >= attempts)
	      return false;

	    if (deadline !== undefined && now > deadline)
	      return false;

	    return true;
	  },

	  send: function() {
	    this.attempts += 1;
	  },

	  succeed: function() {},

	  fail: function() {},

	  abort: function() {}
	});

	Faye.Transport = Faye.extend(Faye.Class({
	  DEFAULT_PORTS:    {'http:': 80, 'https:': 443, 'ws:': 80, 'wss:': 443},
	  SECURE_PROTOCOLS: ['https:', 'wss:'],
	  MAX_DELAY:        0,

	  batching:  true,

	  initialize: function(dispatcher, endpoint) {
	    this._dispatcher = dispatcher;
	    this.endpoint    = endpoint;
	    this._outbox     = [];
	    this._proxy      = Faye.extend({}, this._dispatcher.proxy);

	    if (!this._proxy.origin && Faye.NodeAdapter) {
	      this._proxy.origin = Faye.indexOf(this.SECURE_PROTOCOLS, this.endpoint.protocol) >= 0
	                         ? (process.env.HTTPS_PROXY || process.env.https_proxy)
	                         : (process.env.HTTP_PROXY  || process.env.http_proxy);
	    }
	  },

	  close: function() {},

	  encode: function(messages) {
	    return '';
	  },

	  sendMessage: function(message) {
	    this.debug('Client ? sending message to ?: ?',
	               this._dispatcher.clientId, Faye.URI.stringify(this.endpoint), message);

	    if (!this.batching) return Faye.Promise.fulfilled(this.request([message]));

	    this._outbox.push(message);
	    this._promise = this._promise || new Faye.Promise();
	    this._flushLargeBatch();

	    if (message.channel === Faye.Channel.HANDSHAKE) {
	      this.addTimeout('publish', 0.01, this._flush, this);
	      return this._promise;
	    }

	    if (message.channel === Faye.Channel.CONNECT)
	      this._connectMessage = message;

	    this.addTimeout('publish', this.MAX_DELAY, this._flush, this);
	    return this._promise;
	  },

	  _flush: function() {
	    this.removeTimeout('publish');

	    if (this._outbox.length > 1 && this._connectMessage)
	      this._connectMessage.advice = {timeout: 0};

	    Faye.Promise.fulfill(this._promise, this.request(this._outbox));
	    delete this._promise;

	    this._connectMessage = null;
	    this._outbox = [];
	  },

	  _flushLargeBatch: function() {
	    var string = this.encode(this._outbox);
	    if (string.length < this._dispatcher.maxRequestSize) return;
	    var last = this._outbox.pop();
	    this._flush();
	    if (last) this._outbox.push(last);
	  },

	  _receive: function(replies) {
	    if (!replies) return;
	    replies = [].concat(replies);

	    this.debug('Client ? received from ? via ?: ?',
	               this._dispatcher.clientId, Faye.URI.stringify(this.endpoint), this.connectionType, replies);

	    for (var i = 0, n = replies.length; i < n; i++)
	      this._dispatcher.handleResponse(replies[i]);
	  },

	  _handleError: function(messages, immediate) {
	    messages = [].concat(messages);

	    this.debug('Client ? failed to send to ? via ?: ?',
	               this._dispatcher.clientId, Faye.URI.stringify(this.endpoint), this.connectionType, messages);

	    for (var i = 0, n = messages.length; i < n; i++)
	      this._dispatcher.handleError(messages[i]);
	  },

	  _getCookies: function() {
	    var cookies = this._dispatcher.cookies,
	        url     = Faye.URI.stringify(this.endpoint);

	    if (!cookies) return '';

	    return Faye.map(cookies.getCookiesSync(url), function(cookie) {
	      return cookie.cookieString();
	    }).join('; ');
	  },

	  _storeCookies: function(setCookie) {
	    var cookies = this._dispatcher.cookies,
	        url     = Faye.URI.stringify(this.endpoint),
	        cookie;

	    if (!setCookie || !cookies) return;
	    setCookie = [].concat(setCookie);

	    for (var i = 0, n = setCookie.length; i < n; i++) {
	      cookie = Faye.Cookies.Cookie.parse(setCookie[i]);
	      cookies.setCookieSync(cookie, url);
	    }
	  }

	}), {
	  get: function(dispatcher, allowed, disabled, callback, context) {
	    var endpoint = dispatcher.endpoint;

	    Faye.asyncEach(this._transports, function(pair, resume) {
	      var connType     = pair[0], klass = pair[1],
	          connEndpoint = dispatcher.endpointFor(connType);

	      if (Faye.indexOf(disabled, connType) >= 0)
	        return resume();

	      if (Faye.indexOf(allowed, connType) < 0) {
	        klass.isUsable(dispatcher, connEndpoint, function() {});
	        return resume();
	      }

	      klass.isUsable(dispatcher, connEndpoint, function(isUsable) {
	        if (!isUsable) return resume();
	        var transport = klass.hasOwnProperty('create') ? klass.create(dispatcher, connEndpoint) : new klass(dispatcher, connEndpoint);
	        callback.call(context, transport);
	      });
	    }, function() {
	      throw new Error('Could not find a usable connection type for ' + Faye.URI.stringify(endpoint));
	    });
	  },

	  register: function(type, klass) {
	    this._transports.push([type, klass]);
	    klass.prototype.connectionType = type;
	  },

	  getConnectionTypes: function() {
	    return Faye.map(this._transports, function(t) { return t[0] });
	  },

	  _transports: []
	});

	Faye.extend(Faye.Transport.prototype, Faye.Logging);
	Faye.extend(Faye.Transport.prototype, Faye.Timeouts);

	Faye.Event = {
	  _registry: [],

	  on: function(element, eventName, callback, context) {
	    var wrapped = function() { callback.call(context) };

	    if (element.addEventListener)
	      element.addEventListener(eventName, wrapped, false);
	    else
	      element.attachEvent('on' + eventName, wrapped);

	    this._registry.push({
	      _element:   element,
	      _type:      eventName,
	      _callback:  callback,
	      _context:     context,
	      _handler:   wrapped
	    });
	  },

	  detach: function(element, eventName, callback, context) {
	    var i = this._registry.length, register;
	    while (i--) {
	      register = this._registry[i];

	      if ((element    && element    !== register._element)   ||
	          (eventName  && eventName  !== register._type)      ||
	          (callback   && callback   !== register._callback)  ||
	          (context      && context      !== register._context))
	        continue;

	      if (register._element.removeEventListener)
	        register._element.removeEventListener(register._type, register._handler, false);
	      else
	        register._element.detachEvent('on' + register._type, register._handler);

	      this._registry.splice(i,1);
	      register = null;
	    }
	  }
	};

	if (Faye.ENV.onunload !== undefined) Faye.Event.on(Faye.ENV, 'unload', Faye.Event.detach, Faye.Event);

	/*
	    json2.js
	    2013-05-26

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    See http://www.JSON.org/js.html


	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.


	    This file creates a global JSON object containing two methods: stringify
	    and parse.

	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.

	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.

	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as '\t' or '&nbsp;'),
	                        it contains the characters used to indent at each level.

	            This method produces a JSON text from a JavaScript value.

	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value

	            For example, this would serialize Dates as ISO strings.

	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? '0' + n : n;
	                    }

	                    return this.getUTCFullYear()   + '-' +
	                         f(this.getUTCMonth() + 1) + '-' +
	                         f(this.getUTCDate())      + 'T' +
	                         f(this.getUTCHours())     + ':' +
	                         f(this.getUTCMinutes())   + ':' +
	                         f(this.getUTCSeconds())   + 'Z';
	                };

	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.

	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.

	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.

	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.

	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.

	            Example:

	            text = JSON.stringify(['e', {pluribus: 'unum'}]);
	            // text is '["e",{"pluribus":"unum"}]'


	            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
	            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    'Date(' + this[key] + ')' : value;
	            });
	            // text is '["Date(---current time---)"]'


	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = JSON.parse(text, function (key, value) {
	                var a;
	                if (typeof value === 'string') {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
	                var d;
	                if (typeof value === 'string' &&
	                        value.slice(0, 5) === 'Date(' &&
	                        value.slice(-1) === ')') {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });


	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/

	/*jslint evil: true, regexp: true */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	    lastIndex, length, parse, prototype, push, replace, slice, stringify,
	    test, toJSON, toString, valueOf
	*/


	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.

	if (typeof JSON !== 'object') {
	    JSON = {};
	}

	(function () {
	    'use strict';

	    function f(n) {
	        // Format integers to have at least two digits.
	        return n < 10 ? '0' + n : n;
	    }

	    if (typeof Date.prototype.toJSON !== 'function') {

	        Date.prototype.toJSON = function () {

	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear()     + '-' +
	                    f(this.getUTCMonth() + 1) + '-' +
	                    f(this.getUTCDate())      + 'T' +
	                    f(this.getUTCHours())     + ':' +
	                    f(this.getUTCMinutes())   + ':' +
	                    f(this.getUTCSeconds())   + 'Z'
	                : null;
	        };

	        String.prototype.toJSON      =
	            Number.prototype.toJSON  =
	            Boolean.prototype.toJSON = function () {
	                return this.valueOf();
	            };
	    }

	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;


	    function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string'
	                ? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }


	    function str(key, holder) {

	// Produce a string from holder[key].

	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];

	// If the value has a toJSON method, call it to obtain a replacement value.

	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }

	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.

	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }

	// What happens next depends on the value's type.

	        switch (typeof value) {
	        case 'string':
	            return quote(value);

	        case 'number':

	// JSON numbers must be finite. Encode non-finite numbers as null.

	            return isFinite(value) ? String(value) : 'null';

	        case 'boolean':
	        case 'null':

	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.

	            return String(value);

	// If the type is 'object', we might be dealing with an object or an array or
	// null.

	        case 'object':

	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.

	            if (!value) {
	                return 'null';
	            }

	// Make an array to hold the partial results of stringifying this object value.

	            gap += indent;
	            partial = [];

	// Is the value an array?

	            if (Object.prototype.toString.apply(value) === '[object Array]') {

	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.

	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }

	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.

	                v = partial.length === 0
	                    ? '[]'
	                    : gap
	                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }

	// If the replacer is an array, use it to select the members to be stringified.

	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {

	// Otherwise, iterate through all of the keys in the object.

	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }

	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.

	            v = partial.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }

	// If the JSON object does not yet have a stringify method, give it one.

	    Faye.stringify = function (value, replacer, space) {

	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.

	        var i;
	        gap = '';
	        indent = '';

	// If the space parameter is a number, make an indent string containing that
	// many spaces.

	        if (typeof space === 'number') {
	            for (i = 0; i < space; i += 1) {
	                indent += ' ';
	            }

	// If the space parameter is a string, it will be used as the indent string.

	        } else if (typeof space === 'string') {
	            indent = space;
	        }

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.

	        rep = replacer;
	        if (replacer && typeof replacer !== 'function' &&
	                (typeof replacer !== 'object' ||
	                typeof replacer.length !== 'number')) {
	            throw new Error('JSON.stringify');
	        }

	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.

	        return str('', {'': value});
	    };

	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = Faye.stringify;
	    }

	// If the JSON object does not yet have a parse method, give it one.

	    if (typeof JSON.parse !== 'function') {
	        JSON.parse = function (text, reviver) {

	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.

	            var j;

	            function walk(holder, key) {

	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.

	                var k, v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            if (v !== undefined) {
	                                value[k] = v;
	                            } else {
	                                delete value[k];
	                            }
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }


	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.

	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return '\\u' +
	                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }

	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with '()' and 'new'
	// because they can cause invocation, and '=' because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.

	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	// replace all simple value tokens with ']' characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or ']' or
	// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

	            if (/^[\],:{}\s]*$/
	                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.

	                j = eval('(' + text + ')');

	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.

	                return typeof reviver === 'function'
	                    ? walk({'': j}, '')
	                    : j;
	            }

	// If the text is not JSON parseable, then a SyntaxError is thrown.

	            throw new SyntaxError('JSON.parse');
	        };
	    }
	}());

	Faye.Transport.WebSocket = Faye.extend(Faye.Class(Faye.Transport, {
	  UNCONNECTED:  1,
	  CONNECTING:   2,
	  CONNECTED:    3,

	  batching:     false,

	  isUsable: function(callback, context) {
	    this.callback(function() { callback.call(context, true) });
	    this.errback(function() { callback.call(context, false) });
	    this.connect();
	  },

	  request: function(messages) {
	    this._pending = this._pending || new Faye.Set();
	    for (var i = 0, n = messages.length; i < n; i++) this._pending.add(messages[i]);

	    var promise = new Faye.Promise();

	    this.callback(function(socket) {
	      if (!socket || socket.readyState !== 1) return;
	      socket.send(Faye.toJSON(messages));
	      Faye.Promise.fulfill(promise, socket);
	    }, this);

	    this.connect();

	    return {
	      abort: function() { promise.then(function(ws) { ws.close() }) }
	    };
	  },

	  connect: function() {
	    if (Faye.Transport.WebSocket._unloaded) return;

	    this._state = this._state || this.UNCONNECTED;
	    if (this._state !== this.UNCONNECTED) return;
	    this._state = this.CONNECTING;

	    var socket = this._createSocket();
	    if (!socket) return this.setDeferredStatus('failed');

	    var self = this;

	    socket.onopen = function() {
	      if (socket.headers) self._storeCookies(socket.headers['set-cookie']);
	      self._socket = socket;
	      self._state = self.CONNECTED;
	      self._everConnected = true;
	      self._ping();
	      self.setDeferredStatus('succeeded', socket);
	    };

	    var closed = false;
	    socket.onclose = socket.onerror = function() {
	      if (closed) return;
	      closed = true;

	      var wasConnected = (self._state === self.CONNECTED);
	      socket.onopen = socket.onclose = socket.onerror = socket.onmessage = null;

	      delete self._socket;
	      self._state = self.UNCONNECTED;
	      self.removeTimeout('ping');
	      self.setDeferredStatus('unknown');

	      var pending = self._pending ? self._pending.toArray() : [];
	      delete self._pending;

	      if (wasConnected) {
	        self._handleError(pending, true);
	      } else if (self._everConnected) {
	        self._handleError(pending);
	      } else {
	        self.setDeferredStatus('failed');
	      }
	    };

	    socket.onmessage = function(event) {
	      var replies = JSON.parse(event.data);
	      if (!replies) return;

	      replies = [].concat(replies);

	      for (var i = 0, n = replies.length; i < n; i++) {
	        if (replies[i].successful === undefined) continue;
	        self._pending.remove(replies[i]);
	      }
	      self._receive(replies);
	    };
	  },

	  close: function() {
	    if (!this._socket) return;
	    this._socket.close();
	  },

	  _createSocket: function() {
	    var url        = Faye.Transport.WebSocket.getSocketUrl(this.endpoint),
	        headers    = this._dispatcher.headers,
	        extensions = this._dispatcher.wsExtensions,
	        cookie     = this._getCookies(),
	        tls        = this._dispatcher.tls,
	        options    = {extensions: extensions, headers: headers, proxy: this._proxy, tls: tls};

	    if (cookie !== '') options.headers['Cookie'] = cookie;

	    if (Faye.WebSocket)        return new Faye.WebSocket.Client(url, [], options);
	    if (Faye.ENV.MozWebSocket) return new MozWebSocket(url);
	    if (Faye.ENV.WebSocket)    return new WebSocket(url);
	  },

	  _ping: function() {
	    if (!this._socket) return;
	    this._socket.send('[]');
	    this.addTimeout('ping', this._dispatcher.timeout / 2, this._ping, this);
	  }

	}), {
	  PROTOCOLS: {
	    'http:':  'ws:',
	    'https:': 'wss:'
	  },

	  create: function(dispatcher, endpoint) {
	    var sockets = dispatcher.transports.websocket = dispatcher.transports.websocket || {};
	    sockets[endpoint.href] = sockets[endpoint.href] || new this(dispatcher, endpoint);
	    return sockets[endpoint.href];
	  },

	  getSocketUrl: function(endpoint) {
	    endpoint = Faye.copyObject(endpoint);
	    endpoint.protocol = this.PROTOCOLS[endpoint.protocol];
	    return Faye.URI.stringify(endpoint);
	  },

	  isUsable: function(dispatcher, endpoint, callback, context) {
	    this.create(dispatcher, endpoint).isUsable(callback, context);
	  }
	});

	Faye.extend(Faye.Transport.WebSocket.prototype, Faye.Deferrable);
	Faye.Transport.register('websocket', Faye.Transport.WebSocket);

	if (Faye.Event && Faye.ENV.onbeforeunload !== undefined)
	  Faye.Event.on(Faye.ENV, 'beforeunload', function() {
	    Faye.Transport.WebSocket._unloaded = true;
	  });

	Faye.Transport.EventSource = Faye.extend(Faye.Class(Faye.Transport, {
	  initialize: function(dispatcher, endpoint) {
	    Faye.Transport.prototype.initialize.call(this, dispatcher, endpoint);
	    if (!Faye.ENV.EventSource) return this.setDeferredStatus('failed');

	    this._xhr = new Faye.Transport.XHR(dispatcher, endpoint);

	    endpoint = Faye.copyObject(endpoint);
	    endpoint.pathname += '/' + dispatcher.clientId;

	    var socket = new EventSource(Faye.URI.stringify(endpoint)),
	        self   = this;

	    socket.onopen = function() {
	      self._everConnected = true;
	      self.setDeferredStatus('succeeded');
	    };

	    socket.onerror = function() {
	      if (self._everConnected) {
	        self._handleError([]);
	      } else {
	        self.setDeferredStatus('failed');
	        socket.close();
	      }
	    };

	    socket.onmessage = function(event) {
	      self._receive(JSON.parse(event.data));
	    };

	    this._socket = socket;
	  },

	  close: function() {
	    if (!this._socket) return;
	    this._socket.onopen = this._socket.onerror = this._socket.onmessage = null;
	    this._socket.close();
	    delete this._socket;
	  },

	  isUsable: function(callback, context) {
	    this.callback(function() { callback.call(context, true) });
	    this.errback(function() { callback.call(context, false) });
	  },

	  encode: function(messages) {
	    return this._xhr.encode(messages);
	  },

	  request: function(messages) {
	    return this._xhr.request(messages);
	  }

	}), {
	  isUsable: function(dispatcher, endpoint, callback, context) {
	    var id = dispatcher.clientId;
	    if (!id) return callback.call(context, false);

	    Faye.Transport.XHR.isUsable(dispatcher, endpoint, function(usable) {
	      if (!usable) return callback.call(context, false);
	      this.create(dispatcher, endpoint).isUsable(callback, context);
	    }, this);
	  },

	  create: function(dispatcher, endpoint) {
	    var sockets = dispatcher.transports.eventsource = dispatcher.transports.eventsource || {},
	        id      = dispatcher.clientId;

	    var url = Faye.copyObject(endpoint);
	    url.pathname += '/' + (id || '');
	    url = Faye.URI.stringify(url);

	    sockets[url] = sockets[url] || new this(dispatcher, endpoint);
	    return sockets[url];
	  }
	});

	Faye.extend(Faye.Transport.EventSource.prototype, Faye.Deferrable);
	Faye.Transport.register('eventsource', Faye.Transport.EventSource);

	Faye.Transport.XHR = Faye.extend(Faye.Class(Faye.Transport, {
	  encode: function(messages) {
	    return Faye.toJSON(messages);
	  },

	  request: function(messages) {
	    var href = this.endpoint.href,
	        xhr  = Faye.ENV.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest(),
	        self = this;

	    xhr.open('POST', href, true);
	    xhr.setRequestHeader('Content-Type', 'application/json');
	    xhr.setRequestHeader('Pragma', 'no-cache');
	    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

	    var headers = this._dispatcher.headers;
	    for (var key in headers) {
	      if (!headers.hasOwnProperty(key)) continue;
	      xhr.setRequestHeader(key, headers[key]);
	    }

	    var abort = function() { xhr.abort() };
	    if (Faye.ENV.onbeforeunload !== undefined) Faye.Event.on(Faye.ENV, 'beforeunload', abort);

	    xhr.onreadystatechange = function() {
	      if (!xhr || xhr.readyState !== 4) return;

	      var replies    = null,
	          status     = xhr.status,
	          text       = xhr.responseText,
	          successful = (status >= 200 && status < 300) || status === 304 || status === 1223;

	      if (Faye.ENV.onbeforeunload !== undefined) Faye.Event.detach(Faye.ENV, 'beforeunload', abort);
	      xhr.onreadystatechange = function() {};
	      xhr = null;

	      if (!successful) return self._handleError(messages);

	      try {
	        replies = JSON.parse(text);
	      } catch (e) {}

	      if (replies)
	        self._receive(replies);
	      else
	        self._handleError(messages);
	    };

	    xhr.send(this.encode(messages));
	    return xhr;
	  }
	}), {
	  isUsable: function(dispatcher, endpoint, callback, context) {
	    callback.call(context, Faye.URI.isSameOrigin(endpoint));
	  }
	});

	Faye.Transport.register('long-polling', Faye.Transport.XHR);

	Faye.Transport.CORS = Faye.extend(Faye.Class(Faye.Transport, {
	  encode: function(messages) {
	    return 'message=' + encodeURIComponent(Faye.toJSON(messages));
	  },

	  request: function(messages) {
	    var xhrClass = Faye.ENV.XDomainRequest ? XDomainRequest : XMLHttpRequest,
	        xhr      = new xhrClass(),
	        id       = ++Faye.Transport.CORS._id,
	        headers  = this._dispatcher.headers,
	        self     = this,
	        key;

	    xhr.open('POST', Faye.URI.stringify(this.endpoint), true);

	    if (xhr.setRequestHeader) {
	      xhr.setRequestHeader('Pragma', 'no-cache');
	      for (key in headers) {
	        if (!headers.hasOwnProperty(key)) continue;
	        xhr.setRequestHeader(key, headers[key]);
	      }
	    }

	    var cleanUp = function() {
	      if (!xhr) return false;
	      Faye.Transport.CORS._pending.remove(id);
	      xhr.onload = xhr.onerror = xhr.ontimeout = xhr.onprogress = null;
	      xhr = null;
	    };

	    xhr.onload = function() {
	      var replies = null;
	      try {
	        replies = JSON.parse(xhr.responseText);
	      } catch (e) {}

	      cleanUp();

	      if (replies)
	        self._receive(replies);
	      else
	        self._handleError(messages);
	    };

	    xhr.onerror = xhr.ontimeout = function() {
	      cleanUp();
	      self._handleError(messages);
	    };

	    xhr.onprogress = function() {};

	    if (xhrClass === Faye.ENV.XDomainRequest)
	      Faye.Transport.CORS._pending.add({id: id, xhr: xhr});

	    xhr.send(this.encode(messages));
	    return xhr;
	  }
	}), {
	  _id:      0,
	  _pending: new Faye.Set(),

	  isUsable: function(dispatcher, endpoint, callback, context) {
	    if (Faye.URI.isSameOrigin(endpoint))
	      return callback.call(context, false);

	    if (Faye.ENV.XDomainRequest)
	      return callback.call(context, endpoint.protocol === Faye.ENV.location.protocol);

	    if (Faye.ENV.XMLHttpRequest) {
	      var xhr = new Faye.ENV.XMLHttpRequest();
	      return callback.call(context, xhr.withCredentials !== undefined);
	    }
	    return callback.call(context, false);
	  }
	});

	Faye.Transport.register('cross-origin-long-polling', Faye.Transport.CORS);

	Faye.Transport.JSONP = Faye.extend(Faye.Class(Faye.Transport, {
	 encode: function(messages) {
	    var url = Faye.copyObject(this.endpoint);
	    url.query.message = Faye.toJSON(messages);
	    url.query.jsonp   = '__jsonp' + Faye.Transport.JSONP._cbCount + '__';
	    return Faye.URI.stringify(url);
	  },

	  request: function(messages) {
	    var head         = document.getElementsByTagName('head')[0],
	        script       = document.createElement('script'),
	        callbackName = Faye.Transport.JSONP.getCallbackName(),
	        endpoint     = Faye.copyObject(this.endpoint),
	        self         = this;

	    endpoint.query.message = Faye.toJSON(messages);
	    endpoint.query.jsonp   = callbackName;

	    var cleanup = function() {
	      if (!Faye.ENV[callbackName]) return false;
	      Faye.ENV[callbackName] = undefined;
	      try { delete Faye.ENV[callbackName] } catch (e) {}
	      script.parentNode.removeChild(script);
	    };

	    Faye.ENV[callbackName] = function(replies) {
	      cleanup();
	      self._receive(replies);
	    };

	    script.type = 'text/javascript';
	    script.src  = Faye.URI.stringify(endpoint);
	    head.appendChild(script);

	    script.onerror = function() {
	      cleanup();
	      self._handleError(messages);
	    };

	    return {abort: cleanup};
	  }
	}), {
	  _cbCount: 0,

	  getCallbackName: function() {
	    this._cbCount += 1;
	    return '__jsonp' + this._cbCount + '__';
	  },

	  isUsable: function(dispatcher, endpoint, callback, context) {
	    callback.call(context, true);
	  }
	});

	Faye.Transport.register('callback-polling', Faye.Transport.JSONP);

	})();
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(13).setImmediate, __webpack_require__(1)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// DOM APIs, for completeness

	if (typeof setTimeout !== 'undefined') exports.setTimeout = function() { return setTimeout.apply(window, arguments); };
	if (typeof clearTimeout !== 'undefined') exports.clearTimeout = function() { clearTimeout.apply(window, arguments); };
	if (typeof setInterval !== 'undefined') exports.setInterval = function() { return setInterval.apply(window, arguments); };
	if (typeof clearInterval !== 'undefined') exports.clearInterval = function() { clearInterval.apply(window, arguments); };

	// TODO: Change to more effiecient list approach used in Node.js
	// For now, we just implement the APIs using the primitives above.

	exports.enroll = function(item, delay) {
	  item._timeoutID = setTimeout(item._onTimeout, delay);
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._timeoutID);
	};

	exports.active = function(item) {
	  // our naive impl doesn't care (correctness is still preserved)
	};

	exports.setImmediate = __webpack_require__(14).nextTick;


/***/ },
/* 14 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    if (canPost) {
	        var queue = [];
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	}

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ }
/******/ ])
});
;