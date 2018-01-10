const Dns = require('dns')
const Net = require('net')
const fs = require('fs')
const Path = require('path')
const Promise = require('bluebird')
const debug = require('debug')('subdomain-brute:main')

class DomainBrute {
  constructor(opts) {
    this.opts = opts
    this.callback = () => {}
    Dns.setServers(opts.dnsServer)
    return this
  }

  async generateDict () {
    const { domain, dictFile } = this.opts

    // 读取字典文件
    const fileData = fs.readFileSync(this.opts.dictFile, 'utf8')
    let lines = fileData.trim().split('\n')

    let domains = []

    // 根据占位符进行替换
    lines.forEach(line => {
      let name = line.trim()
      // 跳过无效数据
      if (!name) return false
      // 跳过重复数据
      if (domains.includes(name)) return false
      const tmp = [ name ]
      while (tmp.length > 0) {
        const item = tmp.pop()
        if (item.includes('{alphnum}')) {
          for (const i of 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')) {
            name = item.replace('{alphnum}', i)
            tmp.push(name)
          }
        } else {
          domains.push(item)
        }
      }
    })

    // 数据去重
    domains = Array.from(new Set(domains))
    return domains.map(_ => [_, domain].join('.'))
  }

  resolve (domain, type) {
    debug(`Resolve domain ${domain}(${type})`)
    return new Promise((resolve, reject) => {
      Dns.resolve(domain, type, (err, result) => {
        if (err) debug(`Resolve ${domain} failed. ${err.message}`)
        return resolve(result)
      })
    })
  }

  async resolveDomain (domain) {
    let result = []
    const resultA = await this.resolve(domain, 'A')
    // 存在 A 记录
    if (resultA && resultA.length) {
      result = result.concat(resultA.map(_ => ({ value: _, type: 'A' })))
    }
    const resultCNAME = await this.resolve(domain, 'CNAME')
    // 存在 CNAME 记录
    if (resultCNAME && resultCNAME.length) {
      result = result.concat(resultCNAME.map(_ => ({ value: _, type: 'CNAME' })))
    }
    const data = { domain, result }
    if (!result.length) {
      this.callback(new Error('Result is empty'))
      return false
    }
    debug(`Resolve ${domain} success: ${result.map(_ => _.value + '(' + _.type + ')').join(',')}`)
    return this.callback(null, data)
  }

  async run () {
    const { concurrency, dnsServer, dictFile, domain } = this.opts
    return Promise.map(this.domains, this.resolveDomain.bind(this), { concurrency })
  }
}

module.exports = DomainBrute