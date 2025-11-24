import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import foldersRoutes from './routes/folders.routes';
import decksRoutes from './routes/decks.routes';
import './db/connection';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', foldersRoutes);
app.use('/api', decksRoutes);

app.get('/', (_, res) => {
  res.send('Backend is running with PostgreSQL!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
