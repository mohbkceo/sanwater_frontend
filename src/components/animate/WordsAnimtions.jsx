import * as React from "react"
import { AnimatePresence, motion, useInView} from "framer-motion"
import { cn } from "@/lib/utils"
 
export function RotateWords({text = "Rotate", words = ["Word 1", "Word 2", "Word 3"], wordsClassName, className}){
  const [index, setIndex] = React.useState(0)
 
  React.useEffect(() => {
        const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, 3000)

        return () => clearInterval(interval)
  }, [])

return (
 
<div className={cn("text-xl text-start sm:text-4xl font-bold tracking-tighter md:text-6xl  w-fit flex flex-col items-start jusitfy-start mx-auto gap-1.5", className)}>
  {text}{' '}
  <AnimatePresence mode="wait">
    <motion.h1
      className={cn('', wordsClassName)}
      key={words[index]}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.2 }}
    >
      {words[index]}
    </motion.h1>
  </AnimatePresence>
</div>
) }



 
export const BlurIn = ({ children, className }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.h2
      ref={ref}
      initial={{ filter: 'blur(20px)', opacity: 0 }}
      animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : {}}
      transition={{ duration: 1.2 }}
      className={className}
    >
      {children}
    </motion.h2>
  );
};