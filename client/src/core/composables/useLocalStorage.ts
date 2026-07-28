import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  let parsedValue = initialValue

  try {
    const storedValue = localStorage.getItem(key)
    if (storedValue !== null) {
      parsedValue = JSON.parse(storedValue)
    }
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
  }

  const data = ref<T>(parsedValue) as Ref<T>

  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error)
      }
    },
    { deep: true }
  )

  return data
}
