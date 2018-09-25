FROM node:alpine

RUN apk add --no-cache openssl

WORKDIR /app 
COPY package*.json ./

RUN npm install



COPY . .


EXPOSE 4444
CMD ["npm","start"]