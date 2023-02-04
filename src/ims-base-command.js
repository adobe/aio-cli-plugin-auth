/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command, Flags } = require('@oclif/core')
const hjson = require('hjson')
const yaml = require('js-yaml')
const debug = require('debug')

class ImsBaseCommand extends Command {
  async init () {
    const { flags } = await this.parse(this.constructor)

    // See https://www.npmjs.com/package/debug for usage in commands
    if (flags.verbose) {
      // verbose just sets the debug filter to everything (*)
      debug.enable('*')
    } else if (flags.debug) {
      debug.enable(flags.debug)
    }

    // ensure initializing the base class !
    return super.init()
  }

  debugError (message, err) {
    const stackTrace = err.stack ? '\n' + err.stack : ''
    this.debug(`${message}: ${err.message || err}${stackTrace}`)
  }

  async printObject (obj) {
    const { flags } = await this.parse(this.constructor)

    let format = 'hjson'
    if (flags.yaml) format = 'yaml'
    else if (flags.json) format = 'json'

    const print = (obj) => {
      if (format === 'json') {
        this.log(JSON.stringify(obj))
      } else if (format === 'yaml') {
        this.log(yaml.safeDump(obj, { sortKeys: true, lineWidth: 1024, noCompatMode: true }))
      } else {
        if (typeof obj !== 'object') {
          this.log(obj)
        } else if (Object.keys(obj).length !== 0) {
          this.log(hjson.stringify(obj, {
            condense: true,
            emitRootBraces: true,
            separator: true,
            bracesSameLine: true,
            multiline: 'off',
            colors: false
          }))
        }
      }
    }

    if (obj != null) {
      print(obj)
    }
  }
}

ImsBaseCommand.flags = {
  debug: Flags.string({
    description: 'Debug level output'
  }),
  verbose: Flags.boolean({
    char: 'v',
    description: 'Verbose output'
  }),
  local: Flags.boolean({
    char: 'l',
    description: 'local config',
    exclusive: ['global']
  }),
  global: Flags.boolean({
    char: 'g',
    description: 'global config',
    exclusive: ['local']
  }),
  json: Flags.boolean({
    char: 'j',
    hidden: true,
    exclusive: ['yaml']
  }),
  yaml: Flags.boolean({
    char: 'y',
    hidden: true,
    exclusive: ['json']
  }),
  ctx: Flags.string({
    char: 'c',
    description: ' Name of the Adobe IMS context to use. Default is the current Adobe IMS context',
    multiple: false
  })
}

ImsBaseCommand.args = [
]

module.exports = ImsBaseCommand
