import express from 'express'


const app = express()

app.get('/health' , (req, res) =>{
    res.json({message:'working'})
})


export {app}

export default app