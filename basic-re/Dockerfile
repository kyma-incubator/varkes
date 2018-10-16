FROM node:alpine

#RUN git clone https://github.com/kyma-incubator/varkes.git

COPY ../app-connector .
RUN npm --prefix ./app-connector link ./app-connector


COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 4000
RUN varkes-connector-cli
CMD ["npm","start"]