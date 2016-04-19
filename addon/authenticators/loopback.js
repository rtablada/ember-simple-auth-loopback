/* jscs:disable requireDotNotation */
import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const { RSVP, isEmpty, run, computed } = Ember;
const assign = Ember.assign || Ember.merge;

/**
  Authenticator that works with Loopback's default authentication

  @class LoopbackAuthenticator
  @module ember-simple-auth-loopback/authenticators/loopback
  @extends BaseAuthenticator
  @public
*/
export default BaseAuthenticator.extend({
  /**
    The endpoint on the server that authentication and token refresh requests
    are sent to.

    @property loginEndpoint
    @type String
    @default '/token'
    @public
  */
  loginEndpoint: '/User/login',

  /**
    The endpoint on the server that token revocation requests are sent to. Only
    set this if the server actually supports token revokation. If this is
    `null`, the authenticator will not revoke tokens on session invalidation.

    __If token revocation is enabled but fails, session invalidation will be
    intercepted and the session will remain authenticated (see
    {{#crossLink "OAuth2PasswordGrantAuthenticator/invalidate:method"}}{{/crossLink}}).__

    @property logoutEndpoint
    @type String
    @default null
    @public
  */
  logoutEndpoint: null,

  /**
    Restores the session from a session data object; __will return a resolving
    promise when there is a non-empty `id` in the session data__ and
    a rejecting promise otherwise.

    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
    @public
  */
  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (isEmpty(data['id'])) {
        reject();
      } else {
        resolve(data);
      }
    });
  },

  /**
    Authenticates the session with the specified `username`, and `password`;
    issues a `POST` request to the loginEndpoint.

    __If the credentials are valid and thus authentication succeeds,
    a promise that resolves with the server's response is returned__,
    otherwise a promise that rejects with the
    error as returned by the server is returned.

    @method authenticate
    @param {String} username The resource owner username
    @param {String} password The resource owner password
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
    @public
  */
  authenticate(email, password, scope = []) {
    return new RSVP.Promise((resolve, reject) => {
      const data = { email, password };
      const loginEndpoint = this.get('loginEndpoint');

      this.makeRequest(loginEndpoint, data).then((response) => {
        run(() => {
          resolve(response);
        });
      }, (xhr) => {
        run(null, reject, xhr.responseJSON || xhr.responseText);
      });
    });
  },

  /**
    If token revocation is enabled, this will revoke the access token (and the
    refresh token if present). If token revocation succeeds, this method
    returns a resolving promise, otherwise it will return a rejecting promise,
    thus intercepting session invalidation.

    If token revocation is not enabled this method simply returns a resolving
    promise.

    @method invalidate
    @param {Object} data The current authenticated session data
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
    @public
  */
  invalidate(data) {
    const logoutEndpoint = this.get('logoutEndpoint');
    function success(resolve) {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      resolve();
    }
    return new RSVP.Promise((resolve) => {
      if (isEmpty(logoutEndpoint)) {
        success.apply(this, [resolve]);
      } else {
        const requests = [];
        Ember.A(['id']).forEach((tokenType) => {
          const token = data[tokenType];
          if (!isEmpty(token)) {
            requests.push(this.makeRequest(logoutEndpoint, {
              'token_type_hint': tokenType, token
            }));
          }
        });
        const succeed = () => {
          success.apply(this, [resolve]);
        };
        RSVP.all(requests).then(succeed, succeed);
      }
    });
  },

  /**
    Makes a request to the OAuth 2.0 server.

    @method makeRequest
    @param {String} url The request URL
    @param {Object} data The request data
    @return {jQuery.Deferred} A promise like jQuery.Deferred as returned by `$.ajax`
    @protected
  */
  makeRequest(url, data) {
    const options = {
      url,
      data: JSON.stringify(data),
      type:        'POST',
      dataType:    'json',
      contentType: 'application/json'
    };

    return Ember.$.ajax(options);
  },
});
