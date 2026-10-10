import Image from "next/image"
import { tileClass } from "@/components/site/tile"
import { readWeather } from "./weather-data"
import beach from "@/components/site/person/photos/beach.jpg"
import "./weather.css"

export async function Weather() {
  const weather = await readWeather()

  return (
    <section className={tileClass({ size: "sm" }, "st-weather h-full p-0")}>
      <div className="st-weather-photo">
        <Image
          src={beach}
          alt="The beach at dusk: calm sea, a small boat, and sand"
          fill
          sizes="(min-width: 940px) 520px, 100vw"
          className="object-cover object-[50%_65%]"
        />
        <div className="st-weather-caption">
          {weather ? (
            <p className="text-heading-lg font-serif">
              {weather.temperature}°
              <span className="text-mono-xs ml-2 font-mono opacity-90">{weather.text}</span>
            </p>
          ) : null}
          <h2 className="text-mono-xs font-mono tracking-widest uppercase opacity-90">
            {weather ? weather.city : "Tamandaré, PE"}
          </h2>
        </div>
      </div>
    </section>
  )
}
