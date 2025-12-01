#!/usr/bin/env bash

datename="$1"
templatename="${2:-template-ts}"

if [ -z "$datename" ]; then
    echo "Usage: $0 <date-name> [template-name]"
    exit 1
fi

if [ ! -d "src/days/$datename" ]; then
    cp -r "src/days/$templatename" "src/days/$datename"
fi