library(ggplot2)

bin_num <- 50
g <- (
    ggplot(data_df, aes(x=dim1, y=dim2))
    + geom_bin2d(bins=bin_num, binwidth=0.85)
    + theme(legend.position="left")
)
square_plot_df <- ggplot_build(g)$data[[1]]