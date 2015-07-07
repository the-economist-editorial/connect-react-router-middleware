# connect-react-router-middleware

This is a [connect middleware][] (can be used with express, or plain old
`require('http')` as long as you give it a next function) that channels routes through
[react-router][]. Simply specify Routes as you would normally through React Router,
and pass them to this middleware, and it'll render any React routes that match the
server path.

### Example

```js
var routes = (
  <Route path="/" handler={App}>
    <Route path="dashboard" handler={Dashboard}/>
    <Route path="account" handler={Account}/>
    <Route path="logout" handler={Logout}/>
  </Route>
)
var router = require('connect-react-router-middleware');
var app = require('connect')()
  .use(router({ routes: routes }));
```

### Options

#### `routes`

This is the route object to be passed to React Router's `Router.run`. The variable is
passed straight in, so whatever `Router.run` handles can be used.

#### `template`

This is a function to use as a template to wrap the results of rendering the React
Router handler, before sending to `response.send`. It is optional, by default it is a function which prepends `'<!doctype html>'` to the response. Example:

```js
var app = require('connect')()
  .use(router({ routes: routes, template: function (reactRenderResult) {
    // reactRenderResult is the return result of `React.renderToString(Handler)`
    return '<!doctype html>' +
      '<head>' +
        '<meta charset="utf-8">' +
      '</head>' +
      '<body>' +
        reactRenderResult +
      '</body>';
  }}));
```


[connect middleware]: https://github.com/senchalabs/connect
[react-router]: https://github.com/rackt/react-router
