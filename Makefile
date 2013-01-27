.PHONY: setup test

bin = node_modules/.bin

lib/jquery.localize.js: src/jquery.localize.coffee
	@cat $< | $(bin)/coffee --compile --stdio > $@

setup:
	@npm install

test:
	@make lib/jquery.localize.js
	@open test/tests.html
