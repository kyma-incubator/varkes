FROM node:alpine

COPY . /odata-mock
WORKDIR /odata-mock

RUN npm install

EXPOSE 10000
CMD ["npm","start"]