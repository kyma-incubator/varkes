FROM node:alpine

RUN apk add --no-cache openssl
COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 3000
CMD ["npm","start"]