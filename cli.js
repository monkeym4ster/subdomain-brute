import fs from 'fs'
import Path from 'path'
import Program from 'commander'
import Pack from './package'
import SubdomainBrute from './'

const opts = Program
  .version(Pack.version)
  .usage('[options] DOMAIN')
  .description(`Subdomain brute`)
  .option('--target <domain>', 'target domain name')
  .option('-o --out-put <file>', 'Output filename', 'result.txt')
  .option('-c --concurrency <num>', 'Start specified NUMBER of concurrency', Math.abs, 50)
  .option('--server <server>', 'Comma separated list of server to query', val => val.split(','), ['223.5.5.5','223.6.6.6','119.29.29.29','182.254.116.116'])
  .option('--file-path <file>', 'Dictionary file path', Path.join(__dirname, 'dict', 'small.txt'))
  .parse(process.argv)

const bye = n => process.exit(n)
const printError = str => console.error(str)
const printInfo = str => console.info(str)

if (!process.argv.slice(2).length) {
  printInfo(`  ${Pack.name} ${Pack.version} by ${Pack.author}`)
  opts.outputHelp()
  bye(0)
}

if (!opts.target) {
  printError('The target is required')
  bye(1)
}

const callback = (err, data) => {
  if (err) return false
  const { domain, result } = data
  const line = `${domain}\t${Array.isArray(result) ? result.join(', ') : JSON.stringify(result)}\n`
  fs.appendFile(opts.outPut, line, (err) => null)
}

const brute = new SubdomainBrute(opts, callback)

console.time('subdomain-brute')
brute
  .run()
  .then(() => {
    console.timeEnd('subdomain-brute')
    bye()
  })
  .catch(_ => console.log('ERROR', _.message))