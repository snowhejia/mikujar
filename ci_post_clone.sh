#!/bin/sh
# Xcode Cloud：克隆仓库后、解析 Swift Package 之前执行。
# ios/App/CapApp-SPM/Package.swift 依赖 ../../../node_modules/@capacitor/keyboard，须先有 node_modules。
set -e
cd "${CI_PRIMARY_REPOSITORY_PATH:-.}"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
