import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { EmblaOptionsType } from "embla-carousel";

const ImageCarousel = () => {
  const images = [
    { src: "/dubai.avif", alt: "Dubai" },
    { src: "/new-york-png-7.webp", alt: "New York" },
    { src: "/paris.webp", alt: "Paris" },
    { src: "/tokyo.webp", alt: "Tokyo" },
  ];

  const [api, setApi] = useState<any>(null);
  
  // Carousel options
  const options: EmblaOptionsType = {
    loop: true,
    align: "center",
    dragFree: false,
  };

  // Setup auto-rotation effect
  useEffect(() => {
    if (!api) return;
    
    const autoRotateInterval = setInterval(() => {
      api.scrollNext();
    }, 6500);
    
    return () => {
      clearInterval(autoRotateInterval);
    };
  }, [api]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Carousel 
        className="w-full" 
        opts={options}
        setApi={setApi}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4">
              <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl shadow-lg">
                <Image 
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {image.alt}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base drop-shadow-md">
                      Discover amazing destinations
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 size-12 bg-white/80 hover:bg-white shadow-lg border-0" />
        <CarouselNext className="right-4 size-12 bg-white/80 hover:bg-white shadow-lg border-0" />
      </Carousel>
    </div>
  );
};

export default ImageCarousel;