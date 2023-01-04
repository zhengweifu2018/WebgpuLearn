// vite.config.js
import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"
import dns from 'dns'
dns.setDefaultResultOrder('verbatim')

// Orillusion WebGPU Origin Trial Token
//（chrome 94+ 正式版): 只能 http://localhost:3000/ 或者 https://www.orillusion.com/ 可以使用 
//（chrome cancary): 不需要 WebGPU Origin Trial Token
const devToken = 'AlsgHBaJPdlZ24pkroBSkRHFeYGm+p7QxSiR0reBTV2f60MRKX1GxaJzJHIljZNapPCIuz7+mIGQ2xQFKEaUTgYAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5fQ=='

module.exports = defineConfig({
    server:{
        host: 'localhost',
        port: 3000    
    },
    plugins: [
        react(), 
        {
            name: 'origin-trial',
            configureServer: server => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("origin-trial", devToken)
                    next()
                })
            }
        }
    ]
})