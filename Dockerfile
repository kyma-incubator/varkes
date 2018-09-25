FROM ubuntu:16.04

LABEL source="git@github.com:kyma-incubator/varkes.git"


# Get dependencies for curl of the docker
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    jq \
    vim \
    make \
    socat \
    sudo \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -

RUN apt install -y nodejs

COPY . /varkes
WORKDIR /varkes/openapi-mock
RUN npm install
ENTRYPOINT /varkes/test.sh