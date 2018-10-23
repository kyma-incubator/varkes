FROM node:alpine

RUN apk add --no-cache git
RUN git clone -b connector https://github.com/kyma-incubator/varkes.git


RUN npm --prefix ./varkes/app-connector install ./varkes/app-connector


COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 4000
CMD ["sh","start.sh"]