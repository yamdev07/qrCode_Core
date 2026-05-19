import { ref } from 'vue'
import { CameraError } from '@core/errors/AppError'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<string | null>(null)
  const facingMode = ref<'user' | 'environment'>('environment')

  let currentVideoElement: HTMLVideoElement | null = null

  async function start(videoElement: HTMLVideoElement): Promise<void> {
    error.value = null
    currentVideoElement = videoElement

    if (stream.value) {
      stop()
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode.value,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      stream.value = mediaStream
      videoElement.srcObject = mediaStream
      await videoElement.play()
      isActive.value = true
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Impossible d'accéder à la caméra : ${msg}`
      throw new CameraError(error.value, { originalError: err })
    }
  }

  function stop(): void {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    if (currentVideoElement) {
      currentVideoElement.srcObject = null
    }
    isActive.value = false
  }

  async function switchCamera(): Promise<void> {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    if (isActive.value && currentVideoElement) {
      await start(currentVideoElement)
    }
  }

  return {
    stream,
    isActive,
    error,
    start,
    stop,
    switchCamera
  }
}
