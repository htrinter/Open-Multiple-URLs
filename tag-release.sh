#!/bin/zsh
git tag v$1 -m "release version $1" && git push origin v$1