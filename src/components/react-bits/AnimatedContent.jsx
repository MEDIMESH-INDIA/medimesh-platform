import { useRef, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedContent = ({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  config = { tension: 50, friction: 25 },
  initialOpacity = 0,
  animateOpacity = 1,
  scale = 1,
  threshold = 0.1,
  delay = 0,
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const directions = {
    vertical: 'Y',
    horizontal: 'X',
  };

  const springProps = useSpring({
    from: {
      transform: `translate${directions[direction]}(${
        reverse ? `-${distance}px` : `${distance}px`
      }) scale(${scale})`,
      opacity: initialOpacity,
    },
    to: inView
      ? { transform: `translate${directions[direction]}(0px) scale(1)`, opacity: animateOpacity }
      : {
          transform: `translate${directions[direction]}(${
            reverse ? `-${distance}px` : `${distance}px`
          }) scale(${scale})`,
          opacity: initialOpacity,
        },
    config,
    delay,
  });

  return (
    <animated.div ref={ref} style={springProps}>
      {children}
    </animated.div>
  );
};

export default AnimatedContent;
