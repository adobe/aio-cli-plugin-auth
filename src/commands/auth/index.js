/*
Copyright 2019 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command } = require('@oclif/command')
const Help = require('@oclif/plugin-help').default

class IndexCommand extends Command {
  async run () {
    const help = new Help(this.config)
    help.showHelp(['auth', '--help'])
  }
}

IndexCommand.description = `Adobe IMS commands to login and logout.

The main commands are auth:login to get or create an access token and
auth:logout to invalidate an access token and thus log out from Adobe IMS.

Logging in and out is based on configuration of which there may be
multiple. Each set of configuration properties, called an Adobe IMS context,
can be individually addressed by a label.

Configuration for the Adobe IMS commands is stored in the "$ims"
configuration property. The special property "$current" contains the
label of the current configuration which can be set using the
"aio auth ctx -s <label>" command.

Each set of properties in a labeled Adobe IMS context configurations has
configuration properties depending on the kind of access that is
supported. The below example shows the configuration for OAuth2
based (graphical SUSI) login.

The "env" property is mandatory and designates the Adobe IMS environment
used for authentication. Possible values are "stage" and "prod".
If the property is missing or any other value, it defaults to "stage".

All commands allow their normal output to be formatted in either
HJSON (default), JSON, or YAML.
`

IndexCommand.examples = [
  `{
    $ims: {
      postman: {
        env: "stage",
        callback_url: "https://callback.example.com",
        client_id: "example.com-client-id",
        client_secret: "XXXXXXXX",
        scope: "openid AdobeID additional_info.projectedProductContext read_organizations",
        state: ""
      },
      $current: "postman"
    }
  }
  `
]
module.exports = IndexCommand
