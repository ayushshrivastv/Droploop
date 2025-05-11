#!/bin/bash

# Find all TypeScript and TypeScript React files in the src directory
# and replace all instances of "~/ with "@/ in import statements
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/from "~\//from "@\//g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import("/import("@\//g'
