#!/bin/bash
set -e

# Update remote info
git fetch --prune

# Delete all remote branches merged into main, except main/master
git branch -r --merged origin/main \
  | grep -vE 'origin/(main|master)' \
  | sed 's/origin\///' \
  | xargs -n 1 git push origin --delete
