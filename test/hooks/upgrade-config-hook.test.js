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

const hook = require('../../src/hooks/upgrade-config-hook')
// eslint-disable-next-line no-unused-vars
const config = require('@adobe/aio-lib-core-config')
const OLD_IMS_CONFIG_KEY = '$ims'
const { IMS } = require('@adobe/aio-lib-ims/src/context')
const { EOL } = require('os')

jest.mock('fs')
const fs = require('fs')

const mockConfig = (conf = {}) => {
  conf.local = conf.local || {}
  conf.global = conf.global || {}
  conf.env = conf.env || {}

  const mockStore = conf

  fs.readFileSync.mockReturnValue({
    // only one level
    toString: () => `# some comment${EOL}${Object.keys(conf.env[OLD_IMS_CONFIG_KEY] || {}).map(k => `AIO_${OLD_IMS_CONFIG_KEY}_${k}=${conf.env[OLD_IMS_CONFIG_KEY][k]}`).join(EOL)}`
  })

  config.get.mockImplementation((key, source) => {
    return mockStore[source][key]
  })

  config.delete.mockImplementation((key, local) => {
    delete mockStore[(local && 'local') || 'global'][key]
  })

  config.set.mockImplementation((key, value, local) => {
    mockStore[(local && 'local') || 'global'][key] = value
  })
}

let fakeOldConfig
let fakeNewConfig
let fakeOldConfig2
let fakeNewConfig2
let fakeOldConfig3
let fakeNewConfig3
let fakeOldConfig4
let fakeNewConfig4
let fakeOldEnv
let fakeNewEnvFileContent
beforeEach(() => {
  config.get.mockReset()
  config.delete.mockReset()
  config.set.mockReset()
  fs.readFileSync.mockReset()
  fs.writeFileSync.mockReset()
  // mock data
  fakeOldConfig = { [OLD_IMS_CONFIG_KEY]: { $cli: { '$cli.bare-output': false, abc: 1 }, $current: 'dude007', dude007: { some: 'super', crazy: 'config' } } }
  fakeNewConfig = { [IMS]: { contexts: { cli: { 'cli.bare-output': false, abc: 1 }, dude007: { some: 'super', crazy: 'config' } }, config: { current: 'dude007' } } }
  fakeOldConfig2 = { [OLD_IMS_CONFIG_KEY]: { $cli: { '$cli.bare-output': true, def: 0 }, $current: 'shine005', shine005: { a: 'happy configuration' } } }
  fakeNewConfig2 = { [IMS]: { contexts: { cli: { 'cli.bare-output': true, def: 0 }, shine005: { a: 'happy configuration' } }, config: { current: 'shine005' } } }
  fakeOldConfig3 = { [OLD_IMS_CONFIG_KEY]: { $current: 'shine005', shine005: { a: 'happy configuration' } } }
  fakeNewConfig3 = { [IMS]: { contexts: { shine005: { a: 'happy configuration' } }, config: { current: 'shine005' } } }
  fakeOldConfig4 = { [OLD_IMS_CONFIG_KEY]: { $cli: { def: 0 }, $current: 'shine005', shine005: { a: 'happy configuration' } } }
  fakeNewConfig4 = { [IMS]: { contexts: { cli: { def: 0 }, shine005: { a: 'happy configuration' } }, config: { current: 'shine005' } } }
  fakeOldEnv = { [OLD_IMS_CONFIG_KEY]: { green008: 'a_very_great_conf', blue009: 'another_very_great_conf' } }
  fakeNewEnvFileContent = `# some comment${EOL}AIO_${IMS}_contexts_green008=a_very_great_conf${EOL}AIO_${IMS}_contexts_blue009=another_very_great_conf`
})

test('should export a function', () => {
  expect(typeof hook).toBe('function')
})

test('oldConfig: does not exist, newConfig: does not exist. (do nothing)', () => {
  mockConfig()
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'env')).toBeUndefined()
    expect(config.get(IMS, 'local')).toBeUndefined()
    expect(config.get(IMS, 'global')).toBeUndefined()
    expect(config.get(IMS, 'env')).toBeUndefined()
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0)
  })
})

test('oldConfig: does not exist, newConfig: exists. (do nothing)', () => {
  mockConfig({ global: fakeNewConfig, local: fakeNewConfig, env: fakeNewConfig })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'env')).toBeUndefined()
    expect(config.get(IMS, 'local')).toEqual(fakeNewConfig[IMS])
    expect(config.get(IMS, 'global')).toEqual(fakeNewConfig[IMS])
    expect(config.get(IMS, 'env')).toEqual(fakeNewConfig[IMS])
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0)
  })
})

test('oldConfig: exists globally, newConfig: does not exist. (migrate to new, delete old)', () => {
  mockConfig({ global: fakeOldConfig3 })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(IMS, 'global')).toEqual(fakeNewConfig3[IMS])
    expect(config.get(IMS, 'local')).toBeUndefined()
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0)
  })
})

test('oldConfig: exists locally, newConfig: does not exist. (migrate to new, delete old)', () => {
  mockConfig({ local: fakeOldConfig })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(IMS, 'local')).toEqual(fakeNewConfig[IMS])
    expect(config.get(IMS, 'global')).toBeUndefined()
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0)
  })
})

test('oldConfig: exists in dotenv, newConfig: does not exist. (migrate to new, delete old)', () => {
  mockConfig({ env: fakeOldEnv })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(IMS, 'global')).toBeUndefined()
    expect(config.get(IMS, 'local')).toBeUndefined()

    expect(fs.writeFileSync).toHaveBeenCalledWith('.env', fakeNewEnvFileContent)
  })
})

test('oldConfig: exists in all three sources, newConfig: does not exist. (migrate to new, delete old)', () => {
  mockConfig({ global: fakeOldConfig2, local: fakeOldConfig4, env: fakeOldEnv })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toBeUndefined()
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toBeUndefined()
    expect(config.get(IMS, 'global')).toEqual(fakeNewConfig2[IMS])
    expect(config.get(IMS, 'local')).toEqual(fakeNewConfig4[IMS])
    expect(fs.writeFileSync).toHaveBeenCalledWith('.env', fakeNewEnvFileContent)
  })
})

test('oldConfig: exists in all three sources, newConfig: exists (do nothing)', () => {
  mockConfig({ global: { ...fakeOldConfig2, ...fakeNewConfig }, local: { ...fakeOldConfig, ...fakeNewConfig2 }, env: { ...fakeOldEnv, ...fakeNewConfig } })
  return hook().then(() => {
    expect(config.get(OLD_IMS_CONFIG_KEY, 'local')).toEqual(fakeOldConfig[OLD_IMS_CONFIG_KEY])
    expect(config.get(OLD_IMS_CONFIG_KEY, 'global')).toEqual(fakeOldConfig2[OLD_IMS_CONFIG_KEY])
    expect(config.get(IMS, 'global')).toEqual(fakeNewConfig[IMS])
    expect(config.get(IMS, 'local')).toEqual(fakeNewConfig2[IMS])
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0)
  })
})
