import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { parseLudopatasPDF } from '../utils/pdfParser';
import { parseLudopatasExcel } from '../utils/excelParser';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Get all records (with pagination/search)
router.get('/ludopatas', authenticateToken, async (req, res) => {
  const { search } = req.query;
  
  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { documento: { contains: String(search) } },
        { personaInscrita: { contains: String(search) } },
        { numRegistro: { contains: String(search) } }
      ];
    }

    const ludopatas = await prisma.ludopata.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000 // Limit for performance
    });

    const systemLog = await prisma.systemLog.findFirst({
      orderBy: { lastPdfUpload: 'desc' }
    });

    res.json({ data: ludopatas, lastUpload: systemLog?.lastPdfUpload });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

// Upload PDF/Excel and process
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  try {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let records: any[] = [];

    if (ext === '.xlsx' || ext === '.xls') {
        records = await parseLudopatasExcel(buffer);
    } else {
        // Default to PDF
        records = await parseLudopatasPDF(buffer);
    }

    if (records.length === 0) {
      return res.status(400).json({ error: 'No se encontraron registros en el archivo.' });
    }

    // Transaction: Delete all old, insert new, log upload
    await prisma.$transaction(async (tx) => {
      // 1. Delete old records
      await tx.ludopata.deleteMany({});

      // 2. Insert new records
      // Use Promise.all with create since createMany might not be available or causing type issues
      if (records.length > 0) {
        // Deduplicate records by 'documento' to avoid unique constraint errors
        const uniqueRecordsMap = new Map();
        for (const record of records) {
            if (!uniqueRecordsMap.has(record.documento)) {
                uniqueRecordsMap.set(record.documento, record);
            }
        }
        const uniqueRecords = Array.from(uniqueRecordsMap.values());
        
        console.log(`Original records: ${records.length}, Unique records: ${uniqueRecords.length}`);

        // Chunking to avoid too many parallel promises if records are huge
        // But for simplicity:
        for (const record of uniqueRecords) {
           await tx.ludopata.create({
             data: record
           });
        }
      }

      // 3. Log system state
      await tx.systemLog.create({
        data: {
          pdfPath: req.file!.path,
          recordCount: records.length,
          lastPdfUpload: new Date()
        }
      });
    });

    res.json({ 
      message: 'Base de datos actualizada exitosamente', 
      count: records.length,
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('Error procesando PDF:', error);
    res.status(500).json({ 
      error: error.message || 'Error al procesar el archivo PDF. Verifique el formato.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.ludopata.count();
    const lastLog = await prisma.systemLog.findFirst({
      orderBy: { lastPdfUpload: 'desc' }
    });
    
    res.json({
      totalRecords: count,
      lastUpdate: lastLog?.lastPdfUpload || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
