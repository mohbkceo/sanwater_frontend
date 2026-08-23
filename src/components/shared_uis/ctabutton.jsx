import React from 'react'
import { Button } from '..'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SPRING_DEFAULT } from '@/lib/springs'

// Internal app routes go through react-router's <Link> for instant
// client-side transitions — a plain <a href="/products"> forces a full
// page reload, which is the single biggest "kill latency" violation an
// app can make (apple-design-skill.md §1). Same-page anchors (#section)
// and external/absolute URLs still need a real <a>.
function isInternalRoute(href) {
  return typeof href === 'string' && href.startsWith('/');
}

function CtaButton({href, label, icon, className, ...props}) {
  const content = <>{label}{icon}</>;

  return (
    <motion.div whileTap={{ scale: 0.96 }} transition={SPRING_DEFAULT} className={cn(className?.includes("w-full") ? "w-full" : "inline-block")}>
     <Button
              {...props}
              asChild
              size="lg"
              className={cn("group bg-black rounded-full px-8 py-6 text-base w-full ", className)}
            >
              {isInternalRoute(href) ? (
                <Link to={href}>{content}</Link>
              ) : (
                <a href={href}>{content}</a>
              )}
    </Button>
    </motion.div>
  )
}

export default CtaButton
