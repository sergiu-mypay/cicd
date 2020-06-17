#! /bin/bash

npm install -g serverless
serverless deploy --stage $env --package \   $CODEBUILD_SRC_DIR/target/$env -v -r eu-central-1

changes() {
  git diff --name-only --diff-filter=AMDR --cached @~..@
}

if changes | grep -q dirname {
  echo "start expensive operation"
}
