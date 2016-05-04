/* jscs:disable requireDotNotation */
import Ember from 'ember';
import Base from 'ember-simple-auth/authorizers/base';

const { isEmpty } = Ember;

/**
  Authorizer that sets headers to communicated with Loopback servers

  ```
  Authorization: 234rtgjneroigne4
  ```

  @class LoopbackAuthorizer
  @module ember-simple-auth-loopback/authorizers/loopback
  @extends BaseAuthorizer
  @public
*/
export default Base.extend({
  /**
    Includes the access token (`id`) from the session data into the `Authorization`
    header

    ```
    Authorization: 234rtgjneroigne4
    ```

    @method authorize
    @param {Object} data The data that the session currently holds
    @param {Function} block(headerName,headerContent) The callback to call with the authorization data; will receive the header name and header content as arguments
    @public
  */
  authorize(data, block) {
    const accessToken = data['id'] || data['code'] || data['access_token'];

    if (!isEmpty(accessToken)) {
      block('Authorization', accessToken);
    }
  }
});
