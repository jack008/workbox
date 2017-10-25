/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import {_private} from 'workbox-core';
import core from 'workbox-core';

import './_version.mjs';

/**
 * An implementation of a
 * [network-only]{@link https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-only}
 * request strategy.
 *
 * This class is useful if you want to take advantage of the Workbox plugins.
 *
 * @memberof module:workbox-runtime-caching
 */
class NetworkOnly {
  /**
   * @param {Object} options
   * @param {string} options.cacheName Cache name to store and retrieve
   * requests. Defaults to cache names provided by `workbox-core`.
   * @param {string} options.plugins Workbox plugins you may want to use in
   * conjunction with this caching strategy.
   */
  constructor(options = {}) {
    this._cacheName =
      _private.cacheNames.getRuntimeName(options.cacheName);
    this._plugins = options.plugins || [];
  }

  /**
   * This method will be called by the Workbox
   * [Router]{@link module:workbox-routing.Router} to handle a fetch event.
   *
   * @param {Object} input
   * @param {FetchEvent} input.event The fetch event to handle.
   * @param {URL} input.url The URL of the request.
   * @param {Object} input.params Any params returned by `Routes` match
   * callback.
   * @return {Promise<Response>}
   */
  async handle({url, event, params}) {
    const logMessages = [];
    if (process.env.NODE_ENV !== 'production') {
      core.assert.isInstance(event, FetchEvent, {
        moduleName: 'workbox-runtime-caching',
        className: 'NetworkOnly',
        funcName: 'handle',
        paramName: 'event',
      });
    }

    const response = await _private.fetchWrapper.fetch(
      event.request,
      null,
      this._plugins
    );

    if (process.env.NODE_ENV !== 'production') {
      if (response) {
        logMessages.push(`A response was retrieved from the network with ` +
          `status code '${response.status}', this will be returned to the ` +
          `browser.`);
      } else {
        logMessages.push(`A response could not be retrieved from the ` +
          `network.`);
      }

      const urlObj = new URL(event.request.url);
      const urlToDisplay = urlObj.origin === location.origin ?
        urlObj.pathname : urlObj.href;
      _private.logger.groupCollapsed(`Using NetworkOnly to repond to ` +
        `'${urlToDisplay}'`);

        logMessages.forEach((msg) => {
          _private.logger.unprefixed.log(msg);
        });

      if (response) {
        _private.logger.groupCollapsed(`View the final response here.`);
        _private.logger.unprefixed.log(response);
        _private.logger.groupEnd();
      }

      _private.logger.groupEnd();
    }

    return response;
  }
}

export default NetworkOnly;
