'use client';

import styles from './page.module.css';

const hight = 9;
const width = 9;
const Bomcount = 10;

//8方向
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const BomMap: number[][] = Array.from({ length: hight }, () =>
  Array.from({ length: width }, () => 0),
);

let bombsPlaced = 0;
while (bombsPlaced < Bomcount) {
  const randomY = Math.floor(Math.random() * hight);
  const randomX = Math.floor(Math.random() * width);

  if (BomMap[randomY][randomX] === 0) {
    BomMap[randomY][randomX] = 1;
    bombsPlaced++;
  }
}

export default function Home() {
  const clickHandler = (y: number, x: number): void => {
    console.log(`Cell clicked: (${y}, ${x})`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.BomMap}>
        {BomMap.map((row, y) => (
          <div key={`row-${y}`} className={styles.row}>
            {row.map((cellValue, x) => (
              <div
                key={`cell-${y}-${x}`}
                className={styles.cell}
                onClick={() => clickHandler(y, x)}
              >
                {cellValue}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* <button onClick={() => console.log('Button clicked')}>クリック（仮）</button> */}
    </div>
  );
}
