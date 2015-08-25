'use strict';

/**
 * The `kss/generator` module loads the {@link KssGenerator} class constructor.
 * ```
 * var KssGenerator = require('kss/generator');
 * ```
 * @module kss/generator
 */

/* **************************************************************
   See kss_example_generator.js for how to implement a generator.
   ************************************************************** */

var Kss = require('../lib/kss.js'),
  wrench = require('wrench');

var KssGenerator;

/**
 * Create a KssGenerator object.
 *
 * This is the base object used by all kss-node generators. Implementations of
 * KssGenerator MUST pass the version parameter. kss-node will use this to
 * ensure that only compatible generators are used.
 *
 * ```
 * var KssGenerator = require('kss/generator');
 * var customGenerator = new KssGenerator('2.0');
 * ```
 *
 * @constructor
 * @alias KssGenerator
 * @param {string} version The generator API version implemented.
 * @param {object} options The Yargs options this generator has.
 *   See https://github.com/bcoe/yargs/blob/master/README.md#optionskey-opt
 */
module.exports = KssGenerator = function(version, options) {
  if (!(this instanceof KssGenerator)) {
    return new KssGenerator();
  }

  // Tell generators which generator API version is currently running.
  this.API = '2.0';

  // Store the version of the generator API that the generator instance is
  // expecting; we will verify this in checkGenerator().
  this.instanceAPI = typeof version === 'undefined' ? 'undefined' : version;

  // Tell kss-node which Yargs options this generator has.
  this.options = options || {};
};

/**
 * Checks the generator configuration.
 *
 * An instance of KssGenerator MUST NOT override this method. A process
 * controlling the generator should call this method to verify the
 * specified generator has been configured correctly.
 *
 * @alias KssGenerator.prototype.checkGenerator
 */
KssGenerator.prototype.checkGenerator = function() {
  if (!(this instanceof KssGenerator)) {
    throw new Error('The loaded generator is not a KssGenerator object.');
  }
  if (this.instanceAPI === 'undefined') {
    throw new Error('This generator is incompatible with KssGenerator API ' + this.API + ': "' + this.instanceAPI + '"');
  }
};

/**
 * Clone a template's files.
 *
 * This method is fairly simple; it copies one directory to the specified
 * location. An instance of KssGenerator does not need to override this method,
 * but it can if it needs to do something more complicated.
 *
 * @alias KssGenerator.prototype.clone
 * @param {string} templatePath    Path to the template to clone.
 * @param {string} destinationPath Path to the destination of the newly cloned
 *                                 template.
 */
KssGenerator.prototype.clone = function(templatePath, destinationPath) {
  try {
    var error = wrench.copyDirSyncRecursive(
      templatePath,
      destinationPath,
      {
        forceDelete: false,
        excludeHiddenUnix: true
      }
    );
    if (error) {
      throw error;
    }
  } catch (e) {
    throw new Error('Error! This folder already exists: ' + destinationPath);
  }
};

/**
 * Initialize the style guide creation process.
 *
 * This method is given a configuration JSON object with the details of the
 * requested style guide generation. The generator can use this information for
 * any necessary tasks before the KSS parsing of the source files.
 *
 * @alias KssGenerator.prototype.init
 * @param {Array} config Array of configuration for the requested generation.
 */
KssGenerator.prototype.init = function(config) {
  // At the very least, generators MUST save the configuration parameters.
  this.config = config;
};

/**
 * Parse the source files for KSS comments and create a KssStyleguide object.
 *
 * When finished, it passes the completed KssStyleguide to the given callback.
 *
 * @alias KssGenerator.prototype.parse
 * @param {function} callback Function that takes a KssStyleguide and generates
 *                            the HTML files of the style guide.
 */
KssGenerator.prototype.parse = function(callback) {
  if (this.config.verbose) {
    console.log('...Parsing your style guide:');
  }

  /* eslint-disable key-spacing */

  // The default parse() method looks at the paths to the source folders and
  // uses KSS' traverse method to load, read and parse the source files. Other
  // generators may want to use KSS' parse method if they have already loaded
  // the source files through some other mechanism.
  Kss.traverse(this.config.source, {
    multiline: true,
    markdown:  true,
    markup:    true,
    mask:      this.config.mask,
    custom:    this.config.custom
  }, function(err, styleguide) {
    if (err) {
      throw err;
    }
    callback(styleguide);
  });

  /* eslint-enable key-spacing */
};

/* eslint-disable no-unused-vars */

/**
 * Generate the HTML files of the style guide given a KssStyleguide object.
 *
 * This the callback function passed to the parse() method. The callback is
 * wrapped in a closure so that it has access to "this" object (the methods and
 * properties of KssExampleGenerator.)
 *
 * @alias KssGenerator.prototype.generate
 * @param {KssStyleguide} styleguide The KSS style guide in object format.
 */
KssGenerator.prototype.generate = function(styleguide) {
};

/* eslint-enable no-unused-vars */
