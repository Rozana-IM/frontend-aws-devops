#!/bin/bash
set -e

echo "===================================="
echo " Building static frontend site"
echo "===================================="

# Clean old build
rm -rf build
mkdir -p build

# Copy all public assets (HTML + CSS)
# Copy all frontend files
cp -r public/* build/


# (Optional) copy JS if needed later
cp -r src build/

echo "===================================="
echo " Build completed successfully"
echo " Output directory: build/"
echo "===================================="
