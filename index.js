'use strict';
var url = require('url');
var React = require('react');
var Router = require('react-router');
var debug = require('debug')('connect-react-router-middleware');
function defaultTemplate(html) {
  return '<!doctype html>' + html;
}

module.exports = function configureReactRouterMiddleware(options) {
  var routes = options.routes;
  var template = options.template || defaultTemplate;
  if (!routes) {
    throw new Error('Router middleware requires `routes` option');
  }
  return function reactRouterMiddleware(request, response, next) {
    var requestURL = url.parse(request.url);
    debug('Parsing request: ' + requestURL.pathname);
    Router.run(routes, requestURL.pathname, function handleReactRouterRoute(Handler) {
      if (!Handler) {
        return next();
      }
      try {
        var markup = React.renderToString(React.createElement(Handler, null));
        debug('Writing response ' + markup);
        response.end(template(markup));
      } catch(error) {
        next(error);
      }
    });
  };
};
