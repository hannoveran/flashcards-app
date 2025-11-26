import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import foldersRoutes from './routes/folders.routes';
import decksRoutes from './routes/decks.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', foldersRoutes);
app.use('/api', decksRoutes);

app.get('/', (_, res) => {
  res.send('Backend is running with PostgreSQL!');
});

export default app;
