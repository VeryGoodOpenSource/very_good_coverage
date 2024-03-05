#!/bin/bash

# Updates the "v3" tag to point to a newer release.
# To be executed whenever a new 1.x tag is created.
# Usage: ./retag_v3.sh <newer-existing-version>

currentBranch=$(git symbolic-ref --short -q HEAD)
if [[ ! $currentBranch == "main" ]]; then
 echo "Re-tagging is only supported on the main branch."
 exit 1
fi

# Get new version
new_version="$1";

if [[ "$new_version" == "" ]]; then
  echo "No new version supplied, please provide one"
  exit 1
fi

git tag -d v3 && git tag v3 v$new_version && git push origin --delete v3 && git push origin v3