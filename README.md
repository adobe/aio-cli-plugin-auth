aio-cli-plugin-auth
==================

The Auth plugin to the Adobe I/O CLI supports managing tokens for Adobe Identity Management Services (IMS) such as login, logout, and retrieving and using tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@adobe/aio-cli-plugin-auth.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-auth)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-cli-plugin-auth.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-auth)
[![Node.js CI](https://github.com/adobe/aio-cli-plugin-auth/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/aio-cli-plugin-auth/actions/workflows/node.js.yml)
[![License](https://img.shields.io/npm/l/@adobe/aio-cli-plugin-auth.svg)](https://github.com/adobe/aio-cli-plugin-auth/blob/master/package.json)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cli-plugin-auth/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cli-plugin-auth/)


<!-- toc -->
* [Dependencies](#dependencies)
* [Motivation](#motivation)
* [The JavaScript Packages](#the-javascript-packages)
* [How it works](#how-it-works)
* [Usage](#usage)
* [Commands](#commands)
* [Contributing](#contributing)
* [Licensing](#licensing)
<!-- tocstop -->

# Dependencies

| Module | Version | Downloads | Build Status | Coverage  | Issues | Pull Requests |
|---|---|---|---|---|---|---|
| [@adobe/aio-lib-ims](https://github.com/adobe/aio-lib-ims)| [![Version](https://img.shields.io/npm/v/@adobe/aio-lib-ims.svg)](https://npmjs.org/package/@adobe/aio-lib-ims)| [![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-ims.svg)](https://npmjs.org/package/@adobe/aio-lib-ims)| [![Node.js CI](https://github.com/adobe/aio-lib-ims/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/aio-lib-ims/actions/workflows/node.js.yml)| [![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-ims/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-ims/)| [![Github Issues](https://img.shields.io/github/issues/adobe/aio-lib-ims.svg)](https://github.com/adobe/aio-lib-ims/issues)| [![Github Pull Requests](https://img.shields.io/github/issues-pr/adobe/aio-lib-ims.svg)](https://github.com/adobe/aio-lib-ims/pulls)|
| [@adobe/aio-lib-ims-jwt](https://github.com/adobe/aio-lib-ims-jwt)| [![Version](https://img.shields.io/npm/v/@adobe/aio-lib-ims-jwt.svg)](https://npmjs.org/package/@adobe/aio-lib-ims-jwt)| [![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-ims-jwt.svg)](https://npmjs.org/package/@adobe/aio-lib-ims-jwt)| [![Node.js CI](https://github.com/adobe/aio-lib-ims-jwt/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/aio-lib-ims-jwt/actions/workflows/node.js.yml)| [![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-ims-jwt/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-ims-jwt/)| [![Github Issues](https://img.shields.io/github/issues/adobe/aio-lib-ims-jwt.svg)](https://github.com/adobe/aio-lib-ims-jwt/issues)| [![Github Pull Requests](https://img.shields.io/github/issues-pr/adobe/aio-lib-ims-jwt.svg)](https://github.com/adobe/aio-lib-ims-jwt/pulls)|
| [@adobe/aio-lib-ims-oauth](https://github.com/adobe/aio-lib-ims-oauth)| [![Version](https://img.shields.io/npm/v/@adobe/aio-lib-ims-oauth.svg)](https://npmjs.org/package/@adobe/aio-lib-ims-oauth)| [![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-ims-oauth.svg)](https://npmjs.org/package/@adobe/aio-lib-ims-oauth)| [![Node.js CI](https://github.com/adobe/aio-lib-ims-oauth/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/aio-lib-ims-oauth/actions/workflows/node.js.yml)| [![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-ims-oauth/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-ims-oauth/)| [![Github Issues](https://img.shields.io/github/issues/adobe/aio-lib-ims-oauth.svg)](https://github.com/adobe/aio-lib-ims-oauth/issues)| [![Github Pull Requests](https://img.shields.io/github/issues-pr/adobe/aio-lib-ims-oauth.svg)](https://github.com/adobe/aio-lib-ims-oauth/pulls)|

# Motivation

This plugin provides Adobe IMS support for authentication.

This plugin supports:
- multiple configurations for credentials
- support for multiple authentication types (JWT, OAuth2 (three-legged via the browser))
- support for authentication plugins (i.e. service token support)

# The JavaScript Packages

The collection of Adobe IMS supporting plugins:

* The [Adobe I/O Lib Core IMS Support Library](https://github.com/adobe/aio-lib-ims) is the reusable base library providing JavaScript level API to the Adobe IMS APIs as well as getting access to tokens. All the functionality of this library is available by simply requiring this library.
* This [Adobe I/O CLI Auth Plugin](https://github.com/adobe/aio-cli-plugin-auth) is the main auth plugin to the Adobe IO CLI.
* Two extensions to the _Adobe I/O IMS Support Library_ supporting creation of IMS tokens for different use cases. They all come as node packages. They are used by the _Adobe I/O IMS Support Library_ to implement the access token creation. The plugins are:
    * The [Adobe I/O Lib Core IMS Library JWT Support](https://github.com/adobe/aio-lib-ims-jwt) supporting the generation and exchange for an access token of JWT Tokens.
    * The [Adobe I/O Lib Core IMS Library OAuth2 Support](https://github.com/adobe/aio-lib-ims-oauth) supporting the creation of tokens using the normal browser-based SUSI flow. The Adobe I/O CLI will launch a website that will redirect the user to login to IMS, and after a successful login, the access token will be returned back to the CLI.

# How it works

This _Adobe IO CLI Auth Plugin_ offers three commands:

* [`login`](#aio-imslogin) to create and return Adobe IMS access tokens. Since tokens are cached in the Adobe IO CLI configuration, an actual token is only created if the currently cached token has already expired (or is about to expire within 10 minutes).
* [`logout`](#aio-imslogout) invalidate cached tokens and remove them from the cache. Besides the access token, this can also be used to invalidate any refresh token that may be cached.
* [`ctx`](#aio-imsctx) to manage configuration contexts.


# Usage
```
$ aio plugins:install -g @adobe/aio-cli-plugin-auth
$ # OR
$ aio discover -i
$ aio auth --help
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
Adobe IMS commands to login and logout.

The main commands are auth:login to get or create an access token and
auth:logout to invalidate an access token and thus log out from Adobe IMS.

Logging in and out is based on configuration of which there may be
multiple. Each set of configuration properties, called an Adobe IMS context,
can be individually addressed by a label.

Configuration for the Adobe IMS commands is stored in the "ims"
configuration property. The special property "ims.config.current" contains the
label of the current configuration which can be set using the
"aio auth ctx -s <label>" command.

Each set of properties in a labeled Adobe IMS context configurations has
configuration properties depending on the kind of access that is
supported. The below example shows the configuration for OAuth2
based (graphical SUSI) login.

The "env" property is optional and designates the Adobe IMS environment
used for authentication. Possible values are "stage" and "prod".
If the property is missing or any other value, it defaults to "prod".

All commands allow their normal output to be formatted in either
HJSON (default), JSON, or YAML.


USAGE
  $ aio auth

DESCRIPTION
  The main commands are auth:login to get or create an access token and
  auth:logout to invalidate an access token and thus log out from Adobe IMS.

  Logging in and out is based on configuration of which there may be
  multiple. Each set of configuration properties, called an Adobe IMS context,
  can be individually addressed by a label.

  Configuration for the Adobe IMS commands is stored in the "ims"
  configuration property. The special property "ims.config.current" contains the
  label of the current configuration which can be set using the
  "aio auth ctx -s <label>" command.

  Each set of properties in a labeled Adobe IMS context configurations has
  configuration properties depending on the kind of access that is
  supported. The below example shows the configuration for OAuth2
  based (graphical SUSI) login.

  The "env" property is optional and designates the Adobe IMS environment
  used for authentication. Possible values are "stage" and "prod".
  If the property is missing or any other value, it defaults to "prod".

  All commands allow their normal output to be formatted in either
  HJSON (default), JSON, or YAML.

EXAMPLE
  {
       ims: {
         contexts: {
           postman: {
             env: "stage",
             callback_url: "https://callback.example.com",
             client_id: "example.com-client-id",
             client_secret: "XXXXXXXX",
             scope: "openid AdobeID additional_info.projectedProductContext read_organizations",
             state: ""
           }
         },
         config: {
           current: "postman"
         }
       }
     }
```

_See code: [src/commands/auth/index.js](https://github.com/adobe/aio-cli-plugin-auth/blob/2.4.2/src/commands/auth/index.js)_

## `aio auth:ctx`

Manage Adobe IMS contexts.

```
Manage Adobe IMS contexts.

The following options exist for this command:

* List the names of the configured Adobe IMS contexts
* Print the name of the current Adobe IMS context
* Set the name of the current Adobe IMS context
* Print the configuration of the current or a named Adobe IMS context

Currently it is not possible to update the Adobe Adobe IMS context configuration
using this command. Use the "aio config" commands for this.
     e.g. aio config:set ims.contexts.your_context.your_context_key "your_context_value"

Please note, that the following IMS context label names is reserved: `cli`
and should not be used as an IMS context name.

Also note that the current context can only be set locally.


USAGE
  $ aio auth:ctx

OPTIONS
  -c, --ctx=ctx  Name of the Adobe IMS context to use. Default is the current Adobe IMS context
  -g, --global   global config
  -l, --local    local config
  -s, --set=set  Sets the name of the current local Adobe IMS context
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
        e.g. aio config:set ims.contexts.your_context.your_context_key "your_context_value"

  Please note, that the following IMS context label names is reserved: `cli`
  and should not be used as an IMS context name.

  Also note that the current context can only be set locally.

ALIASES
  $ aio ctx
  $ aio context
```

_See code: [src/commands/auth/ctx.js](https://github.com/adobe/aio-cli-plugin-auth/blob/2.4.2/src/commands/auth/ctx.js)_

## `aio auth:login`

Log in with a certain Adobe IMS context and returns the access token.

```
Log in with a certain Adobe IMS context and returns the access token.

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
  plugin will launch a Chromium browser to guide the user through the
  login process. The plugin itself will *never* see the user's
  password but only receive the authorization token after the
  user authenticated with Adobe IMS.


USAGE
  $ aio auth:login

OPTIONS
  -b, --bare     print access token only
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

  * aio-lib-ims-jwt for JWT token based login supporting
     Adobe I/O Console service integrations.
  * aio-lib-ims-oauth for browser based OAuth2 login. This
     plugin will launch a Chromium browser to guide the user through the
     login process. The plugin itself will *never* see the user's
     password but only receive the authorization token after the
     user authenticated with Adobe IMS.

ALIASES
  $ aio login
```

_See code: [src/commands/auth/login.js](https://github.com/adobe/aio-cli-plugin-auth/blob/2.4.2/src/commands/auth/login.js)_

## `aio auth:logout`

Log out the current or a named Adobe IMS context.

```
Log out the current or a named Adobe IMS context.

This command can be called multiple times on the same Adobe IMS context with
out causing any errors. The assumption is that after calling this command
without an error, the Adobe IMS context's access and refresh tokens have been
invalidated and removed from persistent storage. Repeatedly calling this
command will just do nothing.


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
  invalidated and removed from persistent storage. Repeatedly calling this
  command will just do nothing.

ALIASES
  $ aio logout
```

_See code: [src/commands/auth/logout.js](https://github.com/adobe/aio-cli-plugin-auth/blob/2.4.2/src/commands/auth/logout.js)_
<!-- commandsstop -->


# Contributing
Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.


# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
