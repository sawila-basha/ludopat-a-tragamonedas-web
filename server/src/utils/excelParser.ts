import * as XLSX from 'xlsx';
import { LudopataRecord } from './pdfParser';

export const parseLudopatasExcel = async (buffer: Buffer): Promise<LudopataRecord[]> => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get data as array of objects
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const records: LudopataRecord[] = [];

    // Helper to find the correct key in the row object
    const findKey = (row: any, searchTerms: string[]): string | undefined => {
      const keys = Object.keys(row);
      return keys.find(key => 
        searchTerms.some(term => key.toLowerCase().includes(term.toLowerCase()))
      );
    };

    for (const row of jsonData as any[]) {
      const numRegKey = findKey(row, ['num', 'reg', 'n°']);
      const personaKey = findKey(row, ['persona', 'nombre', 'inscrita']);
      const docKey = findKey(row, ['documento', 'dni', 'ce']);
      const contactoKey = findKey(row, ['contacto']);
      const ubigeoKey = findKey(row, ['ubigeo']);
      const fotoKey = findKey(row, ['foto']);
      const fechaKey = findKey(row, ['fec', 'fecha', 'publicacion']);

      const numRegistro = numRegKey ? String(row[numRegKey]).trim() : '';
      const personaInscrita = personaKey ? String(row[personaKey]).trim() : '';
      let documento = docKey ? String(row[docKey]).trim() : '';
      const contacto = contactoKey ? String(row[contactoKey]).trim() : '';
      const ubigeo = ubigeoKey ? String(row[ubigeoKey]).trim() : '';
      const foto = fotoKey ? String(row[fotoKey]).trim() : '';
      
      let fechaPublicacion = new Date().toISOString().split('T')[0];
      const fechaRaw = fechaKey ? row[fechaKey] : null;

      if (fechaRaw) {
        if (typeof fechaRaw === 'number') {
           // Excel serial date
           const dateInfo = XLSX.SSF.parse_date_code(fechaRaw);
           if (dateInfo) {
             fechaPublicacion = `${dateInfo.y}-${String(dateInfo.m).padStart(2, '0')}-${String(dateInfo.d).padStart(2, '0')}`;
           }
        } else {
           const fechaStr = String(fechaRaw).trim();
           // Try dd/mm/yyyy
           if (fechaStr.includes('/')) {
             const parts = fechaStr.split('/');
             if (parts.length === 3) {
               // Assuming dd/mm/yyyy
               fechaPublicacion = `${parts[2]}-${parts[1]}-${parts[0]}`;
             }
           } else {
               // Try yyyy-mm-dd or other formats
               const d = new Date(fechaStr);
               if (!isNaN(d.getTime())) {
                   fechaPublicacion = d.toISOString().split('T')[0];
               }
           }
        }
      }

      // Clean Documento (remove "DNI " prefix if present)
      const docMatch = documento.match(/(\d{6,15})/);
      if (docMatch) {
          documento = docMatch[1];
      }

      if (personaInscrita.length > 2 && documento.length >= 6) {
        records.push({
          numRegistro,
          personaInscrita,
          documento,
          contacto,
          ubigeo,
          foto,
          fechaPublicacion
        });
      }
    }

    console.log(`Extracted ${records.length} records from Excel.`);
    return records;

  } catch (error) {
    console.error("Error parsing Excel:", error);
    throw new Error("Failed to parse Excel file");
  }
};
