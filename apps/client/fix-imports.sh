#!/bin/bash

# Function to fix imports in a file
fix_imports() {
  local file="$1"
  # Replace motion import with SafeMotion
  sed -i '' 's/import { motion } from ".\/SafeMotion";/import { SafeMotion } from ".\/SafeMotion";/' "$file"
  sed -i '' 's/import { motion } from "..\/SafeMotion";/import { SafeMotion } from "..\/SafeMotion";/' "$file"
  sed -i '' 's/import { motion } from "...\/SafeMotion";/import { SafeMotion } from "...\/SafeMotion";/' "$file"
  # Remove unused motion imports
  sed -i '' '/motion.*} from "motion\/react"/d' "$file"
}

# Find all TypeScript/React files in the components directory
find src/components -type f -name "*.tsx" -exec bash -c 'fix_imports "$0"' {} \;
