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

# replace $DATE in src/days/$datename/index.ts file in-place
sed -i '' "s/\$DATE/$datename/g" "src/days/$datename/index.ts"