// Ancien service Supabase Storage — remplacé par localCardStorage.service.ts
// Ce fichier redirige les imports vers le nouveau système (fichiers locaux + PHP API).

export {
  uploadCardToLocal as uploadCard,
  getCardDataFromServer as getCardData,
  buildCardViewUrl,
  getCardsList,
  getServerIp
} from '@modules/generator/services/localCardStorage.service'

/** URL publique factice (Supabase n'est plus utilisé). */
export function getPublicUrl(_path: string): string {
  return ''
}
