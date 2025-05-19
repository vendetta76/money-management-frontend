import { motion } from "framer-motion";
import { SVGProps } from "react";

export default function CatMascotAnimated(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={200}
      height={200}
      {...props}
    >
      {/* HEAD (STATIC BASE) */}
      <path
        d="M240 480C240 320 384 200 512 200C640 200 784 320 784 480C784 640 640 760 512 760C384 760 240 640 240 480Z"
        fill="#FFF4E3"
        stroke="#222"
        strokeWidth="16"
      />

      {/* LEFT EAR WIGGLE */}
      <motion.path
        d="M290 180 L260 100 L330 130 Z"
        fill="#F9AD6D"
        stroke="#222"
        strokeWidth="8"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        transform="translate(280, 150)"
      />

      {/* RIGHT EAR WIGGLE */}
      <motion.path
        d="M730 180 L760 100 L690 130 Z"
        fill="#8B5E3C"
        stroke="#222"
        strokeWidth="8"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        transform="translate(-280, 150)"
      />

      {/* LEFT EYE BLINK */}
      <motion.ellipse
        cx="410"
        cy="470"
        rx="12"
        ry="18"
        fill="#222"
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
      />

      {/* RIGHT EYE BLINK */}
      <motion.ellipse
        cx="610"
        cy="470"
        rx="12"
        ry="18"
        fill="#222"
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, repeatDelay: 3.4 }}
      />

      {/* MOUTH */}
      <path
        d="M480 520 Q512 550 544 520"
        stroke="#222"
        strokeWidth="8"
        fill="none"
      />

      {/* PAWS */}
      <path
        d="M380 700 Q390 680 420 670 Q450 660 470 675 Q490 690 500 700"
        stroke="#222"
        strokeWidth="12"
        fill="#FFF4E3"
      />

      <path
        d="M580 700 Q590 680 620 670 Q650 660 670 675 Q690 690 700 700"
        stroke="#222"
        strokeWidth="12"
        fill="#FFF4E3"
      />
    </svg>
  );
}
