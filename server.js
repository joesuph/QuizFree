const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('<script>document.location.href = http://localhost:3000/quizlet.html;</script>')
})
app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})