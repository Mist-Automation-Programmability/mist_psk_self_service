FROM node:14-alpine
LABEL fr.mist-lab.mpss.version="0.0.1"
LABEL fr.mist-lab.mpss.release-date="2021-05-02"

RUN apk update && apk add bash openssl

COPY ./src /app/

WORKDIR /app

RUN npm	install

RUN addgroup --gid 1000 -S mistlab && adduser --uid 1000 -S mistlab -G mistlab
RUN chown -R mistlab:mistlab /app
USER mistlab

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]


