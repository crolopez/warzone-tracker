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
| DATABASE_CONNECTION_STRING | Connection string to the MongoDB service |
| ACCEPT_SSO_FROM | Accept SSO tokens only of the user specified here |
| MAX_REPORTS_PER_USER | Maximum reports to be sent per user at once. It is recommended not to use more than 4 |
| ADMIN_COMMANDS | If some commands need admin privileges. Accepted values: `true` or `false` |
| TIME_BETWEEN_SESSIONS | Time in minutes since the last game to report a user's session |

Example:

``` bash
TELEGRAM_BOT_TOKEN=129238594:AAF5Safasfj899834781l8asdaszZ3
DATABASE_CONNECTION_STRING=https://db8a89sd9keladsa.asd992klas.com/user=9384839
ACCEPT_SSO_FROM=manoleitor#53781
MAX_REPORTS_PER_USER=4
ADMIN_COMMANDS=true
TIME_BETWEEN_SESSIONS=90
```

## Telegram commands

These are the commands you can interact with using the Telegram bot.

| Command | Description | Administrator only option |
|-|-|-|
| `/UpdateSSO <SSO>` | Register a SSO to be able to use the bot | Yes |
| `/Version` | Get the bot version | No |
| `/LastMatch <User>` | Get user last match | No |
| `/RegisterUserReports <User>` | Register user reports for the invoking channel | Yes |

## Scheduled reports

Scheduled reports are events that are launched every X amount of time to perform periodic reports and their activation depends on the serverless platform where this project is deployed.

To do this, we must first register the user whose gaming reports we want to receive using the `/RegisterUserReports <User>` command from one or more groups.

The project is tested on AWS Lambda functions but could be adapted to other types of serverless platforms by modifying the recipe for deployment without changing the production code.

### Post-match results

It is possible to receive the results of a match as soon as it is over on the desired channels.

If we want to enable this functionality, we just have to set the `postMatchReports` field to true on [serverless.yml](./serverless.yml) file.

### Post-session report

We can receive the gaming session overview when it has ended if we see the `sessionReports` field to true as mentioned in the previous paragraph.

The amount of time that the engine waits until sending the session report is defined by the `TIME_BETWEEN_SESSIONS` environment variable.
