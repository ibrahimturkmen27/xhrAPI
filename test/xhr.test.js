

const {xhrAPI, xhrWorker} = require("../app/xhr");
const sinon = require("sinon");


describe("xhrWorker", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("open method", () => {
    let stubOpen;
    beforeEach(() => {
      stubOpen = sandbox.stub(XMLHttpRequest.prototype, "open");
      sandbox.stub(XMLHttpRequest.prototype, "send");
    });
    it("should be called when request is sent", () => {
      xhrAPI.anyMethod("anyURL");
      sinon.assert.called(stubOpen);
    });

    it("should be called with correct parameters when request is sent", () => {
      const options = {
        query: {}
      };
      sandbox.stub(xhrWorker, "query").returns("?lalala");
      xhrAPI.anyMethod("anyURL", options);
      sinon.assert.calledWith(stubOpen, "ANYMETHOD", "anyURL?lalala", true);
    });

    describe("when open method is called, query function", () => {
      let stubQuery;
      let options;
      beforeEach(() => {
        stubQuery = sandbox.stub(xhrWorker, "query");
        options = {
          query: "dummyQuery"
        };
      });
      it("should be called", () => {
        xhrAPI.anyMethod("anyURL", options);
        sinon.assert.called(stubQuery);
      });

      it("should be called with correct parameter", () => {
        xhrAPI.anyMethod("anyURL", options);
        sinon.assert.calledWith(stubQuery, "dummyQuery");
      });
    });

    describe("when open method is called, header function", () => {
      let stubHeader;
      let options;
      let request;
      let xhr;
      beforeEach(() => {
        xhr = sinon.useFakeXMLHttpRequest();
        window.XMLHttpRequest = global.XMLHttpRequest;
        xhr.onCreate = function(req) {
          request = req;
        };
        stubHeader = sandbox.stub(xhrWorker, "header");
        options = {
          header: {"Content-Type": "application/json"}
        };
      });
      it("should be called ", () => {
        xhrAPI.anyMethod("anyURL", options);
        sinon.assert.called(stubHeader);
      });

      it("should be called with correct parameter", () => {
        xhrAPI.anyMethod("anyURL", options);

        sinon.assert.calledWith(stubHeader, request, options.header);
      });
    });
  });

  describe("send method", () => {
    let stubSend;
    beforeEach(() => {
      stubSend = sandbox.stub(XMLHttpRequest.prototype, "send");
    });

    it("should be called when request is sent", () => {
      xhrAPI.anyMethod("anyURL");
      sinon.assert.called(stubSend);
    });

    it("should be called with correct parameter when request is sent", () => {
      let options = {
        data: "dummyData"
      };
      xhrAPI.anyMethod("anyURL", options);
      sinon.assert.calledWith(stubSend, "dummyData");
    });
    describe("when send method is called, listen function", () => {
      let stubListen;
      let xhr;
      let request;
      beforeEach(() => {
        xhr = sinon.useFakeXMLHttpRequest();
        window.XMLHttpRequest = global.XMLHttpRequest;
        xhr.onCreate = function(req) {
          request = req;
        };
        stubListen = sandbox.stub(xhrWorker, "listen");
      });

      afterEach(() => {
        window.XMLHttpRequest = global.XMLHttpRequest;
      });
      it("should be called ", () => {
        xhrAPI.anyMethod("anyURL");
        sinon.assert.called(stubListen);
      });
      it("should be called with correct parameter", () => {
        xhrAPI.anyMethod("anyURL");
        sinon.assert.calledWith(stubListen, request);
      });
    });
  });

  describe("query function", () => {
    let result;
    it("should return emptyString when it is called no parameter", () => {
      result = xhrWorker.query({});
      expect(result).toEqual("");
    });

    it("should return resolved queryData when it is called parameter", () => {
      let query = {name: "dummyData"};
      result = xhrWorker.query(query);
      expect(result).toEqual("?name=dummyData");
    });
  });

  describe("header function", () => {
    let fakeXhr;
    let stubHeader;
    beforeEach(() => {
      fakeXhr = {
        setRequestHeader: function() {
        }
      };
      stubHeader = sandbox.stub(fakeXhr, "setRequestHeader", function() {
      });
    });
    it("should be called setRequestHeader when header function called", () => {
      let options = {
        "Content-type": "dummyHeader"
      };
      xhrWorker.header(fakeXhr, options);
      sinon.assert.called(stubHeader);
    });

    it("should be called setRequestHeader with parameter when header function called", () => {
      let options = {
        "Content-type": "dummyHeader"
      };
      xhrWorker.header(fakeXhr, options);
      sinon.assert.calledWith(stubHeader, "Content-type", "dummyHeader");
    });
  });

  describe("listen function", () => {
    let fakeXhr;

    it("should resolve the returned promise when xhr status 200", () => {
      fakeXhr = {onload: sandbox.spy(), status: 200, response: "dummyData"};
      let results = xhrWorker.listen(fakeXhr);
      fakeXhr.onload();
      return results.then((result) => expect(result).toEqual("dummyData"));
    });

    it("should reject the returned promise when xhr status 400", () => {
      fakeXhr = {onload: sandbox.spy(), status: 400, response: "dummyData"};
      let result = xhrWorker.listen(fakeXhr);
      fakeXhr.onload();
      return result.then(() => {}).catch((error) => expect(error).toEqual("dummyData"));
    });

    it("should reject the returned promise when get's bad request", () => {
      fakeXhr = {onload: sandbox.stub(), onerror: sandbox.spy(), status: "badRequest", response: "badRequest"};
      let result = xhrWorker.listen(fakeXhr);
      fakeXhr.onerror();
      return result.then(() => {}).catch((error) => expect(error).toEqual("badRequest"));
    });
  });
});
describe("XHR Component", () => {
  let server;
  beforeEach(() => {
    server = sinon.fakeServer.create();
  });
  afterEach(() => {
    server.restore();
  });

  describe("Any Method", () => {
    let jsString = JSON.stringify({name: "xhrTest"});

    it("should resolve the returned promise with status code 200", () => {
      server.respondWith("ANY", "/article",
                [200, {"Content-Type": "application/json"}, jsString]);
      let myRequest = xhrAPI.any("/article").then(data => expect(data).toEqual(jsString));
      server.respond();
      return myRequest;
    });

    it("should reject the returned promise when get's bad request ", () => {
      server.respondWith("ANY", "/article",
                [200, {"Content-Type": "application/json"}, '[{ "name": "xhrTest" "decribe": "badRequest"}]']);
      let myRequest = xhrAPI.any("/article").then(data => expect(data).toEqual("badRequest")).catch(() => {});
      server.respond();
      return myRequest;
    });

    describe("reject the returned promise ", ()=> {
      it("when status code 404", () => {
        server.respondWith("ANY", "/article",
                    [404, {"Content-Type": "application/json"}, jsString]);
        let myRequest = xhrAPI.any("/article").then(() => {}).catch(data => expect(data).toEqual(jsString));
        server.respond();
        return myRequest;
      });

      it("when status code 500", () => {
        server.respondWith("ANY", "/article",
                    [500, {"Content-Type": "application/json"}, jsString]);
        let myRequest = xhrAPI.any("/article").then(() => {}).catch(data => expect(data).toEqual(jsString));
        server.respond();
        return myRequest;
      });
    });
  });

  describe("ANY Method With Data", () => {
    let jsString = JSON.stringify({name: "xhrTest"});

    it("should resolve the returned promise with status code 200", () => {
      server.respondWith("ANY", "/example",
                [200, {"Content-Type": "application/json"}, jsString]);
      let options = {
        data: 7
      };
      let myRequest = xhrAPI.any("/example", options).then(data => expect(data).toEqual(jsString));
      let bodyData = server.requests[0].requestBody;
      expect(bodyData).toEqual(options.data);
      server.respond();
      return myRequest;
    });

    it("should reject the returned promise when get's bad request ", () => {
      server.respondWith("ANY", "/example",
                [200, {"Content-Type": "application/json"}, '[{ "name": "xhrTest" "decribe": "badRequest" }]']);
      let options = {
        data: 9
      };
      let myRequest = xhrAPI.any("/example", options).then(data => expect(data).toEqual('[{ "name": "xhrTest"}]')).catch(() => {});
      let bodyData = server.requests[0].requestBody;
      expect(bodyData).toEqual(options.data);
      server.respond();
      return myRequest;
    });

    describe("reject the returned promise ", ()=> {
      it("when status code 404", () => {
        server.respondWith("ANY", "/example",
                    [404, {"Content-Type": "application/json"}, jsString]);
        let options = {
          data: 5
        };
        let myRequest = xhrAPI.any("/example", options).then(() => {}).catch(data => expect(data).toEqual(jsString));
        let bodyData = server.requests[0].requestBody;
        expect(bodyData).toEqual(options.data);
        server.respond();
        return myRequest;
      });

      it("when status code 500", () => {
        server.respondWith("ANY", "/example",
                    [500, {"Content-Type": "application/json"}, jsString]);
        let options = {
          data: 3
        };
        let myRequest = xhrAPI.any("/example", options).then(() => {}).catch(data => expect(data).toEqual(jsString));
        let bodyData = server.requests[0].requestBody;
        expect(bodyData).toEqual(options.data);
        server.respond();
        return myRequest;
      });
    });
  });
});
