import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Verify DNI
router.get('/verify/:dni', async (req, res) => {
  const { dni } = req.params;

  try {
    const ludopata = await prisma.ludopata.findFirst({
      where: {
        documento: dni,
      },
    });

    if (ludopata) {
      return res.json({ found: true, data: ludopata });
    } else {
      return res.json({ found: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar DNI' });
  }
});

export default router;
