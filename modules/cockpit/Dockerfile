FROM node:11-alpine as builder

WORKDIR /cockpit
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile

FROM node:11-alpine
RUN apk --no-cache upgrade

COPY --from=builder /cockpit/dist /cockpit/dist
WORKDIR /cockpit

COPY package*.json ./

ENV NODE_ENV=production
RUN npm install
EXPOSE 3000
CMD [ "npm","start" ]