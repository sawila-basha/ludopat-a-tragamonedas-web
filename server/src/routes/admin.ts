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

    // Deduplicate records by 'documento' to avoid unique constraint errors (PREPARE DATA BEFORE TRANSACTION)
    const uniqueRecordsMap = new Map();
    for (const record of records) {
        if (record.documento && !uniqueRecordsMap.has(record.documento)) {
            uniqueRecordsMap.set(record.documento, record);
        }
    }
    const uniqueRecords = Array.from(uniqueRecordsMap.values());
    console.log(`Original records: ${records.length}, Unique records: ${uniqueRecords.length}`);

    // Transaction: Delete all old, insert new, log upload
    await prisma.$transaction(async (tx) => {
      // 1. Delete old records
      await tx.ludopata.deleteMany({});

      // 2. Insert new records using createMany for performance
      if (uniqueRecords.length > 0) {
        // Process in chunks of 1000 to avoid any potential limits (though createMany handles this well)
        const BATCH_SIZE = 1000;
        for (let i = 0; i < uniqueRecords.length; i += BATCH_SIZE) {
          const batch = uniqueRecords.slice(i, i + BATCH_SIZE);
          await tx.ludopata.createMany({
            data: batch,
            skipDuplicates: true
          });
        }
      }

      // 3. Log system state
      await tx.systemLog.create({
        data: {
          pdfPath: req.file!.path,
          recordCount: uniqueRecords.length,
          lastPdfUpload: new Date()
        }
      });
    }, {
      maxWait: 10000, // 10s
      timeout: 60000  // 60s
    });

    res.json({ 
      message: 'Base de datos actualizada exitosamente', 
      count: uniqueRecords.length,
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
