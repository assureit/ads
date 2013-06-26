#!/bin/sh

SHELL_PATH=$(cd $(dirname $0);pwd)
ROOT_PATH=$(dirname $SHELL_PATH)
APP_PATH="$ROOT_PATH/app"
PATH=$APP_PATH/node_modules/bin:$PATH