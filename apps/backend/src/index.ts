import express from 'express';
import cors from 'cors';
import flashcardsRoutes from './routes/flashcards.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', flashcardsRoutes);

app.get('/', (_, res) => {
  res.send('Backend is running');
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
