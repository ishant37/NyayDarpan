import React, { useMemo } from "react";
import Plot from "react-plotly.js";

// --- Height generators (unchanged) ---
const generateFlatTop = (size = 60) => {
  const heights = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const h = Math.sin(i / 15) * Math.cos(j / 15) * 1.2 + Math.random() * 0.2;
      row.push(h);
    }
    heights.push(row);
  }
  return heights;
};

const generateBumpy = (size = 60, intensity = 5) => {
  const heights = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const h = Math.sin(i / 6) * Math.cos(j / 6) * intensity + Math.random() * 1.2;
      row.push(h);
    }
    heights.push(row);
  }
  return heights;
};

// helper - invert Z values (flip along Z axis)
const invertMatrix = (mat) => mat.map(row => row.map(v => -v));

// helper - find min/max across many matrices
const findMinMax = (matrices) => {
  let min = Infinity;
  let max = -Infinity;
  matrices.forEach(mat => {
    mat.forEach(row => {
      row.forEach(v => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
  });
  return { min, max };
};

export default function Plot3DViewUpsideDownFixed() {
  const size = 60;

  const { x, y, zTopInv, zSoilInv, zClayInv, zRockInv, zWaterInv, zRange } = useMemo(() => {
    const x = Array.from({ length: size }, (_, i) => i);
    const y = Array.from({ length: size }, (_, i) => i);

    // original (positive-up) surfaces
    const zTop = generateFlatTop(size);
    const zSoil = generateBumpy(size, 4).map(row => row.map(v => v - 5));
    const zClay = generateBumpy(size, 6).map(row => row.map(v => v - 12));
    const zRock = generateBumpy(size, 8).map(row => row.map(v => v - 20));
    const zWater = zTop.map(row => row.map(() => -10));

    // invert all z-values (flip along the Z axis)
    const zTopInv = invertMatrix(zTop);
    const zSoilInv = invertMatrix(zSoil);
    const zClayInv = invertMatrix(zClay);
    const zRockInv = invertMatrix(zRock);
    const zWaterInv = invertMatrix(zWater);

    // compute a combined z-range so autorange isn't changing the orientation
    const { min, max } = findMinMax([zTopInv, zSoilInv, zClayInv, zRockInv, zWaterInv]);
    const padding = (max - min) * 0.12 || 2;
    const zRange = [min - padding, max + padding];

    return { x, y, zTopInv, zSoilInv, zClayInv, zRockInv, zWaterInv, zRange };
  }, [size]);

  // draw surfaces with inverted Z (they are physically flipped)
const data = [
  // WATER should be drawn FIRST so it appears visually at the TOP
  {
    
    type: "surface",
    x,
    y,
    z: zWaterInv,
    colorscale: "Blues",
    opacity: 0.45,
    showscale: false,
    name: "Water (inverted)",
  },
  {
    type: "surface",
    x,
    y,
    z: zTopInv,
    colorscale: [[0, "#3cb371"], [1, "#2e8b57"]],
    showscale: false,
    name: "Top (inverted)",
  },
  {
    type: "surface",
    x,
    y,
    z: zSoilInv,
    colorscale: [[0, "#d2b48c"], [1, "#c19a6b"]],
    showscale: false,
    opacity: 0.95,
    name: "Soil",
  },
  {
    type: "surface",
    x,
    y,
    z: zClayInv,
    colorscale: [[0, "#b87333"], [1, "#a0522d"]],
    showscale: false,
    opacity: 0.95,
    name: "Clay",
  },
  {
    type: "surface",
    x,
    y,
    z: zRockInv,
    colorscale: [[0, "#555555"], [1, "#888888"]],
    showscale: false,
    name: "Rock",
  },
];


  const layout = {
    title: "Upside-Down Land Block (Z-axis flipped)",
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 40 },
    scene: {
      // fix z-axis range so Plotly doesn't auto-rescale and 'undo' the flip
      zaxis: {
        title: "Z",
        autorange: false,
        range: zRange,
      },
      // look from the positive X/Y but from the "negative" Z side so visually it's upside-down
      camera: {
        eye: { x: 1.6, y: 1.6, z: -1.6 },
      },
      aspectmode: "auto",
    },
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
