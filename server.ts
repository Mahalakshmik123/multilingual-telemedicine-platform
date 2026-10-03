import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB, getDBStatus } from './server/config/db.ts';
import { seedDatabase } from './server/seed.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import doctorRoutes from './server/routes/doctorRoutes.ts';
import appointmentRoutes from './server/routes/appointmentRoutes.ts';
import consultationRoutes from './server/routes/consultationRoutes.ts';
import translationRoutes from './server/routes/translationRoutes.ts';
import medicalTermRoutes from './server/routes/medicalTermRoutes.ts';
import prescriptionRoutes from './server/routes/prescriptionRoutes.ts';
import interpreterRoutes from './server/routes/interpreterRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import { setupConsultationSockets } from './server/sockets/consultationSocket.ts';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with permissive CORS for the preview environment
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach sockets
setupConsultationSockets(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and System Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Multilingual Telemedicine Platform API',
    database: getDBStatus(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Seed & Reset endpoint for demo convenience
app.post('/api/seed', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    await seedDatabase(force);
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to seed database', error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/medical-terms', medicalTermRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/interpreter-requests', interpreterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Connect DB & Seed initial data
(async () => {
  await connectDB();
  await seedDatabase(false);
})();

// Vite Integration & Static File Serving
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Telemedicine Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
