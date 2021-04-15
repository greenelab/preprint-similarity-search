library(ggplot2)

bin_num = 65
g <- (
    ggplot(data_df, aes(x=dim1, y=dim2))
    + geom_bin2d(bins=bin_num)
    + theme(legend.position="left")
)
square_plot_df <- ggplot_build(g)$data[[1]]