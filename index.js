import Dns from 'dns'
import Net from 'net'
import fs from 'fs'
import Promise from 'bluebird'
import ProgressBar from 'progress'

export default class DomainBrute {
  constructor(opts, callback) {
    const { server, filePath, concurrency, target } = opts
    this.opts = opts
    this.target = target
    this.filePath = filePath
    this.concurrency = concurrency
    this.callback = callback || (() => {})
    this.bar = null
    Dns.setServers(server)
    return this
  }

  readFile (filePath) {
    return fs.readFileSync(filePath, 'utf8')
  }

  generateDict (names) {
    return names.map(_ => [_.trim(), this.target].join('.'))
  }

  httpBanner(ip, vhost) {
    return new Promise((resolve, reject) => {
      const port = 80
      const socket = Net.createConnection({ port, host: ip })
      socket.write(`HEAD / HTTP/1.1\r\nHost: ${vhost}\r\nUser-agent: Mozilla/5.0\r\n\r\n`)
      let data = Buffer('')
      socket
        .setTimeout(2000)
        .on('data', (chunk) => {
          data = Buffer.concat([data, chunk])
          socket.end()
        })
        .on('error', (err) => null)
        .on('end', () => {
          const response = data.toString('utf8')
          const sep = response.includes('\r\n') ? '\r\n' : '\n'
          const headers = response.split(sep)
          for (const field of headers) {
            if (field.startsWith('Server: ')) return resolve(field.substr(8))
          }
          const banner = headers[0].split(' ')
          if (banner.length > 1) return resolve(`HTTP ${banner[1]}`)
          resolve()
        })
    })
  }

  resolveDomain (domain) {
    return new Promise((resolve, reject) => {
      const time = new Date
      Dns.resolve4(domain, (err, result) => {
        const timeEnd = new Date
        const s = timeEnd - time
        this.bar.tick(1)
        if (err) {
          // 返回 reject 将会中断全部 map
          this.callback(err)
          return resolve()
        }

        // 无论有无 banner 都会执行 then 操作
        this.httpBanner(result[0], domain).then((banner) => {
           this.bar.interrupt(`${domain} - ${Array.isArray(result) ? result.join(', ') : JSON.stringify(result)}${banner ? ' [' + banner + ']' : ''} - ${s}ms`)
        })

        this.callback(null, {domain, result})
        return resolve(result)
      })
    })
  }

  async run () {
    console.log(`DEBUG: opts:${JSON.stringify(this.opts)}`)
    const fileData = await this.readFile(this.filePath)
    const names = fileData.trim().split('\n')
    const dict = this.generateDict(names)

    const bar = new ProgressBar('Running [:bar] :current/:total :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: dict.length,
    })

    this.bar = bar
    return Promise.map(dict, this.resolveDomain.bind(this), { concurrency: this.concurrency })
  }
}
