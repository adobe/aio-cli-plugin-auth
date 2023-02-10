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

const { Flags } = require('@oclif/core')
const ImsBaseCommand = require('../../ims-base-command')
const { getTokenData, getToken, invalidateToken, context } = require('@adobe/aio-lib-ims')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const { getCliEnv, STAGE_ENV } = require('@adobe/aio-lib-env')

class LoginCommand extends ImsBaseCommand {
  async run () {
    const { flags } = await this.parse(LoginCommand)
    const current = await context.getCurrent()

    try {
      // default is the `cli` context, if ims.config.current not set
      flags.ctx = flags.ctx || (current || CLI)

      // in case of forced login: forced logout first
      if (flags.force) {
        try {
          await invalidateToken(flags.ctx, true)
        } catch (err) {
          this.debugError('invalidateToken failure', err)
        }
      }

      if (flags.ctx === CLI) {
        await context.setCli({
          'cli.bare-output': flags.bare
        })
      }

      // now we need to set the client_id because the server
      // stores secrets+scopes for each client_id
      // server has defaults already for aio-cli-console-auth[-stage]
      // we also need to differentiate between stage and prod env

      const loginOptions = {
        open: flags.open
      }
      if (process.env.AIO_CLI_IMS_APIKEY) {
        if (STAGE_ENV === getCliEnv()) {
          loginOptions.client_id = process.env.AIO_CLI_IMS_APIKEY + '-stage'
        } else {
          loginOptions.client_id = process.env.AIO_CLI_IMS_APIKEY
        }
      }

      const token = await getToken(flags.ctx, loginOptions)
      // decode the token
      if (flags.decode) {
        this.printObject(getTokenData(token))
      } else {
        this.printObject(token)
      }
    } catch (err) {
      this.debugError('Login failure', err)
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

* aio-lib-ims-jwt for JWT token based login supporting
  Adobe I/O Console service integrations.
* aio-lib-ims-oauth for browser based OAuth2 login. This
  plugin will launch the default browser to guide the user through the
  login process. The plugin itself will *never* see the user's
  password but only receive the authorization token after the
  user has authenticated with Adobe IMS.
`

LoginCommand.flags = {
  ...ImsBaseCommand.flags,
  force: Flags.boolean({
    char: 'f',
    description: 'Force logging in. This causes a forced logout on the context first and makes sure to not use any cached data when calling the plugin.',
    default: false
  }),
  decode: Flags.boolean({
    char: 'd',
    description: 'Decode and display access token data'
  }),
  bare: Flags.boolean({
    char: 'b',
    description: 'print access token only',
    default: false
  }),
  open: Flags.boolean({
    char: 'o',
    allowNo: true,
    default: true,
    description: 'Open the default browser to complete the login'
  })
}

LoginCommand.args = [
  ...ImsBaseCommand.args
]

LoginCommand.aliases = [
  'login'
]

module.exports = LoginCommand
