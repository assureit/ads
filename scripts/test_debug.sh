#!/bin/sh

tsc @compile_list
node-inspector&
mocha --recursive --debug-brk