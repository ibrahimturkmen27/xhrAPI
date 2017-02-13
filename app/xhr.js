
const xhrWorker = {

  header: function(xhr, headerData) {
    const headers = headerData || {};
    Object.keys(headers).forEach(header => xhr.setRequestHeader(header, headers[header]));
  },

  query: function(queryData) {
    const queries = queryData || {};
    let queryString = "?";
    Object.keys(queries).forEach(query => (
      queryString += (encodeURIComponent(query) + "=" + encodeURIComponent(queryData[query]) + "&"))
    );
    return queryString.slice(0, queryString.length - 1);
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

      xhr.open(methodName, url + xhrWorker.query(options.query), true);
      xhrWorker.header(xhr, options.header);
      xhr.send(options.data);
      return xhrWorker.listen(xhr);
    };
  }
};


const xhrAPI = new Proxy({}, handler);
module.exports = {xhrAPI, xhrWorker};


