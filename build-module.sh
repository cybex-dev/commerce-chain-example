#!/bin/zsh

echo "Building module"
if [[ -d "./commerce-chain-module" ]]; then
	echo "Cleaning module directory"
	rm -rf ./commerce-chain-module
	mkdir "./commerce-chain-module"
fi

echo "Copying files"
cp README.md ./commerce-chain-module/README.md
cp app_config.json ./commerce-chain-module/app_config.json
cp package.json ./commerce-chain-module/package.json
cp -r contracts ./commerce-chain-module/contracts
cp ./*.js ./commerce-chain-module/

if [[ "$1" == "--publish" ]] || [[ "$1" == "-p" ]]; then
	echo "Publishing module"
	cd "./commerce-chain-module"
	npm publish
fi

echo "Done"
