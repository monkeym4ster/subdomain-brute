# subdomain-brute

## Usage

### Command line

**Installation**

```bash
$ npm install -g subdomain-brute
# or
$ yarn add global subdomain-brute
```

**Usage information**

```bash
$ subdomain --help

  Usage: subdomain [options] DOMAIN

  Subdomain brute


  Options:

    -V, --version            output the version number
    --dns-server [server]    Comma separated list of server to query (default: 223.5.5.5,223.6.6.6,119.29.29.29,182.254.116.116)
    -f <file>                Dictionary file path (default: subnames.txt)
    --full                   Full scan, NAMES FILE subnames_full.txt will be used to brute
    -c, --concurrency <num>  Start specified NUMBER of concurrency (default: 50)
    -o, --output <path>      Output file
    -h, --help               output usage information
```
