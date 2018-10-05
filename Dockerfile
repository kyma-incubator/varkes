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

RUN chmod -R 777 .
ENTRYPOINT git checkout $PULL_BASE_REF \
    && git pull \
    && echo $PULL_BASE_REF \
    && exec bash