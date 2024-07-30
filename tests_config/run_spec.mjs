import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import prettier from 'prettier';

const IGNORED_FILES_SAME_CONTENT = new Set([
  'tests/good/escaped_pipes.feature',
  'tests/plugin/unescape_backslashes_table_cell.feature',
  'tests/plugin/datatable_with_PHP_FQCN.feature',
  'tests/good/tags.feature',
  'tests/good/scenario_outline_with_value_with_trailing_backslash.feature',
]);

function fileContentShouldBeTheSameExceptSpacing(filepath) {
  return !IGNORED_FILES_SAME_CONTENT.has(filepath);
}

function run_spec(importMeta, options) {
  const dirname = path.dirname(url.fileURLToPath(importMeta.url));

  fs.readdirSync(dirname).forEach((filename) => {
    const filepath = dirname + '/' + filename;

    if (
      path.extname(filename) !== '.snap' && // Skip snapshots
      fs.lstatSync(filepath).isFile() && // Skip directories
      filename[0] !== '.' && // Skip dotfiles
      filename !== 'jsfmt.spec.mjs' // Skip self
    ) {
      let rangeStart = 0;
      let rangeEnd = Infinity;
      let cursorOffset;
      const source = read(filepath)
        .replace(/\r\n/g, '\n')
        .replace('<<<PRETTIER_RANGE_START>>>', (match, offset) => {
          rangeStart = offset;
          return '';
        })
        .replace('<<<PRETTIER_RANGE_END>>>', (match, offset) => {
          rangeEnd = offset;
          return '';
        });

      const input = source.replace('<|>', (match, offset) => {
        cursorOffset = offset;
        return '';
      });

      const mergedOptions = Object.assign(mergeDefaultOptions(options || {}), {
        filepath,
        rangeStart,
        rangeEnd,
        cursorOffset,
      });

      const separator = '~'.repeat(mergedOptions.printWidth);
      const firstLineSeparator = separator + '\n';
      const lineSeparator = '\n' + separator + '\n';
      const lastLineSeparator = '\n' + separator;

      test(filename, async () => {
        const getOutput = async (options) => {
          const output = await prettyprint(input, {
            ...mergedOptions,
            ...options,
          });

          return {
            output,
            snapshot:
              lineSeparator +
              'options: ' +
              JSON.stringify(options, undefined, 1) +
              lineSeparator +
              output,
          };
        };

        const defaultOutput = await getOutput({});
        const overrideTabWidthOutput = await getOutput({
          tabWidth: 4,
        });
        const outputWithNewline = await getOutput({
          forceNewlineBetweenStepBlocks: true,
        });

        expect(
          raw(
            firstLineSeparator +
              'source' +
              lineSeparator +
              source +
              defaultOutput.snapshot +
              overrideTabWidthOutput.snapshot +
              outputWithNewline.snapshot +
              lastLineSeparator
          )
        ).toMatchSnapshot();

        if (
          fileContentShouldBeTheSameExceptSpacing(
            filepath.substring(process.cwd().length + 1)
          )
        ) {
          expect(input.replace(/\s/g, '')).toBe(
            defaultOutput.output.replace(/\s/g, '')
          );
        }
      });
    }
  });
}

globalThis.run_spec = run_spec;

async function prettyprint(src, options) {
  const result = await prettier.formatWithCursor(src, options);

  if (options.cursorOffset >= 0) {
    result.formatted =
      result.formatted.slice(0, result.cursorOffset) +
      '<|>' +
      result.formatted.slice(result.cursorOffset);
  }
  return result.formatted;
}

function read(filename) {
  return fs.readFileSync(filename, 'utf8');
}

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string) {
  if (typeof string !== 'string') {
    throw new Error('Raw snapshots have to be strings.');
  }
  return { [Symbol.for('raw')]: string };
}

function mergeDefaultOptions(parserConfig) {
  const pluginPath = `${path.resolve()}/dist/index.js`;

  return Object.assign(
    {
      plugins: [pluginPath],
      printWidth: 80,
    },
    parserConfig
  );
}
