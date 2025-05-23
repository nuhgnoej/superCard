// components/DashboardSwiper.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
// 상단에 추가
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardSwiper({
  slides,
}: {
  slides: { title: string; content: React.ReactNode }[];
}) {
  return (
    <div className="relative">
      {/* <div className="bg-white/10 p-6 rounded-2xl border border-white/20"> */}
      <Swiper
        autoplay={{
          delay: 5000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        modules={[Navigation, Pagination, Autoplay]}
        pagination={{ clickable: true }}
        spaceBetween={20}
        className="w-full"
        navigation={{
          nextEl: ".swiper-next",
          prevEl: ".swiper-prev",
        }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="text-white text-lg font-bold mb-2">
              {slide.title}
            </div>
            {slide.content}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 이전 버튼 */}
      <button
        className="swiper-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 다음 버튼 */}
      <button
        className="swiper-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
        aria-label="다음 슬라이드"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}