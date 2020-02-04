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
 * Create a local server.
 *
 * @param {*} options
 */
async function createServer () {
  return new Promise(resolve => {
    const server = http.createServer()

    server.listen(0, '127.0.0.1')
    server.on('listening', () => {
      resolve(server)
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
 * Gets the relevant query data from the request query parameters.
 *
 * @param {*} request a Request object
 */
function getQueryDataFromRequest (request) {
  const _url = new url.URL(request.url, `http://${request.headers.host}`)
  const queryData = _url.searchParams || new URLSearchParams()
  const state = queryData.get('state') || '{}'
  const accessToken = queryData.get('access_token')

  return { ...JSON.parse(state), accessToken }
}

/**
 * Gets the access token for a signed in user.
 *
 * @param {integer} timeoutSeconds the number of seconds to timeout in checking
 */
async function login (timeoutSeconds = AUTH_TIMEOUT_SECONDS) {
  const id = randomId()
  const server = await createServer()
  const serverPort = server.address().port
  const uri = authSiteUrl(AUTH_URL, { id, port: serverPort })

  debug(`Local server created on port ${serverPort}.`)

  return new Promise((resolve, reject) => {
    console.log('Visit this url to log in: ')
    cli.url(uri, uri)
    cli.open(uri)
    const spinner = ora('Logging in').start()

    const timerId = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutSeconds} seconds.`))
      spinner.stop()
    }, timeoutSeconds * 1000)

    server.on('request', (request, response) => {
      const queryData = getQueryDataFromRequest(request)
      console.log(`queryData: ${JSON.stringify(queryData, null, 2)}`)

      if (queryData.accessToken && queryData.id === id) {
        spinner.info('Got access token')
        clearTimeout(timerId)
        resolve(queryData.access_token)
      } else {
        clearTimeout(timerId)
        reject(new Error(`error code=${queryData.code}`))
      }

      response.statusCode = 200
      response.setHeader('Content-Type', 'text/plain')
      response.end('You are now signed in, please close this window.\n')

      server.close()
    })
  })
}

module.exports = {
  login
}
