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
    nodejs \
    sudo \
    npm \
    && rm -rf /var/lib/apt/lists/*


RUN git clone -b test_prow https://github.com/kyma-incubator/varkes.git

WORKDIR /varkes
RUN chmod -R 777 .
RUN git config --add remote.origin.fetch +refs/pull/*/merge:refs/remotes/origin/pr/*/merge
RUN git fetch
#ENTRYPOINT  /varkes/test.sh \
#   && exec bash