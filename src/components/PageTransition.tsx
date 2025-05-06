// components/PageTransition.tsx
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative min-h-screen"
      >
        {/* Animasi maskot lompat */}
        <motion.img
          src="/assets/kucing-cuan.png"
          alt="Maskot Kucing Cuan"
          initial={{ x: -100, y: 0, rotate: -10, opacity: 0 }}
          animate={{
            x: [ -100, 0, 50, 100, 130, 150, 200, 250 ],
            y: [ 0, -10, 0, -8, 0, -5, 0, 0 ],
            rotate: [ -10, 0, 10, 0 ],
            opacity: [ 0, 1, 1, 1, 0 ]
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="w-20 h-20 absolute bottom-6 left-0 z-50 pointer-events-none"
        />

        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
