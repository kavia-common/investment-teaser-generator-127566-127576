#!/bin/bash
cd /home/kavia/workspace/code-generation/investment-teaser-generator-127566-127576/frontend_web
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

