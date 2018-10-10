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

RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
RUN sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
RUN sudo apt-get update
RUN apt-cache policy docker-ce
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce
RUN git clone https://github.com/kyma-incubator/varkes.git
WORKDIR /varkes
RUN apt install -y nodejs

ENTRYPOINT git fetch origin pull/$PULL_NUMBER/head:pr-$PULL_NUMBER \
    && git checkout pr-$PULL_NUMBER \
    && export PULL_NUMBER \
    && chmod -R 777 . \
    && /varkes/test.sh \
    && exec bash
