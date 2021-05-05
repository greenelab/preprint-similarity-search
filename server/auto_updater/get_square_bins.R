library(ggplot2)

bin_width = 0.85
g <- (
    ggplot(data_df, aes(x=dim1, y=dim2))
    + geom_bin2d(binwidth=bin_width)
    + theme(legend.position="left")
)
square_plot_df <- ggplot_build(g)$data[[1]]