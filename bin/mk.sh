#!/bin/sh

name="$1"
os="$2"

APP="goreact"
CURDIR=`pwd`
OLDGOPATH="$GOPATH"
export GOPATH="$OLDGOPATH:$CURDIR"

if [ "$name" = "run" ]; then
    echo "Running test debug model..."
    go run src/*.go
else
    echo "Build for bin/$APP"
    gofmt -w src/*.go 
    if [ "$os" = "linux" ]; then
        export CGO_ENABLED=0 GOOS=linux GOARCH=amd64
        go build -v -o bin/${APP}.lin src/*.go
    elif [ "$os" = "bsd" ]; then
        export CGO_ENABLED=0 GOOS=freebsd GOARCH=amd64
        go build -v -o bin/${APP}.bsd src/*.go
    else 
        go build -v -o bin/${APP} src/*.go
    fi
fi

status="$?"

export GOPATH="$OLDGOPATH"
exit $status
