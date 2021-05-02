FROM node:14-alpine
LABEL fr.ah-lab.get-a-key.version="0.0.3"
LABEL fr.ah-lab.get-a-key.release-date="2017-03-11"

COPY ./src /app/

WORKDIR /app

RUN npm	install


EXPOSE 3000
ENTRYPOINT npm start

