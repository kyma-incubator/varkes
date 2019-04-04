FROM node:11-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile

FROM node:11-alpine
RUN apk --no-cache upgrade

COPY --from=builder /app/dist /app/dist
WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
RUN npm install

EXPOSE 10000
CMD ["npm","start"]