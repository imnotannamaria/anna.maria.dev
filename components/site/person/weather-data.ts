const CITY = { name: "Tamandaré", uf: "PE", lat: -8.76, lon: -35.1 }

export type WeatherReading = {
  city: string
  temperature: number
  feelsLike: number
  wind: number
  day: boolean

  sky: "clear" | "clouds" | "fog" | "rain" | "thunder"

  text: string
}

function readCode(code: number): Pick<WeatherReading, "sky" | "text"> {
  if (code === 0) return { sky: "clear", text: "clear" }
  if (code === 1) return { sky: "clear", text: "mostly clear" }
  if (code === 2) return { sky: "clouds", text: "partly cloudy" }
  if (code === 3) return { sky: "clouds", text: "overcast" }
  if (code <= 48) return { sky: "fog", text: "foggy" }
  if (code <= 57) return { sky: "rain", text: "drizzling" }
  if (code <= 67) return { sky: "rain", text: "raining" }
  if (code <= 82) return { sky: "rain", text: "raining on and off" }
  return { sky: "thunder", text: "stormy" }
}

export async function readWeather(): Promise<WeatherReading | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.search = new URLSearchParams({
    latitude: String(CITY.lat),
    longitude: String(CITY.lon),
    current: "temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m",
    timezone: "America/Recife",
  }).toString()

  try {
    const answer = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    })
    if (!answer.ok) return null
    const { current } = (await answer.json()) as {
      current: {
        temperature_2m: number
        apparent_temperature: number
        weather_code: number
        is_day: number
        wind_speed_10m: number
      }
    }
    return {
      city: `${CITY.name}, ${CITY.uf}`,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      wind: Math.round(current.wind_speed_10m),
      day: current.is_day === 1,
      ...readCode(current.weather_code),
    }
  } catch {
    return null
  }
}
