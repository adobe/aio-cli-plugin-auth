aio-cli-plugin-auth
==================

The Auth plugin to the Adobe I/O CLI supports managing tokens for Adobe IMS such as login, logout, and retrieving and using tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@adobe/aio-cli-plugin-auth.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-auth)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-cli-plugin-auth.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-auth)
[![Build Status](https://travis-ci.com/adobe/aio-cli-plugin-auth.svg?branch=master)](https://travis-ci.com/adobe/aio-cli-plugin-auth)
[![License](https://img.shields.io/npm/l/@adobe/aio-cli-plugin-auth.svg)](https://github.com/adobe/aio-cli-plugin-auth/blob/master/package.json)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cli-plugin-auth/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cli-plugin-auth/)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-cli-plugin-auth.svg)](https://greenkeeper.io/)

<!-- toc -->
* [Motivation](#motivation)
* [Goals](#goals)
* [The JavaScript Packages](#the-javascript-packages)
* [How it works](#how-it-works)
* [Usage](#usage)
* [Commands](#commands)
* [Contributing](#contributing)
* [Licensing](#licensing)
<!-- tocstop -->

# Motivation

Adobe IMS integration for authentication and subsequent use of the CLI for service access is critical to the success of the CLI. To that avail, this functionality needs to be as complete as to support anything the browser UI supports as well. In the end, this means support for logging in not only with JWT tokens for technical accounts but also leveraging the SUSI flow for three-legged user based authentication and even, at least for Adobe internal teams, with service tokens.

The current [JWT Auth Plugin for the Adobe I/O CLI](https://github.com/adobe/aio-cli-plugin-jwt-auth) does a decent job supporting JWT based flows with some limitations, though:

* Only a single configuration is supported, thus not allowing to switch for different configurations and thus different setups depending on the actual CLI task at hand. Even with the new local configuration support we are still limited to one configuration per local environment.
* The configuration contains a lot of boiler plate data, which is the same for many configurations. This also makes the configuration hard to manage.
* Only JWT tokens are supported. So we are missing real user tokens created using the SUSI UI based flow as well as service tokens, which are sometimes used by Adobe internal teams.
* The actual JWT signing and token exchange are not easily re-usable outside of the CLI plugin.

# Goals

So the goal of this project along with the companion repositories is to provide more complete support:

* Have a separate module implementing a JavaScript interface to the Adobe IMS API, so that this Adobe IMS API can be leveraged from multiple places, inside of the Adobe I/O CLI IMS Plugins or outside.
* Store as little information in the configuration data as possible. This boils down to the absolutely needed fields, such as `client_id`, `client_secret`, `private_key` etc. The boilerplate, such as the bulk of the JWT token should be provided dynamically.
* The plugins should support all three of the login mechanism: SUSI/UI based for user token, JWT based (technical/utility) user tokens, as well as Adobe-internal service tokens.

# The JavaScript Packages

Without much further ado, here is the collection of Adobe IMS supporting plugins:

* The [Adobe I/O Lib Core IMS Support Library](https://github.com/adobe/aio-lib-core-ims) is the reusable base library providing JavaScript level API to the Adobe IMS APIs as well as getting access to tokens. All the functionality of this library is available by simply requiring this library.
* This [Adobe I/O CLI Auth Plugin](https://github.com/adobe/aio-cli-plugin-auth) is the main auth plugin to the Adobe IO CLI. See #plugin for more details below.
* Three extension to the _Adobe I/O IMS Support Library_ supporting creation of IMS tokens for different use cases. They all come as node packages. They are used by the _Adobe I/O IMS Support Library_ to implement the access token creation. The plugins are:
    * The [Adobe I/O Lib Core IMS Library JWT Support](https://github.com/adobe/aio-lib-core-ims-jwt) supporting the generation and exchange for an access token of JWT Tokens.
    * The [Adobe I/O Lib Core IMS Library OAuth2 Support](https://github.com/adobe/aio-lib-core-ims-oauth) supporting the creation of tokens using the normal browser-based SUSI flow. To that avail the SUSI flow part is implemented as an embedded [Electron app](https://electronjs.org) driving the browser based interaction and capturing the callback from Adobe IMS.

# How it works

This _Adobe IO CLI Auth Plugin_ offers three commands:

* [`login`](#aio-imslogin) to create and return Adobe IMS access tokens. Since tokens are cached in the Adobe IO CLI configuration, an actual token is only created if the currently cached token has already expired (or is about to expire within 10 minutes).
* [`logout`](#aio-imslogout) invalidate cached tokens and remove them from the cache. Besides the access token, this can also be used to invalidate any refresh token that may be cached.
* [`ctx`](#aio-imsctx) to manage configuration contexts.


# Usage
<!-- usage -->
```sh-session
$ npm install -g @adobe/aio-cli-plugin-auth
$ aio COMMAND
running command...
$ aio (-v|--version|version)
@adobe/aio-cli-plugin-auth/1.0.2 darwin-x64 node-v8.16.2
$ aio --help [COMMAND]
USAGE
  $ aio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aio auth`](#aio-auth)
* [`aio auth:ctx`](#aio-authctx)
* [`aio auth:login`](#aio-authlogin)
* [`aio auth:logout`](#aio-authlogout)

## `aio auth`

Adobe IMS commands to login and logout.

```
USAGE
  $ aio auth

DESCRIPTION
  The main commands are auth:login to get or create an access token and
  auth:logout to invalidate an access token and thus log out from Adobe IMS.

  Logging in and out is based on configuration of which there may be
  multiple. Each set of configuration properties, called an Adobe IMS context,
  can be individually addressed by a label.

  Configuration for the Adobe IMS commands is stored in the "$ims"
  configuration property. The special property "$current" contains the
  label of the current configuration which can be set using the
  "aio auth ctx -s <label>" command.

  Each set of properties in labeled Adobe IMS context configurations has
  configuration properties depending on the kind of access that is
  supported. The below example shows the configuration for OAuth2
  based (graphical SUSI) login.

  The "env" property is mandatory and designates the Adobe IMS environment
  used for authentication. Possible values are "stage" and "prod".
  If the property is missing or any other value, it defaults to "stage".

  All commands allow their normal output to be formatted in either
  HJSON (default), JSON, or YAML.

EXAMPLE
  {
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
```

_See code: [src/commands/auth/index.js](https://github.com/adobe/aio-cli-plugin-auth/blob/v1.0.2/src/commands/auth/index.js)_

## `aio auth:ctx`

Manage Adobe IMS contexts.

```
USAGE
  $ aio auth:ctx

OPTIONS
  -c, --ctx=ctx  Name of the Adobe IMS context to use. Default is the current Adobe IMS context
  -g, --global   global config
  -l, --local    local config
  -s, --set=set  Sets the name of the current Adobe IMS context
  -v, --verbose  Verbose output
  --debug=debug  Debug level output
  --list         Names of the Adobe IMS contexts as an array
  --value        Prints named or current Adobe IMS context data

DESCRIPTION
  The following options exist for this command:

  * List the names of the configured Adobe IMS contexts
  * Print the name of the current Adobe IMS context
  * Set the name of the current Adobe IMS context
  * Print the configuration of the current or a named Adobe IMS context

  Currently it is not possible to update the Adobe Adobe IMS context configuration
  using this command. Use the "aio config" commands for this.

  Please note, that the Adobe Adobe IMS context labels starting with "$" are reserved
  and cannot be used as an Adobe IMS context name.

ALIASES
  $ aio ctx
  $ aio context
```

_See code: [src/commands/auth/ctx.js](https://github.com/adobe/aio-cli-plugin-auth/blob/v1.0.2/src/commands/auth/ctx.js)_

## `aio auth:login`

Log in with a certain Adobe IMS context and returns the access token.

```
USAGE
  $ aio auth:login

OPTIONS
  -c, --ctx=ctx  Name of the Adobe IMS context to use. Default is the current Adobe IMS context
  -d, --decode   Decode and display access token data

  -f, --force    Force logging in. This causes a forced logout on the context first and makes sure to not use any cached
                 data when calling the plugin.

  -g, --global   global config

  -l, --local    local config

  -v, --verbose  Verbose output

  --debug=debug  Debug level output

DESCRIPTION
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
     plugin will launch a Chromium browser to guide through the
     login process. The plugin itself will *never* see the user's
     password but only receive the authorization token after the
     user authenticated with Adobe IMS.

ALIASES
  $ aio login
```

_See code: [src/commands/auth/login.js](https://github.com/adobe/aio-cli-plugin-auth/blob/v1.0.2/src/commands/auth/login.js)_

## `aio auth:logout`

Log out the current or a named Adobe IMS context.

```
USAGE
  $ aio auth:logout

OPTIONS
  -c, --ctx=ctx  Name of the Adobe IMS context to use. Default is the current Adobe IMS context

  -f, --force    Invalidate the refresh token as well as all access tokens.
                 Otherwise only the access token is invalidated. For Adobe IMS
                 contexts not supporting refresh tokens, this flag has no
                 effect.

  -g, --global   global config

  -l, --local    local config

  -v, --verbose  Verbose output

  --debug=debug  Debug level output

DESCRIPTION
  This command can be called multiple times on the same Adobe IMS context with
  out causing any errors. The assumption is that after calling this command
  without an error, the Adobe IMS context's access and refresh tokens have been
  invalidated and removed from persistence storage. Repeatedly calling this
  command will just do nothing.

ALIASES
  $ aio logout
```

_See code: [src/commands/auth/logout.js](https://github.com/adobe/aio-cli-plugin-auth/blob/v1.0.2/src/commands/auth/logout.js)_
<!-- commandsstop -->


# Contributing
Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.


# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
