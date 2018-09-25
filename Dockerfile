FROM ubuntu:16.04

LABEL source="git@github.com:kyma-incubator/varkes.git"


# Get dependencies for curl of the docker
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    jq \
    socat \
    sudo \
    vim \
    zip \
    npm \
    && rm -rf /var/lib/apt/lists/*


# Copying into the container all the necessary files like scripts and resources definition
RUN mkdir /varkes

COPY . /varkes
WORKDIR /app
RUN npm install
ENV IGNORE_TEST_FAIL="true"
ENV RUN_TESTS="true"

RUN echo 'alias kc="kubectl"' >> ~/.bashrc

# minikube and docker start must be done on starting container to make it work
ENTRYPOINT /varkes/test.sh