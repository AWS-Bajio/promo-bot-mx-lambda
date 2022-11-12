#!/bin/bash
source .env
sam deploy --parameter-overrides "TelegramURL=$TELEGRAM_URL" "TelegramChatId=$TELEGRAM_CHAT_ID" "TwitterApplicationConsumerKey=$TWITTER_APPLICATION_CONSUMER_KEY" "TwitterApplicationSecret=$TWITTER_APPLICATION_SECRET" "TwitterUserAccessToken=$TWITTER_USER_ACCESS_TOKEN" "TwitterUserSecret=$TWITTER_USER_SECRET" --profile $AWS_LOCAL_PROFILE --capabilities CAPABILITY_NAMED_IAM
