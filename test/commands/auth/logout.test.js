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

const TheCommand = require('../../../src/commands/auth/logout')
const BaseCommand = require('../../../src/ims-base-command')
const ims = require('@adobe/aio-lib-ims')

jest.mock('@adobe/aio-lib-ims')

afterEach(() => {
  jest.resetAllMocks()
})

let command

beforeEach(() => {
  command = new TheCommand([])
})

test('exports and properties', () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()

  expect(typeof TheCommand.description).toEqual('string')
  expect(typeof TheCommand.flags).toEqual('object')
  expect(typeof TheCommand.args).toEqual('object')
})

test('run - success', async () => {
  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
})

test('run - already logged out', async () => {
  let data
  command.log = jest.fn((logData) => {
    data = logData
  })

  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  await expect(data).toEqual('You are already logged out.')
})

test('run - successfully logged out', async () => {
  let data
  command.log = jest.fn((logData) => {
    data = logData
  })

  ims.context.get.mockImplementation(async data => {
    return {
      data: 'TOKEN'
    }
  })

  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  await expect(data).toEqual('You have successfully logged out.')
})

test('run - error logging out', async () => {
  const errorMessage = 'my-error'
  const context = 'my-context'
  let runResult

  ims.invalidateToken.mockImplementation(async (ctx, force) => {
    throw new Error(errorMessage)
  })

  const IMS = '$ims'
  const store = {
    [IMS]: {
    }
  }

  ims.context.setCurrent.mockImplementation(async (data) => {
    store.$ims.$current = data
  })

  ims.context.getCurrent.mockImplementation(async (data) => {
    return store.$ims.$current
  })

  ims.context.get.mockImplementation(async data => {
    return {
      data: 'TOKEN'
    }
  })

  // coverage
  await ims.context.setCurrent(context)
  command.argv = []
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Cannot logout context '${context}': ${errorMessage}`))

  // coverage
  ims.invalidateToken.mockImplementation(async (ctx, force) => {
    throw errorMessage
  })
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Cannot logout context '${context}': ${errorMessage}`))
})
