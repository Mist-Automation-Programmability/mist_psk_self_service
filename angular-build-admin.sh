#!/bin/bash


cd angular-admin
ng build --deploy-url /ng/admin/ --prod
rm -rf ../src/public/ng/admin/*
cp ./dist/angular-admin/* ../src/public/ng/admin
cp ./dist/angular-admin/index.html ../src/views/admin.html
