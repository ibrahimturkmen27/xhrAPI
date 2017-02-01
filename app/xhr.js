
const xhrAPI = {

  header: function(xhr, headerData) {
    const headers = headerData || {};
    Object.keys(headers).forEach(header => xhr.setRequestHeader(header, headers[header]));
  },

  query: function(queryData) {
    const queries = queryData || {};
    let queryString = "?";
    Object.keys(queries).forEach(query => (queryString += (encodeURIComponent(query) + "=" + encodeURIComponent(queryData[query]) + "&")));
    queryString = queryString.slice(0, queryString.length - 1);
    return queryString;
  },

  listen: function(xhr) {
    return new Promise((resolve, reject) => {
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(xhr.response);
        } else if (xhr.status < 200 || xhr.status >= 400) {
          reject(xhr.response);
        }
      };
      xhr.onerror = function() {
        reject(xhr.status);
      };
    });
  }
};

const handler = {
  get: function(target, method) {
    return method in target ? target[method] : function(url, customOptions) {
      let methodName = method.toUpperCase();
      let xhr = new XMLHttpRequest();
      let defaultOptions = {
        header: {},
        query: {},
        data: {}
      };
      const options = Object.assign({}, defaultOptions, customOptions);

      xhr.open(methodName, url + xhrAPI.query(options.query), true);
      xhrAPI.header(xhr, options.header);
      xhr.send(options.data);
      return xhrAPI.listen(xhr);
    };
  }
};


const xhrRequest = new Proxy({}, handler);
module.exports = {xhrRequest, xhrAPI};


