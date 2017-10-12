import fs from 'fs'
import SubdomainBrute from '../'

const opts = {
  server: ['223.5.5.5','223.6.6.6','119.29.29.29','182.254.116.116'],
  target: 'iqiyi.com',
  filePath: './dict/small.txt',
  concurrency: 50,
}

const callback = (err, data) => {
  if (err) return false
  const { domain, result } = data
  const line = `${domain}\t${Array.isArray(result) ? result.join(', ') : JSON.stringify(result)}\n`
  fs.appendFile('./result.txt', line, (err) => null)
}

const brute = new SubdomainBrute(opts, callback)


console.time('subdomain-brute')
brute
  .run()
  .then(() => {
    console.timeEnd('subdomain-brute')
    process.exit()
  })
  .catch(_ => console.log('ERROR', _.message))