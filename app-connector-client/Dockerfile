FROM node:11-alpine
RUN apk --no-cache upgrade

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 10000
CMD ["npm","start"]