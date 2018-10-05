# Serverless Confirm Command

[![serverless](http://public.serverless.com/badges/v3.svg)](https://www.serverless.com)
[![npm package](https://badge.fury.io/js/serverless-confirm-command.svg)](https://badge.fury.io/js/serverless-confirm-command)
[![License](https://img.shields.io/badge/License-MIT-lightrey.svg)](https://opensource.org/licenses/MIT)

This [Serverless Framework](https://github.com/serverless/serverless) plugin allows you to define commands (as well as provider-specific options) that will require confirmation before being executed.

## Features

- Works with any cloud provider (and any runtime)
- Supports `deploy` and `remove` commands
- Supports AWS stages and command/stage pairs

## Changelog

You can find the [changelog](https://github.com/teddy-gustiaux/serverless-confirm-command/blob/master/CHANGELOG.md) here or in the [releases](https://github.com/teddy-gustiaux/serverless-confirm-command/releases) section.

## Disclaimer

One of the intentions of this plugin is to make it more difficult to accidentally deploy or remove a serverless application when it should not.
Although it provides another layer of protection, it does *not* replace deployment and security policies for your applications.
Please do not forget to set up and protect your deployments appropriately (especially your production environment).

## Documentation

- [Prerequistes](#prerequistes)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Example](#example)
- [License](#license)

## Prerequistes

- Serverless Framework `1.0.0` or more recent
- Node.js `6.4.0` or more recent

## Installation

Install the plugin by running:

`npm install serverless-confirm-command --save-dev`

Alternatively, if you are using Yarn:

`yarn add serverless-confirm-command --dev`

Then add the plugin to your `serverless.yml` file plugin section:

```YAML
plugins:
  - serverless-confirm-command
```

## Configuration

You must configure the plugin in the custom section of your `serverless.yml` file, in a dedicated `confirm` section.
All options (provider-agnostic or not) can be used at the same time.

### Commands (provider-agnostic)

List the commands you want to confirm in a sub-section of the same name.

```YAML
custom:
  confirm:
    commands:
      - 'deploy'
      - 'remove'
```

For instance, the configuration above will require both the `deploy` and `remove` commands to be confirmed.

### AWS options

In you are using AWS as your cloud provider, you can set up any stage and/or command/stage pair to require confirmation.

```YAML
custom:
  confirm:
    aws:
      stages:
        - 'release'
      commandsForStages: # Must be listed as 'command:stage'
        - 'remove:prod'
```

For instance, the configuration above will require the following cases to be confirmed:

- Any command using the stage `release`
- The `remove` command used in combination with the `prod` stage

You can list as many stages and command/stage pairs as you want (as long as the command is supported by the plugin).

## Usage

Once you have configured the plugin, you can continue to use the Serverless Framework exactly as you were before.
The commands (and potentially the other options) you have configured will now need to be confirmed.

To confirm a command (or any option), you must provide the CLI option `--confirm` when using Serverless.

## Example

Let us assume you want to configure the `remove` command to require confirmation to prevent accidental deletion of your application.

Configuration of the plugin:

```YAML
custom:
  confirm:
    commands:
      - 'remove'
```

Using the command `serverless remove` will produce an error:

```YAML
  Serverless Error ---------------------------------------

  Command not confirmed. Use [--confirm] or change the configuration of the plugin.
```

Using the command `serverless remove --confirm` will suceed!

## License

Distributed under the [MIT license](http://opensource.org/licenses/MIT).
