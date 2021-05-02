FROM node:14-alpine
LABEL fr.mist-lab.mpss.version="0.0.1"
LABEL fr.mist-lab.mpss.release-date="2021-05-02"

COPY ./src /app/

WORKDIR /app

RUN npm	install


EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]


