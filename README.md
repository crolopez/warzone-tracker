# Warzone Tracker

Serverless application to get player performance information after each game or on-demand in Call of Duty: Warzone.

At the moment, this service can only be used through its integration with Telegram using a bot. Support for other formats will be added in the future.

## How to deploy

The project has been prepared to run in a serverless environment. You can get an idea of what you need to deploy it by checking [serverless.yml](./serverless.yml) and [config.yml](./circleci/config.yml) files.

However, if you want to deploy it locally, or in a non-serverless environment, just run the following commands:

``` bash
yarn install
yarn build
yarn start:local
```

## Configure

To configure the application you have to set the following environment variables:

| Field | Description |
|-|-|
| TELEGRAM_BOT_TOKEN | API token from your Telegram bot |

Example:

``` bash
TELEGRAM_BOT_TOKEN=129238594:AAF5Safasfj899834781l8asdaszZ3
```

## Telegram commands

These are the commands you can interact with using the Telegram bot.

| Command | Description |
|-|-|
| `/Version` | Get the bot version. |
