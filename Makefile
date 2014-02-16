COFFEE = node_modules/.bin/coffee

JS_FILES = $(patsubst src/%.coffee,lib/%.js,$(shell find src -type f))


.PHONY: all
all: $(JS_FILES)

lib/%.js: src/%.coffee
	$(COFFEE) --compile --output $(@D) $<


.PHONY: clean
clean:
	rm -f $(JS_FILES)


.PHONY: setup
setup:
	npm install


.PHONY: test
test: all
	open test/tests.html
