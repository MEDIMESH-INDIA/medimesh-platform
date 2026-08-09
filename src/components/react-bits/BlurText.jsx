import { useRef, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';

const BlurText = ({
  text,
  delay = 200,
  className = '',
}) => {
  const words = text.split(' ');
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
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const springs = useSprings(
    words.length,
    words.map((_, i) => ({
      from: { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,5px,0)' },
      to: inView
        ? { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' }
        : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,5px,0)' },
      delay: i * delay,
    }))
  );

  return (
    <p ref={ref} className={`inline-block ${className}`}>
      {springs.map((props, index) => (
        <animated.span
          key={index}
          style={props}
          className="inline-block will-change-transform will-change-filter will-change-opacity pr-[0.3em]"
        >
          {words[index] === 'guesswork.' ? (
            <span className="text-primary italic font-serif relative">
              {words[index]}
              <span className="absolute -inset-1 bg-primary/10 blur-xl rounded-full -z-10 animate-pulse"></span>
            </span>
          ) : (
            words[index]
          )}
        </animated.span>
      ))}
    </p>
  );
};

export default BlurText;
