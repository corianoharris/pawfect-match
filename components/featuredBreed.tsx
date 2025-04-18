import React from "react";
import Image from "next/image";


interface Breed
{
    breed: string
}


export default function FeaturedBreed(breed: Breed)
{
    return (
        <div className="flex flex-col items-baseline justify-center gap-4 bg-white  border-teal-400 border-2 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 w-max" >
            <h2 className="text-2xl text-center font-bold" aria-label="Breed of the day">Breed of the day:</h2>
            <h3 className="text-lg font-semibold text-teal-600" aria-label={breed.breed}>{breed.breed}</h3>
        </div>
    );
}   