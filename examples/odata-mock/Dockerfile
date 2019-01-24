FROM node:11-alpine
RUN apk --no-cache upgrade

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 10000
CMD ["npm","start"]