docs:
	# Build the default builder's Sass.
	if [[ ! -e ./builder/handlebars/node_modules/.bin/node-sass ]]; then cd builder/handlebars && npm install; fi
	cd builder/handlebars && npm run-script sass

	# Build the twig builder's Sass.
	if [[ ! -e ./builder/twig/node_modules/.bin/node-sass ]]; then cd builder/twig && npm install; fi
	cd builder/twig && npm run-script sass

	# Build the kss-node demo.
	./bin/kss --destination docs --demo
	# Build the JS docs.
	echo && echo "Building JavaScript documentation with jsdoc…" && echo
	rm -r ./docs/api/master
	./node_modules/.bin/jsdoc --configure ./docs/api-jsdoc-conf.json
	echo
	./node_modules/.bin/jsdoc --configure ./docs/api-jsdoc-conf.json --destination ./docs/api/master/internals/ --readme ./docs/api-internals.md --access all
	# Clean up the JS docs.
	for HTMLDOC in ./docs/api/*/*.html ./docs/api/*/*/*.html; do cat $$HTMLDOC | sed 's/<title>JSDoc: /<title>KSS JavaScript API: /' | sed -E 's/(Documentation generated by .+<\/a>).+/\1/' > $$HTMLDOC.tmp; mv $$HTMLDOC.tmp $$HTMLDOC; done

.PHONY: docs
