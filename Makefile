COFFEE = node_modules/.bin/coffee

JS_FILES = $(patsubst src/%.coffee,lib/%.js,$(shell find src -type f))


.PHONY: all
all: $(JS_FILES)

lib/%.js: src/%.coffee
	cat $< | $(COFFEE) --compile --stdio > $@


.PHONY: setup
setup:
	npm install


.PHONY: test
test: all
	open test/tests.html
