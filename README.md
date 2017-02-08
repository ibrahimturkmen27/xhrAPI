# xhrRequest [![Build Status][travis-image]][travis-url]
[travis-image]:https://travis-ci.org/ibrahimturkmen27/xhrAPI.svg?branch=master
[travis-url]:https://travis-ci.org/ibrahimturkmen27/xhrAPI
An XHR library that is using proxy object and returns promise as the response of the server. 
# Usage
```javascript
"use strict";
const xhrAPI = require(xhrrequest);
const options = { 
                  query: "anyQuery",                  // {"key1": "value2", "key2": "value2"}
                  header: {"anyType": "anyHeader"},
                  data: "anyData"                     // array or object
                };
xhrAPI.anyMethod("url", options);
```
# Test
[sinon.js](http://sinonjs.org/) and [jest](https://facebook.github.io/jest/) testing frameworks were used for testing this library. 
To run the test, enter <b>npm t</b> command to the terminal.
