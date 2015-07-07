'use strict';
/* global chai: true */
describe('connect-react-router-middleware', function () {
  var middleware = require('../');
  it('throws an error if options.routes is not given', function () {
    middleware.bind(null, {}).should.throw('Router middleware requires `routes` option');
  });

  it('returns a function', function () {
    middleware({
      routes: {},
    }).should.be.a('function').and.have.lengthOf(3);
  });

  describe('middleware handler', function () {
    var Router = require('react-router');
    var routes;
    var handler;
    var request;
    var response;
    var next;
    beforeEach(function () {
      routes = {};
      handler = middleware({ routes: routes });
      Router.run = chai.spy('Router.run');
      request = { url: '/path/to/thing?foo' };
      response = { end: chai.spy('response.end') };
      next = chai.spy('next');
    });

    it('calls Router.run with routes, url and callback', function () {
      handler(request, response, next);
      Router.run
        .should.have.been.called.exactly(1)
        .and.called.with(routes, '/path/to/thing');
      /* eslint no-underscore-dangle: 0 */
      Router.run.__spy.calls[0][2].should.be.a('function');
    });

    describe('Router.run callback', function () {
      var React = require('react');
      var routeReturn;
      var reactRenderReturn;
      var reactCreateReturn;
      beforeEach(function () {
        Router.run = chai.spy('Router.run', function (a, b, cb) {
          cb(routeReturn);
        });
        React.renderToString = chai.spy('React.renderToString', function () {
          return reactRenderReturn;
        });
        React.createElement = chai.spy('React.createElement', function () {
          return reactCreateReturn;
        });
      });

      it('calls next() if first argument empty', function () {
        routeReturn = null;
        handler(request, response, next);
        next
          .should.have.been.called.exactly(1);
      });

      it('calls React.createElement() with first argument', function () {
        routeReturn = {};
        handler(request, response, next);
        React.createElement
          .should.have.been.called.exactly(1)
          .and.been.called.with(routeReturn);
        next.should.not.have.been.called();
      });

      it('calls next(err) if React.createElement throws', function () {
        var error = new Error();
        React.createElement = function () {
          throw error;
        };
        handler(request, response, next);
        next
          .should.have.been.called.exactly(1)
          .and.called.with(error);
      });

      it('calls React.renderToString() with React.createElement result', function () {
        reactCreateReturn = {};
        handler(request, response, next);
        React.renderToString
          .should.have.been.called.exactly(1)
          .and.been.called.with(reactCreateReturn);
        next.should.not.have.been.called();
      });

      it('calls next(err) if React.renderToString throws', function () {
        var error = new Error();
        React.renderToString = function () {
          throw error;
        };
        handler(request, response, next);
        next
          .should.have.been.called.exactly(1)
          .and.called.with(error);
      });

      describe('with default template function', function () {
        it('calls response.end with React.renderToString result, prepended with doctype', function () {
          reactRenderReturn = '<div>Hello world</div>';
          handler(request, response, next);
          response.end
            .should.have.been.called.exactly(1)
            .and.been.called.with('<!doctype html><div>Hello world</div>');
          reactRenderReturn = '<div>Goodbye world</div>';
          handler(request, response, next);
          response.end
            .should.have.been.called.with('<!doctype html><div>Goodbye world</div>');
          next.should.not.have.been.called();
        });
      });

      describe('with custom template function', function () {
        var templateFunction;
        var templateReturn;
        beforeEach(function () {
          templateFunction = chai.spy('templateFunction', function () {
            return templateReturn;
          });
          handler = middleware({ routes: routes, template: templateFunction });
        });

        it('calls templateFunction with React.renderToString result', function () {
          reactRenderReturn = {};
          handler(request, response, next);
          templateFunction
            .should.have.been.called.exactly(1)
            .and.been.called.with(reactRenderReturn);
          next.should.not.have.been.called();
        });

        it('calls response.end with templateFunction return result', function () {
          templateReturn = {};
          handler(request, response, next);
          response.end
            .should.have.been.called.exactly(1)
            .and.been.called.with(templateReturn);
          next.should.not.have.been.called();
        });

        it('calls next(err) if res.end() throws', function () {
          var error = new Error();
          response.end = function () {
            throw error;
          };
          handler(request, response, next);
          next
            .should.have.been.called.exactly(1)
            .and.called.with(error);
        });
      });
    });
  });
});
