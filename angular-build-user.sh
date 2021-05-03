#!/bin/bash

cd angular-user/
ng build --deploy-url /ng/user/ --prod
rm -rf ../src/public/ng/user/*
cp ./dist/angular-user/* ../src/public/ng/user
cp ./dist/angular-user/index.html ../src/views/user.html

