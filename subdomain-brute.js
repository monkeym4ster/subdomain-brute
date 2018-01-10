#!/usr/bin/env node

const fs = require('fs')
const Path = require('path')
const Program = require('commander')
const ProgressBar = require('progress')
const Pack = require('./package')
const SubdomainBrute = require('./libs')
const chalk = require('chalk')
const debug = require('debug')('subdomain-brute:cli')

const main = async () => {
  const opts = Program
    .version(Pack.version)
    .usage('[options] DOMAIN')
    .description('Subdomain brute')
    .option('--dns-server [server]', 'Comma separated list of server to query', val => val.split(','), ['223.5.5.5', '223.6.6.6', '119.29.29.29', '182.254.116.116'])
    .option('-f <file>', 'Dictionary file path', 'subnames.txt')
    .option('--full', 'Full scan, NAMES FILE subnames_full.txt will be used to brute')
    .option('-c, --concurrency <num>', 'Start specified NUMBER of concurrency', Math.abs, 50)
    .option('-o, --output <path>', 'Output file')
    .parse(process.argv)

  const outputFile = opts.output
  const concurrency = opts.concurrency
  const dnsServer = opts.dnsServer
  const full = opts.full
  let dictFile = opts.F
  const domain = opts.args[0]

  // 没带任何参数
  if (process.argv.length < 3) {
    opts.outputHelp()
    process.exit(0)
  }

  // 没指定域名
  if (!domain) throw new Error('Domain is required.')

  // 使用大字典
  if (full && dictFile === 'subnames.txt') dictFile = 'subnames_full.txt'
  
  // 字典文件路径，先从相对路径找，然后再去 dict 目录找。
  const files = [ Path.resolve(dictFile), Path.join(__dirname, 'dict', dictFile) ]
  const filePathList = files.filter(_ => { return fs.existsSync(_) })
  if (!filePathList.length) throw new Error(`Dict file not exists: ${dictFile}`)
  dictFile = filePathList[0]

  const brute = new SubdomainBrute({ concurrency, dnsServer, dictFile, domain, full })

  console.log(chalk.dim(`[*] Options: ${JSON.stringify(brute.opts)}`))
  // 加载字典文件
  console.log(chalk.dim(`[*] Load dict files...`))
  brute.domains = await brute.generateDict()
  // 加载字典文件成功，输出日志
  console.log(chalk.dim(`[*] Load domains ${brute.domains.length} success.`))
  // 有效数量
  let valid = 0
  // 进度条
  const bar = new ProgressBar(':valid Found(:rate Domain/s) | :current/:total(:percent) scanned in :elapseds, :etas left', { total: brute.domains.length })
  // handle
  brute.callback = (err, data) => {
    if (!err) valid += 1
    // 进度条 +1
    bar.tick({ valid })
    // 仅记录有效的数据
    if (err) return false
    const { domain, result } = data
    // 打印有效数据
    bar.interrupt(chalk.green(`${domain}\t${result.map(_ => _.value).join(',')}`), {})
    // 写入有效数据
    const outputFilePath = Path.resolve(outputFile || `${brute.opts.domain}.txt`)
    fs.appendFile(outputFilePath, JSON.stringify(data) + '\n', (err) => {
      if (err) throw new Error(err)
    })
  }
  brute.run()
}

if (process.mainModule) main().catch((e) => {
  console.error(chalk.red(`[-] Error. ${e.message}`))
  process.exit(-1)
})
