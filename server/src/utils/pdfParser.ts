const pdf = require('pdf-parse');

export interface LudopataRecord {
  numRegistro: string;
  personaInscrita: string;
  documento: string;
  contacto: string;
  ubigeo: string;
  foto: string;
  fechaPublicacion: string;
}

export const parseLudopatasPDF = async (buffer: Buffer): Promise<LudopataRecord[]> => {
  try {
    const data = await pdf(buffer);
    const text: string = data.text;
    
    if (!text || text.trim().length === 0) {
      console.warn("PDF parsing returned empty text. This might be a scanned document.");
      return [];
    }

    console.log(`PDF Parsed. Text length: ${text.length} characters.`);
    
    // Improved Heuristic Parser for Tabular Data
    // We normalize whitespace to single spaces to make regex matching reliable across lines
    const normalizedText = text.replace(/\s+/g, ' ');
    const records: LudopataRecord[] = [];

    // Regex Explanation:
    // 1. \b(\d{4,8})\b -> Capture Registration Number (4-8 digits), strict word boundary to avoid phone numbers
    // 2. \s+ -> Space separator
    // 3. ([A-ZÑÁÉÍÓÚ\s,.-]+?) -> Capture Name (Uppercase letters, spaces, commas, dots, dashes). NO digits, NO slashes.
    // 4. \s*(?:Dni|DNI|CE|C\.E\.|PASAPORTE|C\.I\.|RUC)\s* -> Match Document Type
    // 5. (\d{6,15}) -> Capture Document Number (6-15 digits)
    const recordRegex = /\b(\d{4,8})\b\s+([A-ZÑÁÉÍÓÚ\s,.-]+?)\s*(?:Dni|DNI|CE|C\.E\.|PASAPORTE|C\.I\.|RUC)\s*(\d{6,15})/g;
    
    let match;
    while ((match = recordRegex.exec(normalizedText)) !== null) {
      const numRegistro = match[1];
      const personaInscrita = match[2].trim();
      const documento = match[3];

      // Basic validation:
      // - Name must be reasonably long
      // - Document must be numeric and long enough
      // - Registration number should not look like a phone number (handled by regex length, but extra check is good)
      if (personaInscrita.length > 2 && documento.length >= 6) {
          
         // Try to extract Date (Fecha Publicacion) looking ahead in the text
         // We look for a date pattern dd/mm/yyyy in the next 100 characters
         const lookAheadText = normalizedText.substring(recordRegex.lastIndex, recordRegex.lastIndex + 200);
         const dateMatch = lookAheadText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
         let fechaPublicacion = new Date().toISOString().split('T')[0];
         
         if (dateMatch) {
             // Validate date is reasonable (e.g. year > 2000)
             const year = parseInt(dateMatch[3]);
             if (year >= 2000 && year <= 2030) {
                 fechaPublicacion = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`; // YYYY-MM-DD
             }
         }

         records.push({
          numRegistro: numRegistro,
          personaInscrita: personaInscrita,
          documento: documento,
          contacto: '', // Cannot reliably extract without structured data
          ubigeo: '', // Cannot reliably extract without structured data
          foto: '', // Cannot extract images with text-only parser
          fechaPublicacion: fechaPublicacion
        });
      }
    }
    
    console.log(`Extracted ${records.length} records from text.`);
    
    return records;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF");
  }
};
