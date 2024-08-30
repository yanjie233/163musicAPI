const fs = require('fs')
const path = require('path')
const express = require('express')
const tmpPath = require('os').tmpdir()
const { cookieToJson } = require('./util')

// 创建 Express 应用
const app = express()

if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
  fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8')
}

let firstRun = true
/** @type {Record<string, any>} */
let obj = {}
fs.readdirSync(path.join(__dirname, 'module'))
  .reverse()
  .forEach((file) => {
    if (!file.endsWith('.js')) return
    let fileModule = require(path.join(__dirname, 'module', file))
    let fn = file.split('.').shift() || ''
    obj[fn] = function (data = {}) {
      if (typeof data.cookie === 'string') {
        data.cookie = cookieToJson(data.cookie)
      }
      return fileModule(
        {
          ...data,
          cookie: data.cookie ? data.cookie : {},
        },
        async (...args) => {
          if (firstRun) {
            firstRun = false
            const generateConfig = require('./generateConfig')
            await generateConfig()
          }
          // 待优化
          const request = require('./util/request')

          return request(...args)
        },
      )
    }
  })

// 设置 API 路由
Object.keys(obj).forEach(key => {
  app.use(`/api/${key}`, (req, res) => {
    obj[key](req.query)
      .then(result => res.json(result))
      .catch(error => res.status(500).json({ error: error.message }))
  })
})

// Serve Vue.js 应用
app.use(express.static(path.join(__dirname, 'dist')))

// 处理所有其他路由，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 启动服务器
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

module.exports = {
  ...require('./server'),
  ...obj,
}
