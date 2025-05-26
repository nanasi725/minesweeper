'use client';

import { useState } from 'react';
import styles from './page.module.css';




//8方向
const directions = [
  [-1,-1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];








export default function Home() {
  const [setBom,bomMap] = useState<number[][]>([
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
  ]);
  const [, ] = useState(0);

  const clickHandler = (x:number,y:number):void => {

    const  = structuredClone();
    [] += 1;
    ();
    (( + 1) % 14);
  };



  return (
    <div className={styles.container}>
      <div className={styles.back}
      >
        {/* style={{ backgroundPosition: `${-30 * }px` }} */}
      </div>
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
