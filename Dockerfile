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


COPY . /varkes
RUN echo 'alias openapi="cd /varkes/openapi-mock"' >> ~/.bashrc
WORKDIR /varkes/openapi-mock
CMD ["make","resolve"]