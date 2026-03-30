"use client"
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import './style.css';

export default function PhotographersSlider({photographers, PhotographerCard ,onViewProfile}) {
    
    const sliders=photographers?.map((photographer) => (
        <SwiperSlide className={`min-w-[230px] flex-1 rounded-t-lg !bg-transparent`}>
            <PhotographerCard {...photographer} onViewProfile={onViewProfile}  cardWidth="w-[239px]"/>
        </SwiperSlide>
    ));

    return(
    <div> 
        <Swiper
            slidesPerView={'auto'}
            loop={true}
            spaceBetween={20}
            className="mySwiper"
        > 
            {sliders}
        </Swiper>
    </div>
    )
}