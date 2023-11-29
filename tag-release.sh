#!/bin/zsh
RELEASE_VERSION=$(node -p "require('./package.json').version")
git tag v"$RELEASE_VERSION" -m "release version $RELEASE_VERSION" && git push origin v"$RELEASE_VERSION"