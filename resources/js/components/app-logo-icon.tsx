import { ImgHTMLAttributes } from 'react';
import emblem from '@/assets/Emblem_of_Tajikistan.svg'
export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img src={emblem} {...props}  alt={"Nishon"}/>
    );
}
