FROM node:11-alpine as builder
RUN apk --no-cache upgrade

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile

FROM node:11-alpine

COPY --from=builder /app/dist /app/dist
WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
RUN npm install

CMD ["npm","start"]