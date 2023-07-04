FROM node:16.20.1-alpine
LABEL fr.mist-lab.mpss.version="0.0.1"
LABEL fr.mist-lab.mpss.release-date="2021-05-02"

RUN apk update && apk add bash openssl

COPY ./src /app/

WORKDIR /app

RUN npm	install

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]


