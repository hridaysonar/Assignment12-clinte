
import React from 'react';
import { Link } from 'react-router';

const SideLogo = () => {
    return (
        <Link
            to={'/'}
        >
            <div className='flex justify-center items-center bg-green-50 rounded-2xl px-2
       '

            >
                <div className='' >
                    <img
                        className='w-15 h-15'
                        src="https://res.cloudinary.com/dllg58q9a/image/upload/v1752924174/8618dd28436b10386a0a34cafad440af-removebg-preview_qy4qjr.png" alt="" />
                </div>
                <div>


                    <h1

                        className="-ml-2 text-2xl font-extrabold  bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 transition-all duration-300"
                    >

                        RibaCharo
                    </h1>

                </div>
            </div>
        </Link>
    );
};

export default SideLogo;