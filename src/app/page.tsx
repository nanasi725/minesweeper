'use client';

import { useState } from 'react';
import styles from './page.module.css';
const calcTotalpoint = (arr: number[], counter: number) => {
  const sum = arr.reduce((x, y) => x + y);
  return sum + counter;
};
const down = (n: number) => {
  if (n >= 0) {
    console.log(n);
    down(n - 1);
  }
};
down(10);
const sum1 = (n: number): number => {
  if (n === 0) {
    return n;
  } else {
    return n + sum1(n - 1);
  }
};
console.log(sum1(10));
const sum2 = (number1: number, number2: number): number => {
  return number2 === number1 ? number1 : number2 + sum2(number1, number2 - 1);
};
console.log(sum2(4, 10));

const sum3 = (s: number, x: number): number => {
  return ((s + x) * (x - s + 1)) / 2;
};
console.log(sum3(4, 10));
export default function Home() {
  const [samplepoints, setsamplepoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  console.log(samplepoints);
  const [sampleCounter, setsamplecounter] = useState(0);
  console.log(sampleCounter);
  const clickHandler = () => {
    const newsamplepoints = structuredClone(samplepoints);
    newsamplepoints[sampleCounter] += 1;
    setsamplepoints(newsamplepoints);
    setsamplecounter((sampleCounter + 1) % 14);
  };
  const totalpoint = calcTotalpoint(samplepoints, sampleCounter);
  console.log(totalpoint);

  return (
    <div className={styles.container}>
      <div
        className={styles.samplecell}
        style={{ backgroundPosition: `${-30 * sampleCounter}px` }}
      />
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
