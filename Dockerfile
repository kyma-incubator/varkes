FROM ubuntu:16.04

# Get dependencies for curl of the docker
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

ENTRYPOINT echo $PULL_BASE_REF \
    && git fetch origin pull/$PULL_NUMBER/head:pr-$PULL_NUMBER \
    && git checkout pr-$PULL_NUMBER \
    && chmod -R 777 . \
    && /varkes/test.sh \
    && exec bash