import React from "react";
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
    const { language, changeLanguage, t } = useLanguage();
    return (
        <div className="pt-20 pb-20 flex flex-col items-center justify-center  px-6 text-center">

            {/* 404 */}
            <div className="relative mb-10">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[320px] h-[140px] bg-[#9fe9e3] rounded-[60%]"></div>
                </div>

                <h1 className="relative text-[120px] md:text-[150px] font-black italic text-black leading-none tracking-[-6px]">
                    404
                </h1>
            </div>

            {/* Title */}
            <h2 className="text-[34px] md:text-[42px] font-extrabold text-[#0f172a] mb-4">
                {t('notfound.title')}
            </h2>

            {/* Text */}
            <p className="max-w-[720px] text-[18px] md:text-[20px] leading-[1.8] text-[#334155]">
                {t('notfound.desc')}
            </p>
        </div>
    );
};

export default NotFound;