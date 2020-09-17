// limit value between min and max values
const limit = (value, min, max) => Math.max(Math.min(value, max), min);

// shorthands for math functions
const sq = (x) => Math.pow(x, 2);
const rt = (x) => Math.sqrt(x);

// boost a normalized (0 to 1) value in non-linear, "circular" way
// see comments below. middle values will be boosted more than extreme values.
export const boost = (x, knee = 0) => {
  // limit inputs
  x = limit(x, 0, 1);
  knee = limit(knee, 0.00001, 1);

  // find formula for center (x,y) of circle given 2 points and radius:
  // https://stackoverflow.com/questions/36211171/finding-center-of-a-circle-given-two-points-and-radius

  // set (x1,y1) and (x2,y2) to (0,0) and (1,1):
  // (x-0.5-0.5sqrt(2r^2-1))^2/r^2 + (y-0.5+0.5sqrt(2r^2-1))^2/r^2 = 1

  // graph the equation on desmos.com to understand what this boost func does:
  // \frac{\left(x-\ 0.5-0.5\sqrt{2r^{2}-1}\right)^{2}}{r^{2}}+\frac{\left(y-0.5+0.5\sqrt{2r^{2}-1}\right)^{2}}{r^{2}}=1\ \left\{0<x<1\right\}\ \left\{0<y<1\right\}

  // knee will determine radius:
  // 0% knee = infinite radius = straight line from (0,0) to (1,1)
  // 100% knee = radius of 1 = quarter circle from (0,0) to (1,1)
  const r = 1 / knee;

  // solve previous formula for x with WolframAlpha and simplify
  const a = rt(2 * sq(r) - 1);
  return (1 + rt(2) * rt(2 * x * a + sq(r) - a - 2 * sq(x) + 2 * x) - a) / 2;
};
