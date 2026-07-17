import Tesseract from 'tesseract.js'
import { log } from '@core/logger/logger'

/** Champs extraits d'une image de carte. */
export type ExtractedCardFields = {
  nom: string
  prenoms: string
  poste: string
}

function cleanup(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[\s:：.-]+|[\s:：.-]+$/g, '')
    .trim()
}

/**
 * Extrait Nom / Prénoms / Poste d'un texte OCR en s'appuyant sur les
 * libellés de la carte ("Nom :", "Prénoms :", "Poste :").
 *
 * `prenoms` est cherché avant `nom` car le mot "Prénoms" contient "nom" ;
 * et `nom` est ancré en début de ligne pour ne pas capturer "Prénoms".
 */
export function parseCardFields(text: string): ExtractedCardFields {
  const grab = (re: RegExp): string => {
    const m = text.match(re)
    return m ? cleanup(m[1]) : ''
  }

  const prenoms = grab(/pr[ée]noms?\s*[:：]\s*(.+)/i)
  const nom = grab(/(?:^|\n)\s*nom\s*[:：]\s*(.+)/i)
  const poste = grab(/poste\s*[:：]\s*(.+)/i)

  return { nom, prenoms, poste }
}

/**
 * Reconnaît le texte d'une image (data URL) en français puis en extrait
 * les champs de la carte. La 1re exécution télécharge le modèle de langue.
 */
export async function extractCardFields(
  image: string
): Promise<ExtractedCardFields> {
  const { data } = await Tesseract.recognize(image, 'fra')
  const fields = parseCardFields(data.text)
  log.info(
    `OCR carte: nom="${fields.nom}" prenoms="${fields.prenoms}" poste="${fields.poste}"`
  )
  return fields
}
