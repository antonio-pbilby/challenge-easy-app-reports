import express, { json, Request, Response } from 'express'

const start = async () => {
  const app = express();

  app.use(json());

  app.get('/', (req: Request, res: Response) => {
    res.send('uai')
  })

  app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`)
  });
}

start();