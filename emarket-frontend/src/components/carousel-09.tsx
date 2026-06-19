"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarouselWithThumbs({ images }: { images: string[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  React.useEffect(() => {
    if (images.length == 0) {
      images.push("/image-not-found.jpg");
    }
    console.log("images", images);
  }, [images]);

  const handleThumbClick = React.useCallback(
    (index: number) => { api?.scrollTo(index); },
    [api]
  );

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => ({ ...prev, [src]: true }));
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Carousel className="mx-20" setApi={setApi}>
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image}>
              <div className="relative h-[400px] w-full">
                {/* Skeleton hiện khi chưa load xong */}
                {!loadedImages[image] && (
                  <Skeleton className="absolute inset-0 rounded-xl" />
                )}
                <Image
                  alt="product image"
                  className={cn(
                    "h-[400px] w-full rounded-xl object-contain",
                    loadedImages[image] ? "opacity-100" : "opacity-0" // ẩn img khi đang load
                  )}
                  src={image}
                  width={500}
                  height={500}
                  onLoad={() => handleImageLoad(image)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Thumbnails */}
      <Carousel className="mt-4 w-full max-w-xs">
        <div className="mask-x-from-90%">
          <CarouselContent className="my-1 flex">
            {images.map((image, index) => (
              <CarouselItem
                className={cn(
                  "basis-1/4 cursor-pointer transition-opacity",
                  current === index + 1 ? "opacity-100" : "opacity-50"
                )}
                key={image}
                onClick={() => handleThumbClick(index)}
              >
                <div className="relative size-full aspect-square">
                  {!loadedImages[image] && (
                    <Skeleton className="absolute inset-0 rounded-xl" />
                  )}
                  <img
                    alt="product thumbnail"
                    className="size-full rounded-xl object-cover"
                    src={image}
                    onLoad={() => handleImageLoad(image)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}