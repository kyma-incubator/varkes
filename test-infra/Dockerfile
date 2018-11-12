FROM ubuntu:16.04

# Get dependencies for curl of the docker
ENV SECRET_USERNAME = admin
ENV SECRET_PASSWORD = pass

RUN apt-get update && apt-get install -y \
    bash \
    curl \
    jq \
    vim \
    make \
    git \
    socat \
    sudo \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
RUN git clone https://github.com/kyma-incubator/varkes.git
WORKDIR /varkes
RUN apt install -y nodejs

ENTRYPOINT git fetch origin pull/$PULL_NUMBER/head:pr-$PULL_NUMBER \
    && git checkout pr-$PULL_NUMBER \
    && export PULL_NUMBER \
    && chmod -R 777 . \
    && /varkes/test-infra/test.sh \
    && exec bash