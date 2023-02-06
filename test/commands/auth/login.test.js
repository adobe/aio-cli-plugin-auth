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

const TheCommand = require('../../../src/commands/auth/login')
const BaseCommand = require('../../../src/ims-base-command')
const ims = require('@adobe/aio-lib-ims')
const { CONTEXTS, CONFIG, IMS } = require('@adobe/aio-lib-ims/src/context')

jest.mock('@adobe/aio-lib-ims')

afterEach(() => {
  jest.resetAllMocks()
})

let command

beforeEach(() => {
  command = new TheCommand([])
  jest.resetAllMocks()
})

test('exports and properties', () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()

  expect(typeof TheCommand.description).toEqual('string')
  expect(typeof TheCommand.flags).toEqual('object')
  expect(typeof TheCommand.args).toEqual('object')
})

test('run - success (no flags)', async () => {
  const tokenData = {
    data: ''
  }

  const spy = jest.spyOn(command, 'printObject')
  const spy2 = jest.spyOn(command, 'printConsoleConfig')

  ims.getTokenData.mockImplementation(() => {
    return tokenData
  })

  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  expect(spy).toHaveBeenCalled()
  expect(spy2).toHaveBeenCalled()
})

test('run - success (--decode)', async () => {
  const context = 'my-context'
  const tokenData = {
    data: ''
  }

  const spy = jest.spyOn(command, 'printObject')
  const spy2 = jest.spyOn(command, 'printConsoleConfig')

  ims.getTokenData.mockImplementation(() => {
    return tokenData
  })

  // decode flag
  command.argv = ['--ctx', context, '--decode']
  const runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  expect(spy).toHaveBeenCalledWith(tokenData)
  expect(spy2).toHaveBeenCalled()
})

test('run - success (--bare)', async () => {
  const context = 'my-context'
  const tokenData = {
    data: ''
  }

  const spy = jest.spyOn(command, 'printObject')
  const spy2 = jest.spyOn(command, 'printConsoleConfig')

  ims.getToken.mockImplementation(async () => {
    return tokenData
  })

  // bare flag
  command.argv = ['--ctx', context, '--bare']
  const runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  expect(spy).toHaveBeenCalledWith(tokenData)
  expect(spy2).not.toHaveBeenCalled()
})

test('run - error', async () => {
  const errorMessage = 'my-error'
  const context = 'my-context'
  let runResult

  ims.invalidateToken.mockImplementation(async (ctx, force) => {
    throw new Error(errorMessage)
  })

  ims.getToken.mockImplementation(async (ctx, force) => {
    throw new Error(errorMessage)
  })

  const store = {
    [IMS]: {
      [CONFIG]: {},
      [CONTEXTS]: {}
    }
  }

  ims.context.setCurrent.mockImplementation(async (data) => {
    store.ims.config.current = data
  })

  ims.context.getCurrent.mockImplementation(async (data) => {
    return store.ims.config.current
  })

  // context flag
  command.argv = ['--ctx', context]
  runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error(`Cannot get token for context '${context}': ${errorMessage}`))

  // force flag
  command.argv = ['--ctx', context, '--force']
  runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error(`Cannot get token for context '${context}': ${errorMessage}`))

  // context from config
  await ims.context.setCurrent(context)
  command.argv = []
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Cannot get token for context '${context}': ${errorMessage}`))

  // coverage
  ims.getToken.mockImplementation(async (ctx, force) => {
    throw errorMessage
  })
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Cannot get token for context '${context}': ${errorMessage}`))
})

describe('Use env var for client_id', () => {
  test('run - success AIO_CLI_IMS_APIKEY - prod', async () => {
    process.env.AIO_CLI_IMS_APIKEY = 'my-api-key'
    const tokenData = {
      data: ''
    }
    ims.getToken.mockImplementation(async () => {
      return tokenData
    })

    command.argv = []
    const runResult = command.run()
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.not.toThrow()
    expect(ims.getToken).toHaveBeenCalledWith('cli', { client_id: 'my-api-key', open: true })
    process.env.AIO_CLI_IMS_APIKEY = undefined
  })

  test('run - success AIO_CLI_IMS_APIKEY - stage', async () => {
    process.env.AIO_CLI_IMS_APIKEY = 'my-api-key'
    process.env.AIO_CLI_ENV = 'stage'
    const tokenData = {
      data: ''
    }
    ims.getToken.mockImplementation(async () => {
      return tokenData
    })

    command.argv = []
    const runResult = command.run()
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.not.toThrow()
    expect(ims.getToken).toHaveBeenCalledWith('cli', { client_id: 'my-api-key-stage', open: true })
    process.env.AIO_CLI_IMS_APIKEY = undefined
    process.env.AIO_CLI_ENV = undefined
  })
})
