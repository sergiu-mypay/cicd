#! /bin/bash

npm install -g serverless
serverless deploy --stage $STAGE --package \   $SERVICE_PATH/target/$env -v