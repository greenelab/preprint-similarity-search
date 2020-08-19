// helper script to consolidate and format the plot data

// open a browser and open the dev console with f12
// type "data = ", then paste the full contents of the input json file
// run the following commands and the output json will be put on the clipboard

newData = data
  // remove data points with 0 counts
  .filter(d => d.count)
  // rebuild object with only needed info
  .map(d => ({
    // coordinates
    x: d.x,
    y: d.y,
    // # of papers, to string with comma
    count: d.count,
    // journals
    journals: Object.entries(d.journal || {})
      // put sensible field names
      .map(([name, count]) => ({ name, count }))
      // sort by paper count
      .sort((a, b) => b.count - a.count)
      // cut list to top 5 to save space
      .slice(0, 5),
    // principal components
    pcs: d.pc
      // sort by absolute value of score
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      // put sensible field names
      .map(({ pc, score }) => ({ name: pc, score }))
  }));
// put filtered data into clipboard
copy(JSON.stringify(newData));
