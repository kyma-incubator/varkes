set -e
make -f ./openapi-mock/makeFile
make resolve
make validate