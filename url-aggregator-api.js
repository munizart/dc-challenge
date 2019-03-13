const express = require('express')
const app = express()
const { performance } = require('perf_hooks')

let hits = 0
let notFound = 0

app.use((req, res, next) => {
    req.receivedAt = performance.now()
    next()
})

app.get('/images/:img.png', (req, res) => {
    hits++
    const { img } = req.params
    if (parseInt(img, 10) % 5 === 0) {
        res.status(404).send('There\'s no such image!')
        notFound++
    } else {
        res.send('You got a 200!')
    }
    process.nextTick(() => {
      console.log(`404:\t${notFound}\thits:\t${hits}\t${ performance.now() - req.receivedAt }`)
    })
})

app.listen(4567, () => {
    console.log('listening at 4567\n')
})

