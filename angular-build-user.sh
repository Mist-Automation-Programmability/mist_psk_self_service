#!/bin/bash

cd angular-user/
ng build --deploy-url static/
cp -R dist/angular-user ../src/public/
cp dist/angular-user/index.html ../src/views/user.html
cd ..
