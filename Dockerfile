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

ENTRYPOINT git fetch origin pull/31/head:pr-31 \
    && $path = git diff pr-31 --name-only \
    && echo $path \
    && git checkout pr-31 \
    && chmod -R 777 . \
    && /varkes/test.sh \
    && exec bash