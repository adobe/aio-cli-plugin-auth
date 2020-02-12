/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { flags } = require('@oclif/command')
const ImsBaseCommand = require('../../ims-base-command')

class LoginCommand extends ImsBaseCommand {
  async run () {
    const { flags } = this.parse(LoginCommand)

    const { getTokenData, getToken, invalidateToken, context } = require('@adobe/aio-lib-core-ims')
    const current = await context.getCurrent()

    try {
      // in case of forced login: forced logout first
      if (flags.force) {
        try {
          await invalidateToken(flags.ctx, true)
        } catch (err) {
          // ignore failure of invalidation, continue with login
        }
      }

      // default is the `$cli` context, if $ims.$current not set
      flags.ctx = flags.ctx || (current || '$cli')

      if (flags.ctx === '$cli') {
        const data = await context.getCli() || {}
        data['$cli.bare-output'] = flags.bare
        await context.setCli(data)
      }

      let token = await getToken(flags.ctx, flags.force)

      // decode the token
      if (flags.decode) {
        token = getTokenData(token)
      }

      this.printObject(token)
    } catch (err) {
      const stackTrace = err.stack ? '\n' + err.stack : ''
      this.debug(`Login Failure: ${err.message || err}${stackTrace}`)
      this.error(`Cannot get token for context '${flags.ctx}': ${err.message || err}`, { exit: 1 })
    }
  }
}

LoginCommand.description = `Log in with a certain Adobe IMS context and returns the access token.

If the Adobe IMS context already has a valid access token set (valid meaning
at least 10 minutes before expiry), that token is returned.

Otherwise, if the Adobe IMS context has a valid refresh token set (valid
meaning at least 10 minutes before expiry) that refresh token is
exchanged for an access token before returning the access token.

Lastly, if the Adobe IMS context properties are supported by one of the
Adobe IMS login plugins, that login plugin is called to guide through
the IMS login process.

The currently supported Adobe IMS login plugins are:

* aio-lib-core-ims-jwt for JWT token based login supporting
  Adobe I/O Console service integrations.
* aio-lib-core-ims-oauth for browser based OAuth2 login. This
  plugin will launch a Chromium browser to guide the user through the
  login process. The plugin itself will *never* see the user's
  password but only receive the authorization token after the
  user authenticated with Adobe IMS.
`

LoginCommand.flags = {
  ...ImsBaseCommand.flags,
  force: flags.boolean({ char: 'f', description: 'Force logging in. This causes a forced logout on the context first and makes sure to not use any cached data when calling the plugin.', default: false }),
  decode: flags.boolean({ char: 'd', description: 'Decode and display access token data' }),
  bare: flags.boolean({ char: 'b', description: 'print access token only', default: false })
}

LoginCommand.args = [
  ...ImsBaseCommand.args
]

LoginCommand.aliases = [
  'login'
]

module.exports = LoginCommand
