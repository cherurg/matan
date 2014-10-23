connect = require 'connect'
http = require 'http'
morgan = require 'morgan'
serveStatic = require 'serve-static'

serve = serveStatic 'public'

app = connect()
  .use morgan 'combined'
  .use serve

http.createServer app
  .listen 80