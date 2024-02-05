/* eslint-disable camelcase */
// /**
//  * Create a text progress bar
//  * @param {Number} value - The value to fill the bar
//  * @param {Number} maxValue - The max value of the bar
//  * @param {Number} size - The bar size (in letters)
//  * @return {String} - The bar
//  */
// export const progressBar = (value: number, maxValue: number, size: number) => {
//   const percentage = value / maxValue; // Calculate the percentage of the bar
//   const progress = Math.round(size * percentage); // Calculate the number of square caracters to fill the progress side.
//   const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.
//   const progressText = "█".repeat(progress); // Repeat is creating a string with progress * caracters in it
//   const emptyProgressText = "░".repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
//   const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

//   const bar = `<code>[${progressText}${emptyProgressText}]</code>${percentageText}`; // Creating the bar
//   return bar;
// };

export const progressBar = ({
  value,
  length = 40,
  vmin = 0,
  vmax = 1,
  progressive = false,
}: {
  value: number;
  length: number;
  vmin: number;
  vmax: number;
  progressive: boolean;
}): string => {
  // Block progression is 1/8
  const blocks = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
  const lsep = "▏";
  const rsep = "▕";

  // Normalize value
  const normalized_value =
    (Math.min(Math.max(value, vmin), vmax) - vmin) / Number(vmax - vmin);
  const v = normalized_value * length;
  const x = Math.floor(v); // integer part
  const y = v - x; // fractional part
  const index = Math.round(y * 8);

  const bar = Array.from({ length: x }, () => "█").join("") + blocks[index];
  const remaining = Array.from({ length: length - bar.length }, () => "░").join(
    "",
  );

  return `${lsep}${bar}${progressive ? "" : remaining}${rsep} ${Math.round(
    Math.round(normalized_value * 100 * 100) / 100,
  )}%`;
};
// let prevStr = "";
// for (let i = 0; i < 1000; i++) {
//   prevStr =
//     Array(prevStr.length).fill("\b").join("") +
//     progress({ value: i, vmin: 0, vmax: 999 });
//   process.stderr.write(prevStr);
// }

// prevStr = "";
// for (let i = 0; i < 1000; i++) {
//   prevStr =
//     Array(prevStr.length).fill("\b").join("") +
//     progress({ value: i, vmin: 0, vmax: 999, progressive: true });
//   process.stderr.write(prevStr);
// }
