#!/bin/bash
# Example of how to invoke local lambda
sam local invoke -n env-local.json --docker-network promo-bot-mx_local-dev GetHotPromos
