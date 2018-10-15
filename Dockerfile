FROM ubuntu:16.04

# Get dependencies for curl of the docker

RUN apt-get update && apt-get install -y \
    bash \
    curl \
    make \
    git \
    vim \
    sudo \
    npm \
    dialog \
    apt-transport-https \
    ca-certificates \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

RUN DEBIAN_FRONTEND=noninteractive curl -sSL https://get.docker.com/ | sh

RUN git clone https://github.com/kyma-incubator/varkes.git
WORKDIR /varkes
RUN apt install -y nodejs

ENTRYPOINT git fetch origin pull/$PULL_NUMBER/head:pr-$PULL_NUMBER \
    && git checkout pr-$PULL_NUMBER \
    && export PULL_NUMBER \
    && chmod -R 777 . \
    && /varkes/test.sh \
    && exec bash
