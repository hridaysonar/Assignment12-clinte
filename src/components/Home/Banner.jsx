import React, { useState } from 'react'; // Import useState
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Clock, Globe, Handshake, Users, Scale, Heart } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const slides = [
    {
        image: 'https://i.pinimg.com/736x/fe/c1/cf/fec1cf72dac0760b5e8e380bcb4a2188.jpg',
        title: 'Secure Your Tomorrow Today',
        time: '24/7 Online Support',
        location: 'Global | Shariah-Compliant',
        opening: 'Easy Online Enrollment',
        startingPoint: 'Instant Coverage Approval',
        method: 'Built on Trust & Transparency',
        buttonLabel: 'Get a Free Quote',
    },
    {
        image: 'https://i.pinimg.com/736x/ca/95/57/ca9557b4571252daad1a527137fddfbb.jpg',
        title: 'Family Protection the Halal Way',
        time: 'Flexible Monthly Plans',
        location: 'Worldwide Accessibility',
        opening: 'Zero Interest Policy',
        startingPoint: 'Begin in 2 Minutes',
        method: 'Ethical | Transparent | Mutual',
        buttonLabel: 'Explore Takaful Plans',
    },
    {
        image: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=1500&q=80',
        title: 'Peace of Mind, Powered by Faith',
        time: 'Real-Time Claim Assistance',
        location: 'Digital Platform',
        opening: 'Trusted by Thousands',
        startingPoint: 'Start with Consultation',
        method: 'Mutual Support System',
        buttonLabel: 'Join Now',
    },
];

const BannerSlider = () => {
    // State to keep track of the active slide index
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] relative mt-6 sm:mt-10">
            <style>
                {`
                    .swiper-pagination-bullet {
                        background: #14b8a6;
                        opacity: 0.7;
                    }
                    .swiper-pagination-bullet-active {
                        background: #059669;
                        opacity: 1;
                    }
                    .swiper-button-prev, .swiper-button-next {
                        color: #14b8a6;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        transition: background 0.3s;
                    }
                    .swiper-button-prev:hover, .swiper-button-next:hover {
                        background: rgba(255, 255, 255, 0.4);
                    }
                    .swiper-button-prev:after, .swiper-button-next:after {
                        font-size: 20px;
                    }
                `}
            </style>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={true}
                pagination={{ clickable: true }}
                navigation
                className="h-full rounded-3xl overflow-hidden"
                // Update activeIndex state when slide changes
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
                {slides.map((slide, idx) => (
                    <SwiperSlide key={idx}>
                        <motion.div
                            className="w-full h-full bg-cover bg-center flex items-center justify-center relative"
                            style={{ backgroundImage: `url(${slide.image})` }}
                            // Initial animation only on mount, not on every slide change
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 5 }}
                        >
                            <div className="absolute inset-0 bg-black/50" />
                            {/* Use AnimatePresence to ensure exit animations work if needed, though here mainly for re-mounting Typewriter */}
                            <AnimatePresence mode='wait'>
                                {activeIndex === idx && ( // Only render and animate if it's the active slide
                                    <motion.div
                                        key={idx} // Add key for AnimatePresence to track
                                        className="relative bg-white/90 backdrop-blur-md mx-4 sm:mx-6 md:mx-8 p-4 sm:p-6 md:p-8 rounded-2xl lg:w-10/12 xl:w-8/12 text-black border border-white/20 shadow-2xl transition duration-300 hover:ring-2 hover:ring-teal-400 space-y-4 sm:space-y-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }} // Optional: Animate out
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 text-black text-xl sm:text-2xl md:text-3xl font-extrabold">
                                            <Heart className="text-teal-500 w-6 h-6 sm:w-8 sm:h-8" />
                                            <h2>
                                                {/* Only activate Typewriter for the current active slide */}
                                                <Typewriter
                                                    words={[slide.title]}
                                                    loop={1} // Set loop to 1 so it runs once per activation
                                                    cursor
                                                    cursorStyle="|"
                                                    typeSpeed={60}
                                                    deleteSpeed={40}
                                                    delaySpeed={1000}
                                                // onLoopDone={() => console.log('Typewriter done')} // For debugging
                                                />
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base md:text-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock className="text-yellow-400 w-5 h-5" />
                                                <span><strong>Availability:</strong> {slide.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="text-blue-400 w-5 h-5" />
                                                <span><strong>Coverage:</strong> {slide.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Handshake className="text-red-400 w-5 h-5" />
                                                <span><strong>Enrollment:</strong> {slide.opening}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="text-purple-400 w-5 h-5" />
                                                <span><strong>Community:</strong> {slide.startingPoint}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Scale className="text-green-400 w-5 h-5" />
                                                <span><strong>Ethics:</strong> {slide.method}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Heart className="text-pink-400 w-5 h-5" />
                                                <span><strong>Values:</strong> Mutual Care & Support</span>
                                            </div>
                                        </div>

                                        <p className="mt-3 sm:mt-4 text-black/90 font-medium leading-relaxed text-sm sm:text-base">
                                            We believe in protecting lives the halal way — with transparency, fairness, and faith-based integrity. Join our Takaful system to secure your future and your family.
                                        </p>

                                        <motion.button
                                            className="mt-3 sm:mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
                                            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(20, 184, 166, 0.5)' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {slide.buttonLabel}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default BannerSlider;