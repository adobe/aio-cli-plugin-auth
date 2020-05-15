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

const TheCommand = require('../src/ims-base-command')
const { stdout } = require('stdout-stderr')
const hjson = require('hjson')
const debug = require('debug')
const config = require('@adobe/aio-lib-core-config')

afterEach(() => {
  jest.resetAllMocks()
})

let command

beforeEach(() => {
  command = new TheCommand([])
})

test('exports and properties', () => {
  expect(typeof TheCommand).toEqual('function')

  expect(TheCommand.description).toBeUndefined()
  expect(typeof TheCommand.flags).toEqual('object')
  expect(typeof TheCommand.args).toEqual('object')
})

test('expected methods', async () => {
  expect(command.run).toBeUndefined()
  expect(typeof command.init).toEqual('function')
  expect(typeof command.printObject).toEqual('function')
})

test('init', async () => {
  expect.assertions(2)
  const errorLevel = 'error'

  jest.spyOn(debug, 'enable').mockImplementation((level) => {
    expect(level).toEqual('*')
  })

  // because we are instantiating this superclass directly to test,
  // certain features are not setup via a subclass' run() method
  command.config = { debug: {} }

  //  verbose flag
  command.argv = ['--verbose']
  await command.init()

  jest.spyOn(debug, 'enable').mockImplementation((level) => {
    expect(level).toEqual(errorLevel)
  })

  // debug flag
  command.argv = ['--debug', errorLevel]
  await command.init()

  // no flags (coverage)
  command.argv = []
  await command.init()
})

test('printObject', () => {
  const foo = {
    foo: 'bar'
  }

  // hjson
  stdout.start() // clear any stdout logs
  command.argv = []
  command.printObject(foo)
  expect(hjson.stringify(hjson.parse(stdout.output))).toEqual(hjson.stringify(foo))

  // json
  stdout.start() // clear any stdout logs
  command.argv = ['--json']
  command.printObject(foo)
  expect(JSON.parse(stdout.output)).toEqual(foo)

  // yaml
  stdout.start() // clear any stdout logs
  command.argv = ['--yaml']
  command.printObject(foo)
  expect(stdout.output.trim()).toEqual('foo: bar')

  // empty object
  stdout.start() // clear any stdout logs
  command.argv = []
  command.printObject({})
  expect(stdout.output).toEqual('')
})

describe('printConsoleConfig', () => {
  let mockConfig
  beforeEach(() => {
    config.get.mockClear()
    mockConfig = {
      '$console.org.name': 'Fake Org',
      '$console.project.name': 'Fake Project',
      '$console.workspace.name': 'Fake Workspace'
    }
    config.get.mockImplementation(key => mockConfig[key])
  })

  test('calls config get', () => {
    command.printConsoleConfig()
    expect(config.get).toBeCalledWith('$console.org.name')
    expect(config.get).toBeCalledWith('$console.project.name')
    expect(config.get).toBeCalledWith('$console.workspace.name')
  })
  test('no org, no project, no workspace', () => {
    delete mockConfig['$console.org.name']
    delete mockConfig['$console.project.name']
    delete mockConfig['$console.workspace.name']

    stdout.start()
    command.printConsoleConfig()
    expect(stdout.output).toEqual(`You are currently in:
1. Org: <no org selected>
2. Project: <no project selected>
3. Workspace: <no workspace selected>
`)
  })
  test('no project, no workspace', () => {
    delete mockConfig['$console.project.name']
    delete mockConfig['$console.workspace.name']
    stdout.start()
    command.printConsoleConfig()
    expect(stdout.output).toEqual(`You are currently in:
1. Org: Fake Org
2. Project: <no project selected>
3. Workspace: <no workspace selected>
`)
  })
  test('no workspace', () => {
    delete mockConfig['$console.workspace.name']
    stdout.start()
    command.printConsoleConfig()
    expect(stdout.output).toEqual(`You are currently in:
1. Org: Fake Org
2. Project: Fake Project
3. Workspace: <no workspace selected>
`)
  })
})
