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

class CtxCommand extends ImsBaseCommand {
  async run () {
    const { flags } = this.parse(CtxCommand)

    const { context } = require('@adobe/aio-lib-ims')
    if (flags.list) {
      this.printObject(await context.keys())
    } else if (flags.value) {
      this.printObject(await context.get(flags.ctx))
    } else if (flags.set) {
      await context.setCurrent(flags.set, flags.local)
      this.printObject(await context.getCurrent())
    } else {
      this.printObject(await context.getCurrent())
    }
  }
}

CtxCommand.description = `Manage Adobe IMS contexts.

The following options exist for this command:

* List the names of the configured Adobe IMS contexts
* Print the name of the current Adobe IMS context
* Set the name of the current Adobe IMS context
* Print the configuration of the current or a named Adobe IMS context

Currently it is not possible to update the Adobe Adobe IMS context configuration
using this command. Use the "aio config" commands for this.
     e.g. aio config:set ims.your_context.your_context_key "your_context_value"

Please note, that the following IMS context label names is reserved: \`cli\`
and cannot should not be used as an IMS context name.
`

CtxCommand.flags = {
  ...ImsBaseCommand.flags,
  list: flags.boolean({ description: 'Names of the Adobe IMS contexts as an array', exclusive: ['value', 'set', 'plugin'], multiple: false }),
  value: flags.boolean({ description: 'Prints named or current Adobe IMS context data', exclusive: ['list', 'set', 'plugin'], multiple: false }),
  set: flags.string({ char: 's', description: 'Sets the name of the current Adobe IMS context', exclusive: ['list', 'val', 'ctx', 'plugin'], multiple: false })
}

CtxCommand.args = [
  ...ImsBaseCommand.args
]

CtxCommand.aliases = [
  'ctx',
  'context'
]

module.exports = CtxCommand
