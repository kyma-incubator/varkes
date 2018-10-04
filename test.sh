#!/usr/bin/env bash
cd "openapi-mock"
ls -a
make ci
cd "/varkes/odata-mock"
ls -a
make ci