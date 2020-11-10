FROM node:14-alpine
RUN apk --no-cache upgrade

WORKDIR /app
COPY package*.json ./

ENV NODE_ENV=production
RUN npm install
COPY . .

EXPOSE 10000
CMD ["npm","start"]