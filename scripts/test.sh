#!/bin/sh

source ../scripts/common.sh
tsc @compile_list
mocha --recursive