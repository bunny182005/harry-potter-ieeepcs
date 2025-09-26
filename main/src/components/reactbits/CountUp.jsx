import React, { useState, useEffect } from 'react';

const CountUp = ({ 
  from = 0, 
  to = 100, 
  duration = 1, 
  direction = "up", 
  separator = "", 
  className = "" 
}) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const end = to;
    const totalDuration = duration * 1000; // Convert to milliseconds
    const increment = direction === "up" ? 1 : -1;
    const totalSteps = Math.abs(end - start);
    const stepDuration = totalDuration / totalSteps;

    if (totalSteps === 0) {
      setCount(end);
      return;
    }

    let current = start;
    const timer = setInterval(() => {
      if (direction === "up" && current < end) {
        current += Math.max(1, Math.ceil((end - current) / 10));
        if (current > end) current = end;
        setCount(current);
      } else if (direction === "down" && current > end) {
        current -= Math.max(1, Math.ceil((current - end) / 10));
        if (current < end) current = end;
        setCount(current);
      } else {
        clearInterval(timer);
      }
    }, stepDuration / 10);

    return () => clearInterval(timer);
  }, [from, to, duration, direction]);

  const formatNumber = (num) => {
    if (separator === ",") {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <span className={className}>
      {formatNumber(count)}
    </span>
  );
};

export default CountUp;