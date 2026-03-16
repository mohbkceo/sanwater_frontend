import { animate } from 'framer-motion';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react'

function CounterAnimator({from, to}) {
  
  const nodeRef = useRef();
  const [isVisible, setVisibilty] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if(entry.isIntersecting){
        setVisibilty(true);
        console.log(entry);
        observer.disconnect();
      }
    }, {
      threshold: 0.5
    })
    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }
  )
  useEffect(() => 
  {
    if(!isVisible) return;
    const node = nodeRef.current;
    const controls = animate(from, to, {
      duration: 1,
      onUpdate(value) {
        node.textContent = value.toFixed(0)
      }
    })
    return () => controls.stop()
  }, [isVisible, from, to]
  )
  return (
    <p ref={nodeRef} />
  )
}

export default CounterAnimator