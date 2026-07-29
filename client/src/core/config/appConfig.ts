/**
 * URL publique de l'application.
 *
 * Les QR codes encodent une adresse figée au moment de la génération : elle doit
 * donc être l'adresse publique du site, jamais celle du navigateur qui génère.
 * Utiliser window.location.origin produisait des QR pointant sur l'IP LAN du
 * poste (https://10.56.46.245:3000/...), morts dès qu'on change de réseau.
 *
 * En dev, VITE_PUBLIC_URL peut rester vide : on retombe sur l'origine courante
 * pour que les tests depuis un téléphone sur le même LAN fonctionnent encore.
 */
const configured = import.meta.env.VITE_PUBLIC_URL?.trim()

export const PUBLIC_BASE_URL = (configured || window.location.origin).replace(/\/+$/, '')

/** Construit une URL absolue publique à partir d'un chemin. */
export function publicUrl(path: string): string {
  return `${PUBLIC_BASE_URL}/${path.replace(/^\/+/, '')}`
}
