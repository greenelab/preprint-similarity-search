// open a browser then open the console with f12
// type "data = ", then paste the full contents of plot-full.json
// then run the rest of these commands

// remove data points with 0 counts
data = data.filter((d) => d.count);
// rebuild object with only needed info
data = data.map((d) => ({
  // coordinates
  x: d.x,
  y: d.y,
  // # of papers, to string with comma
  papers: d.count,
  // journals
  journals: Object.entries(d.journal || {})
    // sort by paper count
    .sort((a, b) => b[1] - a[1])
    // cut list to top 5
    .slice(0, 5)
    // put sensible field names
    .map(([name, count]) => ({ name, count })),
  // principal components
  pcs: d.pc
    // sort by absolute value of score
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    // cut to top 5
    .slice(0, 5)
    // put sensible field names
    .map(({ pc, score }) => ({ name: pc, score }))
}));
// put filtered data into clipboard to be pasted into plot.json
copy(JSON.stringify(data));
