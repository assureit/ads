#!/bin/sh

source ../scripts/common.sh
tsc @compile_list
export NODE_ENV=test
mocha --recursive