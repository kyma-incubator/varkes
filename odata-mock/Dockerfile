FROM node:11-alpine
RUN apk --no-cache upgrade

COPY . /odata-mock
WORKDIR /odata-mock

RUN npm install

EXPOSE 10000
CMD ["npm","start"]