FROM node:alpine

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 10000
CMD ["node","app.js","./config.js"]