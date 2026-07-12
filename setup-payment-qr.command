#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$HOME/Downloads/QR.jpg"
TARGET="$PROJECT_DIR/frontend/public/QR.jpg"

if [ ! -f "$SOURCE" ]; then
  echo "QR.jpg was not found in Downloads."
  echo "Put your payment QR at: $SOURCE"
  read -r -p "Press Enter to close..."
  exit 1
fi

cp "$SOURCE" "$TARGET"
echo "Payment QR copied successfully to:"
echo "$TARGET"
read -r -p "Press Enter to close..."
