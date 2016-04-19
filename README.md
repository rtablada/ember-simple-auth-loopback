# Ember-simple-auth-loopback

This package allows integration with the default authorization tokens used with Strongloop's Loopback servers.

## Installation

```
ember install ember-simple-auth ember-simple-auth-loopback
```

## Use

This addon provides an authenticator to login users and store their session.

First create an `authenticators/application.js` file with the following:

```js
import Loopback from 'ember-simple-auth-loopback/authenticators/loopback';

export default Loopback.extend({
  loginEndpoint: 'http://0.0.0.0:3000/api/Users/login',
});
```

Then use this from a controller (or route):

```js
session: Ember.inject.service(),

login(email, password) {
  this.get('session').authenticate('authenticator:application', email, password)
    .catch((reason) => {
      console.log(reason);
    });
}
```

And, in the template:

```htmlbars
<form {{action login email password}}>
  <p>
    <label>Email</label>
    {{input value=email}}
  </p>

  <p>
    <label>Password</label>
    {{input value=password type="password"}}
  </p>

  <button>Submit</button>
</form>
```

## Authorizing API Requests

Once logged in, API requests will need to be authorized using the token sent back from the login request.
To do this, first setup an `app/authorizers/application.js`:

```js
import Loopback from 'ember-simple-auth-loopback/authorizers/loopback';

export default Loopback.extend();
```

Then, in the `app/adapters/application.js`, use the `DataAdapterMixin` from `ember-simple-auth`:

```js
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:application',

  host: 'http://localhost:3000',
  namespace: 'api',
});
```
