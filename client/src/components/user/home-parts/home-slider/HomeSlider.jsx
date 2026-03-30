"use client";

import "swiper/css";
import "swiper/css/pagination";
import "./style.css";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale } from "next-intl";


export default function HomeSlider({ banners }) {

  const locale = useLocale();
  const direction = locale === "en" ? "ltr" : "rtl";
  const options = { align: "center", loop: true, direction: direction };
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =  useDotButton(emblaApi);
  return (
    <section className="embla mt-10">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {banners.map((banner) => (
            <div className="embla__slide" key={banner.id}>
              <div
                className={`embla__slide__number rounded-lg h-[304px]  bg-no-repeat bg-cover bg-center`}
                style={{ backgroundImage: `url(${banner.image_url})` }}
                title={banner.title}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
