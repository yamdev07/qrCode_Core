import { describe, it, expect } from 'vitest'
import { parseCardFields } from '../services/cardOcr.service'

describe('parseCardFields', () => {
  it('extracts Nom / Prénoms / Poste from a card-like OCR text', () => {
    const text = [
      'OFFICE NOTARIAL',
      'Me Layindé Fati LIADY',
      'CARTE PROFESSIONNELLE DE MISSION',
      'Nom : FASSINOU',
      'Prénoms : Diane',
      'Poste : Juriste Collaboratrice'
    ].join('\n')

    expect(parseCardFields(text)).toEqual({
      nom: 'FASSINOU',
      prenoms: 'Diane',
      poste: 'Juriste Collaboratrice'
    })
  })

  it('does not confuse "Prénoms" with "Nom"', () => {
    const text = 'Prénoms : Jean Pierre\nNom : DURAND'
    const fields = parseCardFields(text)
    expect(fields.nom).toBe('DURAND')
    expect(fields.prenoms).toBe('Jean Pierre')
  })

  it('tolerates missing accents and extra spaces', () => {
    const text = 'Nom :   KOFFI\nPrenoms:  Ama  \nPoste :  Comptable'
    expect(parseCardFields(text)).toEqual({
      nom: 'KOFFI',
      prenoms: 'Ama',
      poste: 'Comptable'
    })
  })

  it('returns empty strings when nothing matches', () => {
    expect(parseCardFields('texte sans libellés')).toEqual({
      nom: '',
      prenoms: '',
      poste: ''
    })
  })
})
