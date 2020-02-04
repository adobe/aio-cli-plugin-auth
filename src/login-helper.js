/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const http = require('http')
const debug = require('debug')
const url = require('url')
const crypto = require('crypto')
const ora = require('ora')
const { cli } = require('cli-ux')

const AUTH_TIMEOUT_SECONDS = 120
const AUTH_URL = 'TODO://'

/**
 * Create a local server to wait for browser callback.
 *
 * @param {*} options
 */
async function createServer ({ hostname = '127.0.0.1', port = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const _url = new url.URL(req.url, `http://${req.headers.host}`)
      const queryData = _url.searchParams
      let state

      if (queryData && (state = queryData.get('state'))) {
        const resultData = JSON.parse(state)
        resultData.code = queryData.get('code')
        resolve(resultData)
      } else {
        reject(new Error('No query data to get the authorization code from'))
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('You are now logged in, you may close this window\n')

      server.close()
    })
    server.listen(port, hostname, () => {
      debug(`Login callback server running at http://${hostname}:${port}/`)
    })
  })
}

/**
 * Construct the auth site url with these query params.
 *
 * @param {*} queryParams
 */
function authSiteUrl (_url, queryParams) {
  const uri = new url.URL(_url)
  Object.keys(queryParams).forEach(key => {
    uri.searchParams.set(key, queryParams[key])
  })
  return uri.href
}

/**
 * Generates a random 4 character hex id.
 */
const randomId = () => crypto.randomBytes(4).toString('hex')

/**
 * Gets the access token for a logged in user.
 *
 * @param {object} config an object with config details
 * @param {integer} config.port the port number for the server
 * @param {integer} config.timeout the number of seconds to timeout in checking
 */
async function login (config) {
  const id = randomId()

  const uri = authSiteUrl(AUTH_URL, { id, port: config.port })
  const timeoutSeconds = config.timeout || AUTH_TIMEOUT_SECONDS

  return new Promise((resolve, reject) => {
    let spinner

    const timerId = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutSeconds} seconds.`))
      spinner.stop()
    }, timeoutSeconds * 1000)

    createServer({ port: (config.port || 8000) })
      .then(state => {
        if (state.code && state.id === id) {
          spinner.info('Exchanging auth code for token')
          clearTimeout(timerId)
          resolve(state.code)
        } else {
          clearTimeout(timerId)
          reject(new Error(`error code=${state.code}`))
        }
      })

    async function launch () {
      console.log('Visit this url to log in: ')
      cli.url(uri, uri)
      cli.open(uri)
      spinner = ora('Logging in').start()
    }
    launch()
  })
}

module.exports = {
  login
}
