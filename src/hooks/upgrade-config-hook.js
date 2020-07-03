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

const config = require('@adobe/aio-lib-core-config')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-auth:upgrade-config-hook', { provider: 'debug' })
const { IMS, CLI, CONFIG, CONTEXTS, PLUGINS, CURRENT } = require('@adobe/aio-lib-ims/src/context')
const fs = require('fs')
const { EOL } = require('os')

const upgrade = async () => {
  aioConsoleLogger.debug('hook running.')

  const oldConfigKey = '$ims'
  const newConfigKey = IMS

  upgradeSource('local')
  upgradeSource('global')
  upgradeSource('env')

  /**
   * @param {string} source local, global, env
   */
  function upgradeSource (source) {
    const oldConfig = config.get(oldConfigKey, source)
    if (oldConfig && !config.get(newConfigKey, source)) {
      // needs upgrade
      aioConsoleLogger.debug(`Migrating from '${oldConfigKey}' to '${newConfigKey}'.`)

      if (source === 'env') {
        // let's keep it simple for now: we assume dotenv will only reference $ims.<the context> keys and not the other $<configs> nor $cli
        const dotenvLines = fs.readFileSync('.env').toString().split(EOL)
        const needsRewrite = l => l.toLowerCase().startsWith(`aio_${oldConfigKey}`)
        const newDotenv = dotenvLines.map(l => needsRewrite(l) ? l.replace(oldConfigKey, `${newConfigKey}_${CONTEXTS}`) : l).join(EOL)
        aioConsoleLogger.debug(`Writing in .env to new config key '${newConfigKey}': ${EOL}${newDotenv}}`)
        fs.writeFileSync('.env', newDotenv)
        return
      }

      // local or global config
      const newConfig = Object.keys(oldConfig)
        .reduce((obj, k) => {
          if (k === '$plugins') {
            obj[CONFIG][PLUGINS] = oldConfig[k]
          } else if (k === '$current') {
            obj[CONFIG][CURRENT] = oldConfig[k]
          } else if (k === '$cli') {
            obj[CONTEXTS][CLI] = oldConfig[k]
            // rename $cli.bare-output
            if (obj[CONTEXTS][CLI]['$cli.bare-output'] !== undefined) {
              obj[CONTEXTS][CLI]['cli.bare-output'] = obj[CONTEXTS][CLI]['$cli.bare-output']
              delete obj[CONTEXTS][CLI]['$cli.bare-output']
            }
          } else {
            obj[CONTEXTS][k] = oldConfig[k]
          }
          return obj
        }, { [CONFIG]: {}, [CONTEXTS]: {} })

      aioConsoleLogger.debug(`Writing in ${source} config to new config key '${newConfigKey}': ${JSON.stringify(newConfig, null, 2)}`)

      config.set(newConfigKey, newConfig, source === 'local')
      aioConsoleLogger.debug(`Deleting in ${source} config the old config key '${oldConfigKey}'.`)
      config.delete(oldConfigKey, source === 'local')
    }
  }
}

module.exports = upgrade
